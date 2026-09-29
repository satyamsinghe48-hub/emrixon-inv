import Link from "next/link";
import { notFound } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { ClientForm } from "@/components/clients/ClientForm";
import { Button } from "@/components/ui/Button";
import { getCurrentBusiness } from "@/lib/business/current";
import { archiveClient } from "@/app/dashboard/actions";
export const dynamic = "force-dynamic";
export default async function Page({params}:{params:Promise<{id:string}>}){const {id}=await params;const {business,supabase}=await getCurrentBusiness();if(!business)return notFound();const {data:client}=await supabase.from("clients").select("*").eq("id",id).eq("business_id",business.id).is("archived_at",null).maybeSingle();if(!client)return notFound();return <div className="mx-auto max-w-3xl"><Link href="/dashboard/clients" className="text-sm font-semibold text-[#087F78]">← Back to clients</Link><div className="mt-4 flex flex-wrap items-end justify-between gap-4"><div><h1 className="text-3xl font-bold">Edit client</h1><p className="mt-2 text-[#52636B]">Update contact information or archive this client.</p></div><form action={archiveClient}><input type="hidden" name="client_id" value={client.id}/><input type="hidden" name="business_id" value={business.id}/><Button type="submit" variant="secondary">Archive client</Button></form></div><Card className="mt-8 p-6 sm:p-8"><ClientForm businessId={business.id} client={client}/></Card></div>}
