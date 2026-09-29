"use client";
import { useActionState } from "react";
import { createBusiness, updateBusiness } from "@/app/dashboard/actions";
import { Button } from "@/components/ui/Button";

const initial = { ok: false, message: "" };

export function BusinessForm({ business, mode = "create" }: { business?: any; mode?: "create" | "edit" }) {
  const action = mode === "create" ? createBusiness : updateBusiness;
  const [state, formAction, pending] = useActionState(action, initial);
  return <form action={formAction} className="space-y-5">
    {mode === "edit" && <input type="hidden" name="business_id" value={business.id} />}
    <div><label className="mb-2 block text-sm font-semibold">Business name</label><input name="name" required defaultValue={business?.name ?? ""} className="field" placeholder="Your business name" /></div>
    <div className="grid gap-5 sm:grid-cols-2">
      <div><label className="mb-2 block text-sm font-semibold">Support email</label><input name="support_email" type="email" defaultValue={business?.support_email ?? ""} className="field" placeholder="hello@example.com" /></div>
      <div><label className="mb-2 block text-sm font-semibold">Website</label><input name="website" type="url" defaultValue={business?.website ?? ""} className="field" placeholder="https://example.com" /></div>
    </div>
    <div className="grid gap-5 sm:grid-cols-2">
      <div><label className="mb-2 block text-sm font-semibold">Default currency</label><input name="default_currency" maxLength={3} defaultValue={business?.default_currency ?? "USD"} className="field uppercase" /></div>
      <div><label className="mb-2 block text-sm font-semibold">Timezone</label><input name="timezone" defaultValue={business?.timezone ?? "UTC"} className="field" placeholder="Asia/Kolkata" /></div>
    </div>
    {state.message && <p className={`rounded-xl px-4 py-3 text-sm ${state.ok ? "bg-[#E8F7F4] text-[#087F78]" : "bg-red-50 text-red-700"}`}>{state.message}</p>}
    <Button type="submit" disabled={pending}>{pending ? "Saving…" : mode === "create" ? "Create workspace" : "Save changes"}</Button>
  </form>;
}
