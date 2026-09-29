"use client";
import { useActionState } from "react";
import { createClientRecord, updateClientRecord } from "@/app/dashboard/actions";
import { Button } from "@/components/ui/Button";
const initial = { ok: false, message: "" };
export function ClientForm({ businessId, client }: { businessId: string; client?: any }) {
  const action = client ? updateClientRecord : createClientRecord;
  const [state, formAction, pending] = useActionState(action, initial);
  return <form action={formAction} className="space-y-5">
    <input type="hidden" name="business_id" value={businessId} />
    {client && <input type="hidden" name="client_id" value={client.id} />}
    <div className="grid gap-5 sm:grid-cols-2">
      <div><label className="mb-2 block text-sm font-semibold">Company name</label><input name="company_name" defaultValue={client?.company_name ?? ""} className="field" placeholder="Acme Studio" /></div>
      <div><label className="mb-2 block text-sm font-semibold">Contact name</label><input name="contact_name" defaultValue={client?.contact_name ?? ""} className="field" placeholder="Jane Smith" /></div>
    </div>
    <div className="grid gap-5 sm:grid-cols-2">
      <div><label className="mb-2 block text-sm font-semibold">Email</label><input name="email" required type="email" defaultValue={client?.email ?? ""} className="field" placeholder="jane@example.com" /></div>
      <div><label className="mb-2 block text-sm font-semibold">Phone <span className="font-normal text-[#52636B]">(optional)</span></label><input name="phone" defaultValue={client?.phone ?? ""} className="field" placeholder="+1 555 123 4567" /></div>
    </div>
    <div><label className="mb-2 block text-sm font-semibold">Notes <span className="font-normal text-[#52636B]">(optional)</span></label><textarea name="notes" rows={4} defaultValue={client?.notes ?? ""} className="field py-3" placeholder="Internal notes about this client" /></div>
    {state.message && <p className={`rounded-xl px-4 py-3 text-sm ${state.ok ? "bg-[#E8F7F4] text-[#087F78]" : "bg-red-50 text-red-700"}`}>{state.message}</p>}
    <Button type="submit" disabled={pending}>{pending ? "Saving…" : client ? "Save client" : "Add client"}</Button>
  </form>;
}
