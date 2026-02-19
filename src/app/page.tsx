
import { Hero } from "@/components/home/hero";
import { BusinessUnits } from "@/components/home/business-units";
import { Features } from "@/components/home/features";
import { Clients } from "@/components/home/clients";
import { ContactForm } from "@/components/home/contact-form";
import { readDb } from "@/lib/db";

export default async function Home() {
  const db = await readDb();

  return (
    <div className="flex flex-col min-h-screen">
      <Hero />
      <BusinessUnits units={db.businessUnits} />
      <Features />
      <Clients />
      <ContactForm />
    </div>
  );
}
