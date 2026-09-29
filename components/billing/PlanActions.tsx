"use client";
import { useState } from "react";
import { requestCancellation, requestPlanChange } from "@/app/dashboard/settings/billing/actions";

export function PlanChangeButton({ businessId, plan }: { businessId: string; plan: string }) {
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit() { setBusy(true); const fd = new FormData(); fd.set("business_id", businessId); fd.set("plan", plan); const r = await requestPlanChange(fd); setMessage(r.message ?? ""); setBusy(false); }
  return <div><button disabled={busy} onClick={submit} className="rounded-xl bg-[#087F78] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{busy ? "Checking…" : `Choose ${plan}`}</button>{message && <p className="mt-2 max-w-xs text-xs text-[#52636B]">{message}</p>}</div>;
}
export function CancelSubscriptionButton({ businessId }: { businessId: string }) {
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit() { setBusy(true); const fd = new FormData(); fd.set("business_id", businessId); const r = await requestCancellation(fd); setMessage(r.message ?? ""); setBusy(false); }
  return <div><button disabled={busy} onClick={submit} className="rounded-xl border border-[#087F78] px-4 py-2 text-sm font-semibold text-[#087F78] disabled:opacity-50">{busy ? "Saving…" : "Cancel at period end"}</button>{message && <p className="mt-2 text-xs text-[#52636B]">{message}</p>}</div>;
}
