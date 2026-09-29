import { getPlan, type PlanId } from "./config";
import type { SupabaseClient } from "@supabase/supabase-js";

type SubscriptionRow = {
  plan: string | null;
  status: string | null;
  provider: string | null;
  current_period_start?: string | null;
  current_period_end?: string | null;
  cancel_at_period_end?: boolean | null;
};

function isFuture(value: string | null | undefined) {
  return !!value && new Date(value).getTime() > Date.now();
}

/**
 * Resolve the plan that should actually grant entitlements right now.
 * Paid plan records are not trusted solely by their stored plan value.
 */
export function getEffectivePlanId(subscription: SubscriptionRow | null): PlanId {
  const requested = getPlan(subscription?.plan).id;
  if (requested === "free") return "free";

  const status = subscription?.status ?? "active";
  if (status === "active" || status === "trialing") return requested;
  if (status === "past_due") {
    // Keep access during the current period; the provider can later move the
    // subscription to expired/cancelled after its grace policy.
    return isFuture(subscription?.current_period_end) ? requested : "free";
  }
  if (status === "cancelled" && subscription?.cancel_at_period_end && isFuture(subscription?.current_period_end)) {
    return requested;
  }
  return "free";
}

export async function getBusinessSubscription(supabase: SupabaseClient, businessId: string) {
  const { data, error } = await supabase.from("subscriptions").select("*").eq("business_id", businessId).maybeSingle();
  if (error) throw new Error("Could not load billing status.");
  const effectivePlanId = getEffectivePlanId((data ?? null) as SubscriptionRow | null);
  return {
    subscription: data,
    plan: getPlan(effectivePlanId),
    planId: effectivePlanId,
    recordedPlanId: getPlan((data?.plan as PlanId | null) ?? "free").id,
  };
}
