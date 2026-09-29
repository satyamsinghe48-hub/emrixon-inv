"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { createInvoice, updateInvoice, type InvoiceActionState } from "@/app/dashboard/invoices/actions";

const initial: InvoiceActionState = { ok: false, message: "" };

function today() { return new Date().toISOString().slice(0, 10); }

export function InvoiceForm({ businessId, defaultCurrency, clients, invoice }: {
  businessId: string; defaultCurrency: string;
  clients: Array<{ id: string; company_name: string | null; contact_name: string | null; email: string }>;
  invoice?: any;
}) {
  const router = useRouter();
  const action = invoice ? updateInvoice : createInvoice;
  const [state, formAction, pending] = useActionState(action, initial);
  useEffect(() => { if (state.ok && state.id) router.push(`/dashboard/invoices/${state.id}`); }, [state.ok, state.id, router]);
  const issue = invoice?.issue_date ?? today();
  const due = invoice?.due_date ?? today();
  return <form action={formAction} className="space-y-6">
    <input type="hidden" name="business_id" value={businessId} />
    {invoice && <input type="hidden" name="invoice_id" value={invoice.id} />}
    <div className="grid gap-5 sm:grid-cols-2">
      <div><label className="mb-2 block text-sm font-semibold">Client</label><select name="client_id" required defaultValue={invoice?.client_id ?? ""} className="field"><option value="">Select a client</option>{clients.map(c => <option key={c.id} value={c.id}>{c.company_name || c.contact_name || c.email} — {c.email}</option>)}</select>{!clients.length && <p className="mt-2 text-xs text-[#52636B]">Add a client first.</p>}</div>
      <div><label className="mb-2 block text-sm font-semibold">Invoice number</label><input name="invoice_number" required maxLength={80} defaultValue={invoice?.invoice_number ?? ""} className="field" placeholder="INV-0001" /></div>
    </div>
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      <div><label className="mb-2 block text-sm font-semibold">Amount</label><input name="amount" required inputMode="decimal" min="0.01" step="0.01" type="number" defaultValue={invoice?.amount ?? ""} className="field" placeholder="1500.00" /></div>
      <div><label className="mb-2 block text-sm font-semibold">Currency</label><input name="currency" required maxLength={3} defaultValue={invoice?.currency ?? defaultCurrency} className="field uppercase" placeholder="USD" /></div>
      <div><label className="mb-2 block text-sm font-semibold">Issue date</label><input name="issue_date" required type="date" defaultValue={issue} className="field" /></div>
    </div>
    <div className="grid gap-5 sm:grid-cols-2">
      <div><label className="mb-2 block text-sm font-semibold">Due date</label><input name="due_date" required type="date" defaultValue={due} className="field" /></div>
      <div><label className="mb-2 block text-sm font-semibold">Payment URL <span className="font-normal text-[#52636B]">(optional)</span></label><input name="payment_url" type="url" defaultValue={invoice?.payment_url ?? ""} className="field" placeholder="https://pay.example.com/..." /></div>
    </div>
    <div><label className="mb-2 block text-sm font-semibold">Notes <span className="font-normal text-[#52636B]">(optional)</span></label><textarea name="notes" rows={5} defaultValue={invoice?.notes ?? ""} className="field py-3" placeholder="Payment terms or internal notes" /></div>
    {state.message && <p className={`rounded-xl px-4 py-3 text-sm ${state.ok ? "bg-[#E8F7F4] text-[#087F78]" : "bg-red-50 text-red-700"}`}>{state.message}</p>}
    <div className="flex flex-wrap gap-3"><Button type="submit" disabled={pending || !clients.length}>{pending ? "Saving…" : invoice ? "Save invoice" : "Create invoice"}</Button><Button href="/dashboard/invoices" variant="secondary">Cancel</Button></div>
  </form>;
}
