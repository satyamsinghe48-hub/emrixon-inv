import {AuthForm} from "@/components/auth/AuthForm";
export default function Forgot(){return <><h1 className="text-2xl font-bold">Reset your password</h1><p className="mt-2 text-sm text-[#52636B]">Enter your email and Supabase will send a reset link when configured.</p><div className="mt-7"><AuthForm mode="forgot"/></div></>}
