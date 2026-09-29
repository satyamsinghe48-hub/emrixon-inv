import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const requiredFiles = [
  "README.md",
  "SETUP.md",
  "DEPLOYMENT.md",
  "OPERATIONS.md",
  "SECURITY.md",
  "ENVIRONMENT.md",
  "DATABASE.md",
  "MIGRATIONS.md",
  "P10-FINAL-QA.md",
  "CHANGELOG.md",
  "package.json",
  ".env.example",
  "app/dashboard/analytics/page.tsx",
  "app/dashboard/settings/reminders/page.tsx",
  "app/dashboard/settings/reminders/actions.ts",
  "components/reminders/ReminderSettingsForm.tsx",
  "supabase/migrations/20260929050000_p10_final_release.sql",
];
const forbidden = [".env.local", "node_modules", ".next", ".vercel"];
const checks = [];
function pass(name, ok, detail = "") { checks.push({ name, ok, detail }); }

for (const file of requiredFiles) pass(`Required file: ${file}`, fs.existsSync(path.join(root, file)));
for (const item of forbidden) pass(`No release artifact: ${item}`, !fs.existsSync(path.join(root, item)));

const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
pass("Candidate package version", pkg.version === "1.0.0-candidate", `version=${pkg.version}`);
pass("P10 QA script registered", pkg.scripts?.["qa:p10"] === "node scripts/p10-release-qa.mjs");
pass("No npm lockfile claim without file", !fs.existsSync(path.join(root, "package-lock.json")), "Lockfile is documented as a build-environment limitation.");

const secretRegex = /(sk-[A-Za-z0-9]{20,}|re_[A-Za-z0-9]{20,}|service_role.{0,4}[A-Za-z0-9_-]{20,})/i;
const files = [];
function walk(dir) {
  for (const name of fs.readdirSync(dir)) {
    if (forbidden.includes(name) || name.startsWith(".git")) continue;
    const full = path.join(dir, name);
    const st = fs.statSync(full);
    if (st.isDirectory()) walk(full); else files.push(full);
  }
}
walk(root);
let leaks = 0;
for (const file of files) {
  const ext = path.extname(file);
  if (![".ts", ".tsx", ".js", ".mjs", ".json", ".md", ".sql", ".env"].includes(ext)) continue;
  const text = fs.readFileSync(file, "utf8");
  if (secretRegex.test(text)) { leaks += 1; }
}
pass("No obvious hardcoded provider/service secrets", leaks === 0, leaks ? `${leaks} file(s) matched the heuristic.` : "heuristic clean");

const p09 = fs.readFileSync(path.join(root, "scripts/p09-security-qa.mjs"), "utf8");
pass("P09 QA script retained", p09.includes("P09 static QA"));

const migration = fs.readFileSync(path.join(root, "supabase/migrations/20260929050000_p10_final_release.sql"), "utf8");
for (const needle of ["automation_enabled", "ensure_default_reminder_rules", "sync_invoice_reminder_jobs", "sync_business_reminder_schedules", "09:00:00", "b.automation_enabled = true"]) {
  pass(`P10 migration contains ${needle}`, migration.includes(needle));
}

const p09migration = fs.readFileSync(path.join(root, "supabase/migrations/20260929040000_p09_security_qa.sql"), "utf8");
pass("P09 migration uses unqualified constraint names", !p09migration.includes("drop constraint if exists public."));

const activeText = [
  "app/dashboard/analytics/page.tsx",
  "app/dashboard/settings/reminders/page.tsx",
  "app/dashboard/reminders/page.tsx",
  "app/(marketing)/about/page.tsx",
  "app/(marketing)/page.tsx",
].map((f) => fs.readFileSync(path.join(root, f), "utf8")).join("\n");
pass("Active UI does not label automation as future-only", !/future checkpoint|future automation/i.test(activeText));

const failed = checks.filter((c) => !c.ok);
for (const c of checks) console.log(`${c.ok ? "PASS" : "FAIL"}  ${c.name}${c.detail ? ` — ${c.detail}` : ""}`);
console.log(`P10 release QA: ${checks.length - failed.length}/${checks.length} checks passed`);
if (failed.length) process.exit(1);
