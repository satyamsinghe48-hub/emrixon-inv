-- P07 enum extension. Keep this migration separate so PostgreSQL can commit the new enum value before it is used by later migration statements.
alter type public.reminder_job_status add value if not exists 'dead_letter';
