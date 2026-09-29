export const BILLING_PLANS = {
  free: { id: "free", name: "Free", priceCents: 0, invoiceLimit: 3, customSchedules: false, analytics: false, teamMembers: 1, clientPortal: false, customTemplates: false, removeBranding: false, api: false },
  starter: { id: "starter", name: "Starter", priceCents: 900, invoiceLimit: 25, customSchedules: true, analytics: false, teamMembers: 1, clientPortal: false, customTemplates: false, removeBranding: false, api: false },
  pro: { id: "pro", name: "Pro", priceCents: 1900, invoiceLimit: 100, customSchedules: true, analytics: true, teamMembers: 5, clientPortal: true, customTemplates: true, removeBranding: true, api: false },
  agency: { id: "agency", name: "Agency", priceCents: 3900, invoiceLimit: 500, customSchedules: true, analytics: true, teamMembers: 25, clientPortal: true, customTemplates: true, removeBranding: true, api: true },
} as const;
export type PlanId = keyof typeof BILLING_PLANS;
export type SubscriptionStatus = "active" | "trialing" | "past_due" | "cancelled" | "expired" | "incomplete" | "paused";
export const PLAN_IDS = Object.keys(BILLING_PLANS) as PlanId[];
export function getPlan(plan: string | null | undefined) { return BILLING_PLANS[(plan as PlanId)] ?? BILLING_PLANS.free; }
