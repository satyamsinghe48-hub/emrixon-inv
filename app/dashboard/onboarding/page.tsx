import { Card } from "@/components/ui/Card";
import { BusinessForm } from "@/components/business/BusinessForm";
export default function Page(){return <div className="mx-auto max-w-2xl"><p className="text-sm font-bold uppercase tracking-[.14em] text-[#087F78]">First step</p><h1 className="mt-2 text-3xl font-bold">Set up your business</h1><p className="mt-2 text-[#52636B]">Create your workspace before adding clients and invoices.</p><Card className="mt-8 p-6 sm:p-8"><BusinessForm /></Card></div>}
