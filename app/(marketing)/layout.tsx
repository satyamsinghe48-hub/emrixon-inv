import {MarketingHeader} from "@/components/layout/MarketingHeader";
import {Footer} from "@/components/layout/Footer";
export default function Layout({children}:{children:React.ReactNode}){return <><MarketingHeader/>{children}<Footer/></>}
