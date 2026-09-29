"use client";
import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { cancelInvoice, markInvoicePaid, markInvoiceUnpaid, type InvoiceActionState } from "@/app/dashboard/invoices/actions";
const initial: InvoiceActionState = { ok: false, message: "" };
export function InvoiceActionForms({ invoiceId, status }: { invoiceId: string; status: string }) {
  const [paidState, paidAction, paidPending] = useActionState(markInvoicePaid, initial);
  const [unpaidState, unpaidAction, unpaidPending] = useActionState(markInvoiceUnpaid, initial);
  const [cancelState, cancelAction, cancelPending] = useActionState(cancelInvoice, initial);
  const message = paidState.message || unpaidState.message || cancelState.message;
  if (status === "paid") return <div className="flex flex-wrap gap-3"><form action={unpaidAction}><input type="hidden" name="invoice_id" value={invoiceId}/><Button type="submit" variant="secondary" disabled={unpaidPending}>{unpaidPending ? "Updating…" : "Mark unpaid"}</Button></form>{message && <p className="self-center text-sm text-[#52636B]">{message}</p>}</div>;
  if (status === "cancelled") return null;
  return <div className="flex flex-wrap gap-3"><form action={paidAction}><input type="hidden" name="invoice_id" value={invoiceId}/><Button type="submit" disabled={paidPending}>{paidPending ? "Updating…" : "Mark paid"}</Button></form><form action={cancelAction}><input type="hidden" name="invoice_id" value={invoiceId}/><Button type="submit" variant="secondary" disabled={cancelPending}>{cancelPending ? "Cancelling…" : "Cancel invoice"}</Button></form>{message && <p className="self-center text-sm text-[#52636B]">{message}</p>}</div>;
}
