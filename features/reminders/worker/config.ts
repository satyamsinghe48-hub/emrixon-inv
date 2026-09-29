export const REMINDER_WORKER_CONFIG = {
  batchSize: 20,
  maxAttempts: 4,
  processingLeaseMinutes: 15,
  retryDelaysMinutes: [5, 15, 60],
} as const;

export function getRetryDelayMinutes(attemptCount: number) {
  const index = Math.max(0, Math.min(attemptCount - 1, REMINDER_WORKER_CONFIG.retryDelaysMinutes.length - 1));
  return REMINDER_WORKER_CONFIG.retryDelaysMinutes[index];
}
