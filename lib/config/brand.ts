export const brand = {
  name: "EMRIXON Invoice Chaser",
  shortName: "Invoice Chaser",
  company: "EMRIXON STUDIO",
  tagline: "Get paid without the chasing.",
  website: "https://emrixonstudio.netlify.app",
  supportEmail: "support@example.com",
  logo: "/brand-mark.svg",
  favicon: "/brand-mark.svg",
  primaryColor: "#16B8A6",
  secondaryColor: "#087F78",
  midnight: "#0B1F2A",
  softAqua: "#E8F7F4",
  slate: "#52636B",
} as const;

export const plans = [
  { id:"free", name:"Free", price:"$0", period:"forever", description:"Try the workflow with a small invoice list." },
  { id:"starter", name:"Starter", price:"$9", period:"/month", description:"For freelancers and small service businesses." },
  { id:"pro", name:"Pro", price:"$19", period:"/month", description:"For growing businesses that need more control." },
  { id:"agency", name:"Agency", price:"$39", period:"/month", description:"For teams managing larger invoice volumes." },
] as const;
