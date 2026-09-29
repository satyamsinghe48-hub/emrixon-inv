import { z } from "zod";
export const reminderRuleSchema = z.object({ name: z.string().trim().min(1).max(100), offset_days: z.number().int().min(0).max(365), offset_type: z.enum(["before_due", "on_due", "after_due"]), template_id: z.string().trim().max(100).nullable().optional(), active: z.boolean().default(true) });
