import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { ClientForm } from "@/components/clients/ClientForm";
import { getCurrentBusiness } from "@/lib/business/current";
export default async function Page(){const {business}=await getCurrentBusiness();if(!business)return <Card className="p-8"><h1 className="text-2xl font-bold">Set up your business first</h1><Link className="mt-4 inline-block text-[#087F78]" href="/dashboard/onboarding">Go to setup →</Link></Card>;return <div className="mx-auto max-w-3xl"><Link href="/dashboard/clients" className="text-sm font-semibold text-[#087F78]">← Back to clients</Link><h1 className="mt-4 text-3xl font-bold">Add client</h1><p className="mt-2 text-[#52636B]">Store the contact details you will use for future invoice reminders.</p><Card className="mt-8 p-6 sm:p-8"><ClientForm businessId={business.id}/></Card></div>}
