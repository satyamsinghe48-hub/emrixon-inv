import { createClient } from "@/lib/supabase/server";

export async function getCurrentUser() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return { supabase, user: null };
  return { supabase, user: data.user };
}

export async function getCurrentBusiness() {
  const { supabase, user } = await getCurrentUser();
  if (!user) return { supabase, user: null, business: null };

  const { data: membership } = await supabase
    .from("business_members")
    .select("business_id, role, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!membership) return { supabase, user, business: null, role: null };

  const { data: business } = await supabase
    .from("businesses")
    .select("*")
    .eq("id", membership.business_id)
    .maybeSingle();

  return { supabase, user, business: business ?? null, role: membership.role };
}
