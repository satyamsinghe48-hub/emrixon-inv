# Migration Guide

Run migrations from `supabase/migrations/` in filename order on a fresh dedicated Invoice Chaser Supabase project.

## Release notes

P09 contained a PostgreSQL constraint-drop statement that used a schema-qualified constraint name. P10 corrects that source migration so a fresh migration run uses PostgreSQL-compatible syntax.

P10 adds the final V1 scheduling/release layer and replaces the earlier P07 worker claim function with an automation-aware version.

Do not skip earlier migrations or manually reorder them.
