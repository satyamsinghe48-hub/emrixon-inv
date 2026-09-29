const labels: Record<string, string> = { draft: "Draft", scheduled: "Scheduled", due: "Due", overdue: "Overdue", paid: "Paid", cancelled: "Cancelled" };
export function InvoiceStatusBadge({ status }: { status: string }) {
  const tone = status === "paid" ? "bg-[#E8F7F4] text-[#087F78]" : status === "overdue" ? "bg-red-50 text-red-700" : status === "cancelled" ? "bg-slate-100 text-[#52636B]" : status === "due" ? "bg-amber-50 text-amber-700" : "bg-[#f2f8f7] text-[#52636B]";
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${tone}`}>{labels[status] ?? status}</span>;
}
