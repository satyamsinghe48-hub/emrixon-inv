export type ReminderOffsetType = "before_due" | "on_due" | "after_due";
export type ReminderJobStatus = "pending" | "processing" | "sent" | "failed" | "cancelled" | "dead_letter";

export type ReminderRule = { id: string; business_id: string; name: string; offset_days: number; offset_type: ReminderOffsetType; template_id: string | null; active: boolean; created_at: string; updated_at: string };
export type ReminderJob = { id: string; business_id: string; invoice_id: string; reminder_rule_id: string; scheduled_for: string; status: ReminderJobStatus; attempt_count: number; sent_at: string | null; locked_at?: string | null; locked_by?: string | null; next_retry_at?: string | null; last_attempt_at?: string | null; dead_lettered_at?: string | null; last_error: string | null; created_at: string; updated_at: string };
