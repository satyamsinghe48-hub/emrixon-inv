import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { getCurrentBusiness } from "@/lib/business/current";
import { EmailSettingsForm } from "@/components/email/EmailSettingsForm";
import { TestEmailForm } from "@/components/email/TestEmailForm";
import { SYSTEM_EMAIL_TEMPLATES } from "@/features/email/templates/catalog";

export const dynamic = "force-dynamic";

export default async function Page() {
  const { business } = await getCurrentBusiness();
  if (!business) return <p>Business workspace not found.</p>;
  return <div className="space-y-6">
    <div><p className="text-sm font-bold uppercase tracking-[.14em] text-[#087F78]">Settings</p><h1 className="mt-2 text-3xl font-bold">Email system</h1><p className="mt-2 max-w-2xl text-[#52636B]">Configure transactional reminder emails, review templates, and inspect delivery activity.</p></div>
    <Card className="p-6"><h2 className="text-xl font-bold">Sender settings</h2><p className="mt-2 text-sm text-[#52636B]">Resend is the initial provider. Your server-side sender address comes from EMAIL_FROM.</p><div className="mt-6"><EmailSettingsForm senderName={business.email_sender_name || business.name} replyTo={business.email_reply_to || business.support_email || ""} /></div></Card>
    <Card className="p-6"><div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center"><div><h2 className="text-xl font-bold">Templates</h2><p className="mt-1 text-sm text-[#52636B]">Customize transactional copy using approved variables only.</p></div><Link href="/dashboard/settings/email/templates" className="font-semibold text-[#087F78]">Manage templates →</Link></div><div className="mt-5 grid gap-3 sm:grid-cols-2">{Object.entries(SYSTEM_EMAIL_TEMPLATES).map(([key, t]) => <div key={key} className="rounded-xl bg-[#E8F7F4] p-4"><p className="font-semibold">{t.name}</p><p className="mt-1 text-sm text-[#52636B]">{key}</p><TestEmailForm templateKey={key} /></div>)}</div></Card>
    <Card className="p-6"><div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center"><div><h2 className="text-xl font-bold">Email activity</h2><p className="mt-1 text-sm text-[#52636B]">Sent and failed transactional email records for this workspace.</p></div><Link href="/dashboard/settings/email/logs" className="font-semibold text-[#087F78]">View logs →</Link></div></Card>
  </div>;
}
