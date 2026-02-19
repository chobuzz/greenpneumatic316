
import { notFound } from "next/navigation"
import { fetchFromGoogleSheet } from "@/lib/sheets"
import { UnitHero } from "@/components/business-unit/unit-hero"
import { BusinessUnitMainContent } from "@/components/business-unit/business-unit-main-content"
import type { BusinessUnit, Category, Product } from "@/lib/db"

export default async function BusinessUnitPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const id = (await params).id

    // Fetch all required data from Google Sheets in parallel
    const [units, rawProducts, allCategories] = await Promise.all([
        fetchFromGoogleSheet('businessUnit') as Promise<any[]>,
        fetchFromGoogleSheet('product') as Promise<any[]>,
        fetchFromGoogleSheet('category') as Promise<Category[]>
    ]);

    const unitData = units.find((u) => u.id === id);

    if (!unitData) {
        notFound();
    }

    // Process products: filter and parse JSON fields
    const unitProducts: Product[] = rawProducts
        .map(p => {
            const parseField = (field: any) => {
                if (typeof field === 'string' && (field.startsWith('[') || field.startsWith('{'))) {
                    try { return JSON.parse(field); } catch (e) { return [field]; }
                }
                return Array.isArray(field) ? field : (field ? [field] : []);
            };

            const businessUnitIds = parseField(p.businessUnitIds || p.businessUnitId);
            const categoryIds = parseField(p.categoryIds || p.categoryId);

            return {
                ...p,
                businessUnitIds,
                categoryIds,
                images: typeof p.images === 'string' ? JSON.parse(p.images) : (p.images || []),
                models: typeof p.models === 'string' ? JSON.parse(p.models) : (p.models || []),
                specImages: typeof p.specImages === 'string' ? JSON.parse(p.specImages) : (p.specImages || [])
            };
        })
        .filter(p => p.businessUnitIds.includes(id) || (p as any).businessUnitId === id);

    const unit: BusinessUnit = {
        ...unitData,
        products: unitProducts
    };

    // Related categories for this unit
    const unitCategories = allCategories.filter(c => c.businessUnitId === unit.id);

    return (
        <div className="min-h-screen bg-white">
            <UnitHero name={unit.name} />
            <BusinessUnitMainContent unit={unit} unitCategories={unitCategories} />
        </div>
    )
}
