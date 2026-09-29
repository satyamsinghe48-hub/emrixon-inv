# P01 Security Notes

- No service-role key is used by the application.
- Browser uses Supabase publishable key only.
- Auth sessions use cookie-based SSR through `@supabase/ssr`.
- Protected dashboard uses server-side `getClaims()` verification.
- No invoice/customer/payment data is stored in P01.
- P02 must implement tenant schema and RLS before business data is introduced.
