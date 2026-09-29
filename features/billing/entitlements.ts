import { getPlan, type PlanId } from "./config";

export function canCreateInvoice(plan: PlanId, activeInvoiceCount: number) { return activeInvoiceCount < getPlan(plan).invoiceLimit; }
export function canUseCustomSchedules(plan: PlanId) { return getPlan(plan).customSchedules; }
export function canUseAnalytics(plan: PlanId) { return getPlan(plan).analytics; }
export function canUseTeamMembers(plan: PlanId, currentMembers = 1) { return currentMembers < getPlan(plan).teamMembers; }
export function canUseClientPortal(plan: PlanId) { return getPlan(plan).clientPortal; }
export function canCustomizeEmailTemplates(plan: PlanId) { return getPlan(plan).customTemplates; }
export function canRemoveBranding(plan: PlanId) { return getPlan(plan).removeBranding; }
export function canUseApi(plan: PlanId) { return getPlan(plan).api; }
export function canUseEmailReminders(_plan: PlanId) { return true; }
