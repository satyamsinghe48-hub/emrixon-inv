export const DEFAULT_REMINDER_RULES = [
  { name: "3 days before", offset_days: 3, offset_type: "before_due" as const, template_id: "invoice.due_soon" },
  { name: "Due today", offset_days: 0, offset_type: "on_due" as const, template_id: "invoice.due_today" },
  { name: "3 days overdue", offset_days: 3, offset_type: "after_due" as const, template_id: "invoice.overdue_3" },
  { name: "7 days overdue", offset_days: 7, offset_type: "after_due" as const, template_id: "invoice.overdue_7" },
  { name: "14 days overdue", offset_days: 14, offset_type: "after_due" as const, template_id: "invoice.final_reminder" },
] as const;
