/**
 * Database helpers for Stripe subscriptions and secure messaging
 */

import { and, desc, eq, gt, isNull, lt, sql } from "drizzle-orm";
import {
  ClinicianSubscription,
  InsertClinicianSubscription,
  InsertMessageThread,
  InsertSecureMessage,
  clinicianSubscriptions,
  messageThreads,
  secureMessages,
  stripeEvents,
} from "../drizzle/schema";
import { getDb } from "./db";

// ─── Subscription Helpers ──────────────────────────────────────────────────────

export async function getSubscriptionByUserId(userId: number): Promise<ClinicianSubscription | null> {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(clinicianSubscriptions).where(eq(clinicianSubscriptions.userId, userId)).limit(1);
  return rows[0] ?? null;
}

export async function getSubscriptionByStripeId(stripeSubscriptionId: string): Promise<ClinicianSubscription | null> {
  const db = await getDb();
  if (!db) return null;
  const rows = await db
    .select()
    .from(clinicianSubscriptions)
    .where(eq(clinicianSubscriptions.stripeSubscriptionId, stripeSubscriptionId))
    .limit(1);
  return rows[0] ?? null;
}

export async function upsertSubscription(data: InsertClinicianSubscription): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db
    .insert(clinicianSubscriptions)
    .values(data)
    .onDuplicateKeyUpdate({
      set: {
        stripeCustomerId: data.stripeCustomerId,
        stripeSubscriptionId: data.stripeSubscriptionId,
        stripePriceId: data.stripePriceId,
        status: data.status,
        trialEndAt: data.trialEndAt,
        currentPeriodStart: data.currentPeriodStart,
        currentPeriodEnd: data.currentPeriodEnd,
        canceledAt: data.canceledAt,
      },
    });
}

export async function updateSubscriptionStatus(
  stripeSubscriptionId: string,
  status: ClinicianSubscription["status"],
  extra?: Partial<InsertClinicianSubscription>
): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db
    .update(clinicianSubscriptions)
    .set({ status, ...extra })
    .where(eq(clinicianSubscriptions.stripeSubscriptionId, stripeSubscriptionId));
}

// ─── Stripe Event Idempotency ──────────────────────────────────────────────────

export async function isStripeEventProcessed(stripeEventId: string): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  const rows = await db.select().from(stripeEvents).where(eq(stripeEvents.stripeEventId, stripeEventId)).limit(1);
  return rows.length > 0;
}

export async function markStripeEventProcessed(stripeEventId: string, eventType: string): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.insert(stripeEvents).values({ stripeEventId, eventType }).onDuplicateKeyUpdate({ set: { eventType } });
}

// ─── Message Thread Helpers ────────────────────────────────────────────────────

export async function getOrCreateThread(clinicianId: number, clientId: number) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");

  const existing = await db
    .select()
    .from(messageThreads)
    .where(and(eq(messageThreads.clinicianId, clinicianId), eq(messageThreads.clientId, clientId)))
    .limit(1);

  if (existing[0]) return existing[0];

  const data: InsertMessageThread = { clinicianId, clientId };
  await db.insert(messageThreads).values(data);

  const created = await db
    .select()
    .from(messageThreads)
    .where(and(eq(messageThreads.clinicianId, clinicianId), eq(messageThreads.clientId, clientId)))
    .limit(1);
  return created[0]!;
}

export async function getThreadById(threadId: number) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(messageThreads).where(eq(messageThreads.id, threadId)).limit(1);
  return rows[0] ?? null;
}

export async function getClinicianThreads(clinicianId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(messageThreads)
    .where(eq(messageThreads.clinicianId, clinicianId))
    .orderBy(desc(messageThreads.lastMessageAt));
}

// ─── Message Helpers ───────────────────────────────────────────────────────────

export async function insertMessage(data: InsertSecureMessage) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");

  const [result] = await db.insert(secureMessages).values(data).$returningId();
  const id = (result as { id: number }).id;

  // Update thread lastMessageAt and unread count
  const unreadField =
    data.senderType === "clinician" ? { clientUnreadCount: sql`clientUnreadCount + 1` } : { clinicianUnreadCount: sql`clinicianUnreadCount + 1` };

  await db
    .update(messageThreads)
    .set({ lastMessageAt: new Date(), ...unreadField })
    .where(eq(messageThreads.id, data.threadId));

  return id;
}

export async function getThreadMessages(threadId: number, limit = 50, beforeId?: number) {
  const db = await getDb();
  if (!db) return [];

  const conditions = [eq(secureMessages.threadId, threadId), isNull(secureMessages.deletedAt)];
  if (beforeId) conditions.push(lt(secureMessages.id, beforeId));

  return db
    .select()
    .from(secureMessages)
    .where(and(...conditions))
    .orderBy(desc(secureMessages.createdAt))
    .limit(limit);
}

export async function markMessagesRead(threadId: number, readerType: "clinician" | "client") {
  const db = await getDb();
  if (!db) return;

  const senderType = readerType === "clinician" ? "client" : "clinician";

  await db
    .update(secureMessages)
    .set({ readAt: new Date() })
    .where(
      and(
        eq(secureMessages.threadId, threadId),
        eq(secureMessages.senderType, senderType),
        isNull(secureMessages.readAt),
        isNull(secureMessages.deletedAt)
      )
    );

  // Reset unread count
  const resetField = readerType === "clinician" ? { clinicianUnreadCount: 0 } : { clientUnreadCount: 0 };
  await db.update(messageThreads).set(resetField).where(eq(messageThreads.id, threadId));
}

export async function softDeleteMessage(messageId: number, deletedBy: number) {
  const db = await getDb();
  if (!db) return;
  await db
    .update(secureMessages)
    .set({ deletedAt: new Date(), deletedBy })
    .where(eq(secureMessages.id, messageId));
}

export async function purgeExpiredMessages() {
  const db = await getDb();
  if (!db) return 0;
  const now = new Date();
  const result = await db.delete(secureMessages).where(lt(secureMessages.purgeAfter, now));
  return (result as unknown as { affectedRows: number }).affectedRows ?? 0;
}

export async function getUnreadCount(threadId: number, readerType: "clinician" | "client"): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  const rows = await db.select().from(messageThreads).where(eq(messageThreads.id, threadId)).limit(1);
  if (!rows[0]) return 0;
  return readerType === "clinician" ? rows[0].clinicianUnreadCount : rows[0].clientUnreadCount;
}
