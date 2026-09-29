"use client";
import { useActionState } from "react";
import { updateEmailSettings } from "@/app/dashboard/settings/email/actions";
import { Button } from "@/components/ui/Button";

export function EmailSettingsForm({ senderName, replyTo }: { senderName: string; replyTo: string }) {
  const [state, action, pending] = useActionState(updateEmailSettings, { ok: false, message: "" });
  return <form action={action} className="space-y-5">
    <div><label className="text-sm font-semibold">Sender name</label><input name="email_sender_name" defaultValue={senderName} placeholder="Your business name" className="mt-2 w-full rounded-xl border border-[#d5e7e3] px-4 py-3" /></div>
    <div><label className="text-sm font-semibold">Reply-to email</label><input name="email_reply_to" type="email" defaultValue={replyTo} placeholder="billing@example.com" className="mt-2 w-full rounded-xl border border-[#d5e7e3] px-4 py-3" /><p className="mt-2 text-xs text-[#52636B]">If blank, the business support email or global EMAIL_REPLY_TO is used.</p></div>
    {state.message && <p className={`text-sm ${state.ok ? "text-[#087F78]" : "text-red-700"}`}>{state.message}</p>}
    <Button type="submit" disabled={pending}>{pending ? "Saving…" : "Save email settings"}</Button>
  </form>;
}
