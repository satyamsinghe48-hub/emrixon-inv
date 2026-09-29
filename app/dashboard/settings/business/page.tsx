import { Card } from "@/components/ui/Card";
import { BusinessForm } from "@/components/business/BusinessForm";
import { getCurrentBusiness } from "@/lib/business/current";
export const dynamic = "force-dynamic";
export default async function Page(){const {business}=await getCurrentBusiness();return <div className="mx-auto max-w-3xl"><h1 className="text-3xl font-bold">Business settings</h1><p className="mt-2 text-[#52636B]">These details are used across your workspace and future reminder emails.</p>{business ? <Card className="mt-8 p-6 sm:p-8"><BusinessForm business={business} mode="edit"/></Card> : <Card className="mt-8 p-6 sm:p-8"><BusinessForm/></Card>}</div>}
