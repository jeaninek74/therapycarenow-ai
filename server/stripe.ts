/**
 * Stripe Clinician Subscription Module
 * - 14-day free trial on NPI registration
 * - $49/month plan after trial
 * - Webhook handler for subscription lifecycle
 * - Paywall check for clinician portal access
 */

import Stripe from "stripe";

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY ?? "";
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET ?? "";

// Price: $49/month — create this in Stripe dashboard and set env var
export const CLINICIAN_MONTHLY_PRICE_ID = process.env.STRIPE_CLINICIAN_PRICE_ID ?? "";
export const TRIAL_DAYS = 14;
export const GRACE_PERIOD_DAYS = 3;

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    if (!STRIPE_SECRET_KEY) throw new Error("STRIPE_SECRET_KEY not configured");
    _stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: "2026-01-28.clover" });
  }
  return _stripe;
}

// ─── Customer Management ───────────────────────────────────────────────────────

export async function createStripeCustomer(params: {
  email: string;
  name: string;
  userId: number;
  npiNumber: string;
}): Promise<Stripe.Customer> {
  const stripe = getStripe();
  return stripe.customers.create({
    email: params.email,
    name: params.name,
    metadata: { userId: String(params.userId), npiNumber: params.npiNumber },
  });
}

// ─── Trial Subscription ────────────────────────────────────────────────────────

export async function createTrialSubscription(customerId: string): Promise<Stripe.Subscription> {
  const stripe = getStripe();

  // If no price ID configured, create a subscription in trial-only mode
  if (!CLINICIAN_MONTHLY_PRICE_ID) {
    // Return a mock subscription object for development
    const trialEnd = new Date();
    trialEnd.setDate(trialEnd.getDate() + TRIAL_DAYS);
    return {
      id: `sub_trial_${customerId}`,
      status: "trialing",
      trial_end: Math.floor(trialEnd.getTime() / 1000),
      current_period_start: Math.floor(Date.now() / 1000),
      current_period_end: Math.floor(trialEnd.getTime() / 1000),
    } as unknown as Stripe.Subscription;
  }

  return stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: CLINICIAN_MONTHLY_PRICE_ID }],
    trial_period_days: TRIAL_DAYS,
    payment_settings: { save_default_payment_method: "on_subscription" },
    trial_settings: { end_behavior: { missing_payment_method: "pause" } },
  });
}

// ─── Billing Portal ────────────────────────────────────────────────────────────

export async function createBillingPortalSession(
  customerId: string,
  returnUrl: string
): Promise<string> {
  const stripe = getStripe();
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });
  return session.url;
}

// ─── Checkout Session ──────────────────────────────────────────────────────────

export async function createCheckoutSession(params: {
  customerId: string;
  successUrl: string;
  cancelUrl: string;
}): Promise<string> {
  const stripe = getStripe();

  if (!CLINICIAN_MONTHLY_PRICE_ID) {
    throw new Error("STRIPE_CLINICIAN_PRICE_ID not configured. Please create a $49/month price in Stripe dashboard.");
  }

  const session = await stripe.checkout.sessions.create({
    customer: params.customerId,
    mode: "subscription",
    line_items: [{ price: CLINICIAN_MONTHLY_PRICE_ID, quantity: 1 }],
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    subscription_data: { trial_period_days: TRIAL_DAYS },
  });
  return session.url!;
}

// ─── Subscription Status Check ─────────────────────────────────────────────────

export type SubscriptionAccess = {
  hasAccess: boolean;
  status: string;
  trialDaysLeft: number | null;
  trialEndAt: Date | null;
  isTrialing: boolean;
  isPastDue: boolean;
  requiresPayment: boolean;
  message: string;
};

export function checkSubscriptionAccess(sub: {
  status: string;
  trialEndAt: Date;
  currentPeriodEnd: Date | null;
} | null): SubscriptionAccess {
  if (!sub) {
    return {
      hasAccess: false,
      status: "none",
      trialDaysLeft: null,
      trialEndAt: null,
      isTrialing: false,
      isPastDue: false,
      requiresPayment: true,
      message: "No subscription found. Please subscribe to access the Clinician Portal.",
    };
  }

  const now = new Date();
  const trialEnd = new Date(sub.trialEndAt);
  const trialDaysLeft = Math.max(0, Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

  if (sub.status === "trialing") {
    if (now <= trialEnd) {
      return {
        hasAccess: true,
        status: "trialing",
        trialDaysLeft,
        trialEndAt: trialEnd,
        isTrialing: true,
        isPastDue: false,
        requiresPayment: false,
        message: `Free trial — ${trialDaysLeft} day${trialDaysLeft !== 1 ? "s" : ""} remaining`,
      };
    }
    // Trial expired
    return {
      hasAccess: false,
      status: "trial_expired",
      trialDaysLeft: 0,
      trialEndAt: trialEnd,
      isTrialing: false,
      isPastDue: false,
      requiresPayment: true,
      message: "Your 14-day free trial has ended. Please subscribe to continue.",
    };
  }

  if (sub.status === "active") {
    return {
      hasAccess: true,
      status: "active",
      trialDaysLeft: null,
      trialEndAt: null,
      isTrialing: false,
      isPastDue: false,
      requiresPayment: false,
      message: "Active subscription",
    };
  }

  if (sub.status === "past_due") {
    // Grace period: allow access for GRACE_PERIOD_DAYS after period end
    const periodEnd = sub.currentPeriodEnd ? new Date(sub.currentPeriodEnd) : null;
    const gracePeriodEnd = periodEnd
      ? new Date(periodEnd.getTime() + GRACE_PERIOD_DAYS * 24 * 60 * 60 * 1000)
      : null;
    const inGrace = gracePeriodEnd ? now <= gracePeriodEnd : false;

    return {
      hasAccess: inGrace,
      status: "past_due",
      trialDaysLeft: null,
      trialEndAt: null,
      isTrialing: false,
      isPastDue: true,
      requiresPayment: true,
      message: inGrace
        ? "Payment past due — please update your payment method to avoid losing access."
        : "Access suspended due to failed payment. Please update your payment method.",
    };
  }

  if (sub.status === "canceled" || sub.status === "unpaid") {
    return {
      hasAccess: false,
      status: sub.status,
      trialDaysLeft: null,
      trialEndAt: null,
      isTrialing: false,
      isPastDue: false,
      requiresPayment: true,
      message: "Subscription canceled. Please resubscribe to access the Clinician Portal.",
    };
  }

  return {
    hasAccess: false,
    status: sub.status,
    trialDaysLeft: null,
    trialEndAt: null,
    isTrialing: false,
    isPastDue: false,
    requiresPayment: true,
    message: "Subscription inactive. Please contact support.",
  };
}

// ─── Webhook Verification ──────────────────────────────────────────────────────

export function constructWebhookEvent(payload: Buffer, signature: string): Stripe.Event {
  const stripe = getStripe();
  return stripe.webhooks.constructEvent(payload, signature, STRIPE_WEBHOOK_SECRET);
}
