import { ReactNode } from "react";
export function Card({children,className=""}:{children:ReactNode;className?:string}){return <div className={`rounded-2xl border border-[#dcebe8] bg-white shadow-[0_8px_30px_rgba(11,31,42,.05)] ${className}`}>{children}</div>}
