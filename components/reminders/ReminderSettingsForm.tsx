"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { setAutomationEnabled } from "@/app/dashboard/settings/reminders/actions";

export function AutomationToggle({ enabled }: { enabled: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function submit(next: boolean) {
    setBusy(true);
    const form = new FormData();
    form.set("enabled", String(next));
    const result = await setAutomationEnabled(form);
    setMessage(result.message ?? "");
    setBusy(false);
    if (result.ok) router.refresh();
  }

  return <div>
    <button type="button" onClick={() => submit(!enabled)} disabled={busy} className="rounded-xl bg-[#087F78] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
      {busy ? "Saving…" : enabled ? "Pause automation" : "Enable automation"}
    </button>
    {message && <p className="mt-2 text-xs text-[#52636B]">{message}</p>}
  </div>;
}
