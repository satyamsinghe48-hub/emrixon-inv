import type { PlanId, SubscriptionStatus } from "./config";

export type BillingSubscription = {
  plan: PlanId;
  status: SubscriptionStatus;
  provider: string;
  providerCustomerId: string | null;
  providerSubscriptionId: string | null;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
};

export interface BillingProvider {
  createCheckout(input: { businessId: string; plan: Exclude<PlanId, "free">; customerEmail?: string | null }): Promise<{ checkoutUrl: string; provider: string }>;
  cancelSubscription(providerSubscriptionId: string, atPeriodEnd: boolean): Promise<void>;
  changeSubscription(providerSubscriptionId: string, plan: Exclude<PlanId, "free">): Promise<void>;
  verifyWebhook(payload: string, signature: string): Promise<{ id: string; type: string; data: Record<string, unknown> }>;
}

/** P08 boundary. A live payment provider is intentionally not coupled to core entitlement logic. */
export function getBillingProvider(): BillingProvider {
  throw new Error("No live billing provider is configured. Configure a provider adapter before enabling paid checkout/webhooks.");
}
