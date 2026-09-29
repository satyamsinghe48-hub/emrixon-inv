import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const failures = [];
const checks = [];

function check(name, condition, detail = '') {
  checks.push({ name, passed: !!condition, detail });
  if (!condition) failures.push(`${name}${detail ? `: ${detail}` : ''}`);
}

function read(rel) { return fs.readFileSync(path.join(root, rel), 'utf8'); }

const envExample = read('.env.example');
check('No public service-role env name', !envExample.includes('NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY'));
check('Cron secret minimum guidance', envExample.includes('at least 24 characters'));
check('No local env file', !fs.existsSync(path.join(root, '.env.local')));
check('Security headers configured', fs.existsSync(path.join(root, 'next.config.mjs')) && read('next.config.mjs').includes('X-Content-Type-Options'));
check('Worker rejects short/missing cron secret', read('app/api/internal/reminders/worker/route.ts').includes('expected.length < 24'));
check('Worker uses timing-safe comparison', read('app/api/internal/reminders/worker/route.ts').includes('timingSafeEqual'));
check('Worker does not expose internal errors', !read('app/api/internal/reminders/worker/route.ts').includes('error: error instanceof Error ? error.message'));
check('Billing webhook requires signature', read('app/api/billing/webhook/route.ts').includes('x-billing-signature'));
check('Billing webhook does not expose raw verification errors', !read('app/api/billing/webhook/route.ts').includes('event.message'));
check('Subscription browser update policy removed', read('supabase/migrations/20260929040000_p09_security_qa.sql').includes('drop policy if exists subscriptions_admin_update'));
check('Reminder schema reconciliation migration exists', read('supabase/migrations/20260929040000_p09_security_qa.sql').includes('add column if not exists offset_type'));
check('Reminder template aliases fixed', read('features/email/render.ts').includes('friendly_reminder: "invoice.due_soon"'));
check('Effective billing plan enforcement exists', read('features/billing/subscription.ts').includes('getEffectivePlanId'));
check('Server invoice limit remains enforced', read('app/dashboard/invoices/actions.ts').includes('canCreateInvoice(planId'));
check('Client mutations derive active business', read('app/dashboard/actions.ts').includes('const businessId = membership?.business_id ?? ""'));

const forbiddenSecretNames = ['SUPABASE_SERVICE_ROLE_KEY=', 'RESEND_API_KEY=re_', 'CRON_SECRET=eyJ'];
for (const rel of ['app', 'components', 'features', 'lib']) {
  const base = path.join(root, rel);
  if (!fs.existsSync(base)) continue;
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, entry.name);
      if (entry.name === 'node_modules' || entry.name === '.next') continue;
      if (entry.isDirectory()) walk(p);
      else if (/\.(ts|tsx|js|mjs|cjs)$/.test(entry.name)) {
        const content = fs.readFileSync(p, 'utf8');
        for (const secret of forbiddenSecretNames) check(`No hardcoded secret (${path.relative(root, p)})`, !content.includes(secret));
      }
    }
  };
  walk(base);
}

console.log(`P09 static QA: ${checks.filter(c => c.passed).length}/${checks.length} checks passed`);
for (const c of checks) console.log(`${c.passed ? 'PASS' : 'FAIL'}  ${c.name}${c.detail ? ` — ${c.detail}` : ''}`);
if (failures.length) {
  console.error('\nFailures:\n' + failures.join('\n'));
  process.exit(1);
}
