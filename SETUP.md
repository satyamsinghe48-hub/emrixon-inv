# Setup

## 1. Clone/extract the project

Use the extracted source directory as the project root.

## 2. Create `.env.local`

Copy `.env.example` and fill in your dedicated Supabase, email and worker secrets.

Do not commit `.env.local`.

## 3. Supabase

Create a brand-new project for Invoice Chaser. Apply every migration under `supabase/migrations/` in filename order.

After migrations:

- enable/configure the required Auth settings
- configure the site URL and password-reset redirect
- verify RLS policies
- create a normal test account

## 4. Install and verify dependencies

Run:

```bash
npm install
npm run lint
npm run build
```

Commit the generated `package-lock.json` after `npm install`.

## 5. Local run

```bash
npm run dev
```

Open `/` and then create a test account.

## 6. External services

Configure Resend only after the sender identity is verified.

Configure `CRON_SECRET` with a long random value.

Do not enable paid checkout until a real, verified billing provider adapter is connected and its webhook signature flow is tested.
