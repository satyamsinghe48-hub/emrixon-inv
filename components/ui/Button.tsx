import Link from "next/link";
import { ReactNode } from "react";
export function Button({children,href,variant="primary",type="button",className="",disabled=false}:{children:ReactNode;href?:string;variant?:"primary"|"secondary"|"ghost";type?:"button"|"submit";className?:string;disabled?:boolean}){
 const cls=`inline-flex min-h-11 items-center justify-center rounded-xl px-5 text-sm font-semibold transition ${variant==="primary"?"bg-[#16B8A6] text-white hover:bg-[#087F78]":variant==="secondary"?"border border-[#d5e7e3] bg-white text-[#0B1F2A] hover:bg-[#E8F7F4]":"text-[#087F78] hover:bg-[#E8F7F4]"} ${disabled?"pointer-events-none opacity-50":""} ${className}`;
 return href?<Link href={href} className={cls}>{children}</Link>:<button type={type} disabled={disabled} className={cls}>{children}</button>;
}
