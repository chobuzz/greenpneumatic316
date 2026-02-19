
import { notFound } from "next/navigation"
import { readDb } from "@/lib/db"
import { UnitHero } from "@/components/business-unit/unit-hero"
import { BusinessUnitMainContent } from "@/components/business-unit/business-unit-main-content"

export default async function BusinessUnitPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const id = (await params).id
    const db = await readDb()
    const unit = db.businessUnits.find((u) => u.id === id)

    if (!unit) {
        notFound()
    }

    // Related categories for this unit
    const unitCategories = db.categories.filter(c => c.businessUnitId === unit.id)

    return (
        <div className="min-h-screen bg-white">
            <UnitHero name={unit.name} />
            <BusinessUnitMainContent unit={unit} unitCategories={unitCategories} />
        </div>
    )
}
