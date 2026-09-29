import { Card } from "@/components/ui/Card";
import { getCurrentBusiness } from "@/lib/business/current";
import { SYSTEM_EMAIL_TEMPLATES } from "@/features/email/templates/catalog";
import { TemplateEditor } from "@/components/email/TemplateEditor";

export const dynamic = "force-dynamic";

export default async function Page() {
  const { supabase, business } = await getCurrentBusiness();
  if (!business) return <p>Business workspace not found.</p>;
  const { data: custom } = await supabase.from("email_templates").select("template_key,name,subject,html_body,text_body,active").eq("business_id", business.id);
  const customMap = new Map((custom || []).map((item) => [item.template_key, item]));
  return <div className="space-y-6"><div><p className="text-sm font-bold uppercase tracking-[.14em] text-[#087F78]">Email</p><h1 className="mt-2 text-3xl font-bold">Templates</h1><p className="mt-2 text-[#52636B]">Edit the five reminder templates. JavaScript is not allowed in email bodies.</p></div>{Object.entries(SYSTEM_EMAIL_TEMPLATES).map(([key, system]) => { const item = customMap.get(key); return <Card key={key} className="p-6"><TemplateEditor templateKey={key} initial={{ name: item?.name || system.name, subject: item?.subject || system.subject, html_body: item?.html_body || system.html, text_body: item?.text_body || system.text }} /></Card>; })}</div>;
}
