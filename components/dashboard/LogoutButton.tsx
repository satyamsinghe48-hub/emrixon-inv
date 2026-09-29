"use client"; import {createClient} from "@/lib/supabase/client"; import {Button} from "@/components/ui/Button";
export function LogoutButton(){async function logout(){await createClient().auth.signOut();window.location.assign("/login")}return <button onClick={logout} className="min-h-11 rounded-xl px-4 text-sm font-semibold text-[#087F78] hover:bg-[#E8F7F4]">Log out</button>}
