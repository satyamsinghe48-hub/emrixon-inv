"use client";
import { useActionState } from "react";
import { sendTestEmail } from "@/app/dashboard/settings/email/actions";
import { Button } from "@/components/ui/Button";

export function TestEmailForm({ templateKey }: { templateKey: string }) {
  const [state, action, pending] = useActionState(sendTestEmail, { ok: false, message: "" });
  return <form action={action} className="mt-4 flex flex-col gap-3 sm:flex-row">
    <input type="hidden" name="template_key" value={templateKey} />
    <input name="recipient" type="email" required placeholder="your-email@example.com" className="min-h-11 flex-1 rounded-xl border border-[#d5e7e3] px-4" />
    <Button type="submit" disabled={pending}>{pending ? "Sending…" : "Send test"}</Button>
    {state.message && <p className={`text-sm ${state.ok ? "text-[#087F78]" : "text-red-700"}`}>{state.message}</p>}
  </form>;
}
