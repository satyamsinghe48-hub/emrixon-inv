import { createAdminClient } from "@/lib/supabase/admin";
import { sendReminderEmailForWorker } from "@/features/email/send";
import { REMINDER_WORKER_CONFIG, getRetryDelayMinutes } from "./config";

type ClaimedJob = {
  id: string;
  business_id: string;
  invoice_id: string;
  attempt_count: number;
};

function nextRetryAt(attemptCount: number) {
  const minutes = getRetryDelayMinutes(attemptCount);
  return new Date(Date.now() + minutes * 60_000).toISOString();
}

export async function processClaimedReminderJob(job: ClaimedJob) {
  const admin = createAdminClient();
  const result = await sendReminderEmailForWorker(job.id, job.business_id);

  if (result.ok) {
    return { id: job.id, outcome: "sent" as const };
  }

  const attempts = job.attempt_count;
  const permanent = result.permanent === true;
  const exhausted = attempts >= REMINDER_WORKER_CONFIG.maxAttempts;

  if (result.cancelled) {
    await admin.from("reminder_jobs").update({
      status: "cancelled",
      last_error: null,
      updated_at: new Date().toISOString(),
    }).eq("id", job.id).eq("business_id", job.business_id);
    return { id: job.id, outcome: "cancelled" as const };
  }

  if (permanent || exhausted) {
    await admin.from("reminder_jobs").update({
      status: "dead_letter",
      last_error: result.message,
      dead_lettered_at: new Date().toISOString(),
      next_retry_at: null,
      updated_at: new Date().toISOString(),
    }).eq("id", job.id).eq("business_id", job.business_id);
    return { id: job.id, outcome: "dead_letter" as const };
  }

  await admin.from("reminder_jobs").update({
    status: "failed",
    last_error: result.message,
    next_retry_at: nextRetryAt(attempts),
    updated_at: new Date().toISOString(),
  }).eq("id", job.id).eq("business_id", job.business_id);

  return { id: job.id, outcome: "retry" as const };
}

export async function runReminderWorker(workerId: string) {
  const admin = createAdminClient();
  const { data: jobs, error } = await admin.rpc("claim_due_reminder_jobs", {
    p_worker_id: workerId,
    p_limit: REMINDER_WORKER_CONFIG.batchSize,
    p_now: new Date().toISOString(),
    p_lease_minutes: REMINDER_WORKER_CONFIG.processingLeaseMinutes,
  });

  if (error) throw new Error(`Could not claim reminder jobs: ${error.message}`);

  const results = [];
  for (const job of (jobs ?? []) as ClaimedJob[]) {
    results.push(await processClaimedReminderJob(job));
  }

  return {
    workerId,
    claimed: jobs?.length ?? 0,
    results,
  };
}
