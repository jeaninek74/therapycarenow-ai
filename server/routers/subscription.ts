/**
 * Subscription & Secure Messaging tRPC Router
 */

import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { notifyOwner } from "../_core/notification";
import { decryptMessage, encryptMessage } from "../encryption";
import {
  checkSubscriptionAccess,
  createBillingPortalSession,
  createCheckoutSession,
  createStripeCustomer,
  createTrialSubscription,
  constructWebhookEvent,
} from "../stripe";
import {
  getOrCreateThread,
  getSubscriptionByUserId,
  getThreadById,
  getThreadMessages,
  insertMessage,
  isStripeEventProcessed,
  markMessagesRead,
  markStripeEventProcessed,
  purgeExpiredMessages,
  softDeleteMessage,
  updateSubscriptionStatus,
  upsertSubscription,
  getClinicianThreads,
} from "../subscriptionDb";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { logAuditEvent } from "../db";

// ─── Helpers ───────────────────────────────────────────────────────────────────

const clinicianOrAdminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "clinician" && ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Clinician or admin access required" });
  }
  return next({ ctx });
});

// ─── Subscription Router ───────────────────────────────────────────────────────

export const subscriptionRouter = router({
  // Get current subscription status
  getStatus: clinicianOrAdminProcedure.query(async ({ ctx }) => {
    const sub = await getSubscriptionByUserId(ctx.user.id);
    const access = checkSubscriptionAccess(
      sub
        ? {
            status: sub.status,
            trialEndAt: sub.trialEndAt,
            currentPeriodEnd: sub.currentPeriodEnd,
          }
        : null
    );
    return { subscription: sub, access };
  }),

  // Start trial subscription on clinician NPI registration
  startTrial: clinicianOrAdminProcedure.mutation(async ({ ctx }) => {
    const existing = await getSubscriptionByUserId(ctx.user.id);
    if (existing) {
      return { alreadyExists: true, subscription: existing };
    }

    const trialEndAt = new Date();
    trialEndAt.setDate(trialEndAt.getDate() + 14);

    let stripeCustomerId: string | undefined;
    let stripeSubscriptionId: string | undefined;

    try {
      const customer = await createStripeCustomer({
        email: ctx.user.email ?? `user-${ctx.user.id}@therapycarenow.ai`,
        name: ctx.user.name ?? "Clinician",
        userId: ctx.user.id,
        npiNumber: "pending",
      });
      stripeCustomerId = customer.id;

      const stripeSub = await createTrialSubscription(customer.id);
      stripeSubscriptionId = stripeSub.id;
    } catch (err) {
      // Stripe not configured — create local trial record only
      console.warn("[Stripe] Could not create Stripe subscription:", err);
    }

    await upsertSubscription({
      userId: ctx.user.id,
      stripeCustomerId: stripeCustomerId ?? null,
      stripeSubscriptionId: stripeSubscriptionId ?? null,
      status: "trialing",
      trialStartAt: new Date(),
      trialEndAt,
    });

    await logAuditEvent({
      userId: ctx.user.id,
      eventType: "clinician_trial_started",
      stateCode: undefined,
    });

    return { alreadyExists: false, trialEndAt };
  }),

  // Create Stripe Checkout session for paid subscription
  createCheckout: clinicianOrAdminProcedure
    .input(z.object({ returnUrl: z.string().url() }))
    .mutation(async ({ ctx, input }) => {
      const sub = await getSubscriptionByUserId(ctx.user.id);
      if (!sub?.stripeCustomerId) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "No Stripe customer found. Please start a trial first." });
      }

      try {
        const url = await createCheckoutSession({
          customerId: sub.stripeCustomerId,
          successUrl: `${input.returnUrl}/clinician/dashboard?subscribed=1`,
          cancelUrl: `${input.returnUrl}/clinician/subscribe`,
        });
        return { url };
      } catch (err) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: err instanceof Error ? err.message : "Failed to create checkout session",
        });
      }
    }),

  // Create Stripe Billing Portal session
  createPortal: clinicianOrAdminProcedure
    .input(z.object({ returnUrl: z.string().url() }))
    .mutation(async ({ ctx, input }) => {
      const sub = await getSubscriptionByUserId(ctx.user.id);
      if (!sub?.stripeCustomerId) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "No billing account found." });
      }

      try {
        const url = await createBillingPortalSession(sub.stripeCustomerId, input.returnUrl);
        return { url };
      } catch (err) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to open billing portal. Please try again.",
        });
      }
    }),

  // Check if clinician has portal access (used by paywall)
  checkAccess: clinicianOrAdminProcedure.query(async ({ ctx }) => {
    const sub = await getSubscriptionByUserId(ctx.user.id);
    return checkSubscriptionAccess(
      sub
        ? { status: sub.status, trialEndAt: sub.trialEndAt, currentPeriodEnd: sub.currentPeriodEnd }
        : null
    );
  }),
});

// ─── Secure Messaging Router ───────────────────────────────────────────────────

export const messagingRouter = router({
  // Get or create a thread between clinician and client
  getThread: clinicianOrAdminProcedure
    .input(z.object({ clientId: z.number().int().positive() }))
    .query(async ({ ctx, input }) => {
      const thread = await getOrCreateThread(ctx.user.id, input.clientId);

      await logAuditEvent({
        userId: ctx.user.id,
        eventType: "message_thread_accessed",
        stateCode: undefined,
      });

      return thread;
    }),

  // Get all threads for a clinician
  getThreads: clinicianOrAdminProcedure.query(async ({ ctx }) => {
    return getClinicianThreads(ctx.user.id);
  }),

  // Get messages in a thread (paginated, decrypted)
  getMessages: clinicianOrAdminProcedure
    .input(
      z.object({
        threadId: z.number().int().positive(),
        limit: z.number().int().min(1).max(100).default(50),
        beforeId: z.number().int().positive().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const thread = await getThreadById(input.threadId);
      if (!thread || thread.clinicianId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Thread not found or access denied" });
      }

      const messages = await getThreadMessages(input.threadId, input.limit, input.beforeId);

      // Decrypt messages server-side before returning
      const decrypted = messages.map((msg) => {
        const plaintext = decryptMessage({
          encryptedContent: msg.encryptedContent,
          iv: msg.iv,
          authTag: msg.authTag,
        });
        return {
          id: msg.id,
          threadId: msg.threadId,
          senderType: msg.senderType,
          senderId: msg.senderId,
          content: plaintext ?? "[Message unavailable]",
          readAt: msg.readAt,
          deletedAt: msg.deletedAt,
          purgeAfter: msg.purgeAfter,
          createdAt: msg.createdAt,
        };
      });

      // Mark as read
      await markMessagesRead(input.threadId, "clinician");

      return decrypted.reverse(); // chronological order
    }),

  // Send a message
  sendMessage: clinicianOrAdminProcedure
    .input(
      z.object({
        threadId: z.number().int().positive(),
        content: z.string().min(1).max(4000),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const thread = await getThreadById(input.threadId);
      if (!thread || thread.clinicianId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Thread not found or access denied" });
      }

      // Encrypt the message content
      const encrypted = encryptMessage(input.content);

      // Retention: purge after thread's retention policy (default 90 days)
      const purgeAfter = new Date();
      purgeAfter.setDate(purgeAfter.getDate() + thread.retentionDays);

      const messageId = await insertMessage({
        threadId: input.threadId,
        senderType: "clinician",
        senderId: ctx.user.id,
        encryptedContent: encrypted.encryptedContent,
        iv: encrypted.iv,
        authTag: encrypted.authTag,
        purgeAfter,
      });

      // HIPAA audit log — NO message content stored
      await logAuditEvent({
        userId: ctx.user.id,
        eventType: "secure_message_sent",
        stateCode: undefined,
      });

      return { messageId };
    }),

  // Delete a message (soft delete with audit trail)
  deleteMessage: clinicianOrAdminProcedure
    .input(z.object({ messageId: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      await softDeleteMessage(input.messageId, ctx.user.id);

      await logAuditEvent({
        userId: ctx.user.id,
        eventType: "secure_message_deleted",
        stateCode: undefined,
      });

      return { success: true };
    }),

  // Admin: purge expired messages (retention policy enforcement)
  purgeExpired: protectedProcedure.mutation(async ({ ctx }) => {
    if (ctx.user.role !== "admin") {
      throw new TRPCError({ code: "FORBIDDEN" });
    }
    const count = await purgeExpiredMessages();
      await logAuditEvent({
      userId: ctx.user.id,
      eventType: "messages_purged",
      stateCode: undefined,
    });
    return { purgedCount: count };
  }),
});

// ─── Stripe Webhook Handler (raw Express route, not tRPC) ─────────────────────

export async function handleStripeWebhook(
  rawBody: Buffer,
  signature: string
): Promise<{ received: boolean; error?: string }> {
  let event;
  try {
    event = constructWebhookEvent(rawBody, signature);
  } catch (err) {
    return { received: false, error: `Webhook signature verification failed: ${err}` };
  }

  // Idempotency check
  if (await isStripeEventProcessed(event.id)) {
    return { received: true };
  }

  const sub = event.data.object as unknown as {
    id: string;
    status: string;
    trial_end: number | null;
    current_period_start: number;
    current_period_end: number;
    canceled_at: number | null;
    customer: string;
  };

  switch (event.type) {
    case "customer.subscription.created":
    case "customer.subscription.updated": {
      const statusMap: Record<string, string> = {
        trialing: "trialing",
        active: "active",
        past_due: "past_due",
        canceled: "canceled",
        unpaid: "unpaid",
        incomplete: "incomplete",
        paused: "paused",
      };
      const mappedStatus = (statusMap[sub.status] ?? "incomplete") as
        | "trialing"
        | "active"
        | "past_due"
        | "canceled"
        | "unpaid"
        | "incomplete"
        | "paused";

      await updateSubscriptionStatus(sub.id, mappedStatus, {
        trialEndAt: sub.trial_end ? new Date(sub.trial_end * 1000) : undefined,
        currentPeriodStart: new Date(sub.current_period_start * 1000),
        currentPeriodEnd: new Date(sub.current_period_end * 1000),
        canceledAt: sub.canceled_at ? new Date(sub.canceled_at * 1000) : undefined,
      });

      if (sub.status === "past_due") {
        await notifyOwner({
          title: "Clinician Subscription Past Due",
          content: `Stripe subscription ${sub.id} is past due. Customer: ${sub.customer}`,
        });
      }
      break;
    }

    case "customer.subscription.deleted": {
      await updateSubscriptionStatus(sub.id, "canceled", {
        canceledAt: new Date(),
      });
      break;
    }

    case "invoice.payment_failed": {
      await notifyOwner({
        title: "Clinician Payment Failed",
        content: `Payment failed for subscription. Customer: ${sub.customer}`,
      });
      break;
    }
  }

  await markStripeEventProcessed(event.id, event.type);
  return { received: true };
}
