import type {Metadata} from "next"; import "./globals.css"; import {brand} from "@/lib/config/brand";
export const metadata:Metadata={title:{default:brand.name,template:`%s | ${brand.shortName}`},description:brand.tagline};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
