
import { Hero } from "@/components/home/hero";
import { BusinessUnits } from "@/components/home/business-units";
import { Features } from "@/components/home/features";
import { Clients } from "@/components/home/clients";
import { ContactForm } from "@/components/home/contact-form";
import { fetchFromGoogleSheet } from "@/lib/sheets";
import type { BusinessUnit } from "@/lib/db";

export default async function Home() {
  const units = await fetchFromGoogleSheet('businessUnit') as BusinessUnit[];

  return (
    <div className="flex flex-col min-h-screen">
      <Hero />
      <BusinessUnits units={units} />
      <Features />
      <Clients />
      <ContactForm />
    </div>
  );
}
