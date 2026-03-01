import { Hero } from "@/components/home/hero";
import { fetchFromGoogleSheet } from "@/lib/sheets";
import type { BusinessUnit } from "@/lib/db";
import dynamic from "next/dynamic";

const Features = dynamic(() => import("@/components/home/features").then(mod => mod.Features));
const Clients = dynamic(() => import("@/components/home/clients").then(mod => mod.Clients));
const ContactForm = dynamic(() => import("@/components/home/contact-form").then(mod => mod.ContactForm));

import { Suspense } from "react";
import { BusinessUnits, BusinessUnitsSkeleton } from "@/components/home/business-units";

async function BusinessUnitsWrapper() {
  const units = await fetchFromGoogleSheet('businessUnit') as BusinessUnit[];
  return <BusinessUnits units={units} />;
}

export default async function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Hero />
      <Suspense fallback={<BusinessUnitsSkeleton />}>
        <BusinessUnitsWrapper />
      </Suspense>
      <Features />
      <Clients />
      <ContactForm />
    </div>
  );
}
