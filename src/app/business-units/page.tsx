
"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowRight, Box, Zap, Pipette, Cylinder, ChevronRight } from "lucide-react"
import type { BusinessUnit, Category, Product } from "@/lib/db"
import { BusinessUnitsPageSkeleton } from "@/components/business-unit/business-units-skeleton"
import { UnitHero } from "@/components/business-unit/unit-hero"
import dynamic from "next/dynamic"

const BusinessUnitMainContent = dynamic(
    () => import("@/components/business-unit/business-unit-main-content").then(mod => mod.BusinessUnitMainContent),
    { loading: () => <BusinessUnitsPageSkeleton /> }
)

function BusinessUnitsContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const tabId = searchParams.get("tab")

    const [units, setUnits] = useState<BusinessUnit[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState<string>("")

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [unitsRes, categoriesRes, productsRes] = await Promise.all([
                    fetch("/api/business-units"),
                    fetch("/api/categories"),
                    fetch("/api/products")
                ])

                const [unitsData, categoriesData, productsData] = await Promise.all([
                    unitsRes.json(),
                    categoriesRes.json(),
                    productsRes.json()
                ])

                setUnits(unitsData)

                // Process categories similarly to products for robustness
                const processedCategories = (categoriesData || []).map((c: any) => {
                    const parseField = (field: any) => {
                        if (typeof field === 'string' && (field.startsWith('[') || field.startsWith('{'))) {
                            try { return JSON.parse(field); } catch (e) { return [field]; }
                        }
                        return Array.isArray(field) ? field : (field ? [field] : "");
                    };

                    const buId = parseField(c.businessUnitId);
                    const pId = parseField(c.parentId);

                    return {
                        ...c,
                        businessUnitId: Array.isArray(buId) ? buId[0] : buId,
                        parentId: Array.isArray(pId) ? pId[0] : pId
                    };
                });
                setCategories(processedCategories)

                // Process products logic similar to [id]/page.tsx
                const processedProducts = (productsData || []).map((p: any) => {
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
                        images: Array.isArray(p.images) ? p.images : (typeof p.images === 'string' ? JSON.parse(p.images) : []),
                        models: Array.isArray(p.models) ? p.models : (typeof p.models === 'string' ? JSON.parse(p.models) : []),
                        specImages: Array.isArray(p.specImages) ? p.specImages : (typeof p.specImages === 'string' ? JSON.parse(p.specImages) : [])
                    };
                });

                setProducts(processedProducts)

                // Set initial active tab
                if (tabId && unitsData.some((u: any) => u.id === tabId)) {
                    setActiveTab(tabId)
                } else if (unitsData.length > 0) {
                    setActiveTab(unitsData[0].id)
                }

                setLoading(false)
            } catch (err) {
                console.error("Failed to fetch business units data", err)
                setLoading(false)
            }
        }

        fetchData()
    }, [])

    useEffect(() => {
        if (tabId && units.some(u => u.id === tabId)) {
            setActiveTab(tabId)
        }
    }, [tabId, units])

    const handleTabChange = (id: string) => {
        setActiveTab(id)
        router.push(`/business-units?tab=${id}`, { scroll: false })
    }

    if (loading) return <BusinessUnitsPageSkeleton />

    const currentUnitData = units.find(u => u.id === activeTab)
    if (!currentUnitData) return null

    // Prepare unit object with its products
    const unitWithProducts: BusinessUnit = {
        ...currentUnitData,
        products: products.filter(p => (p.businessUnitIds || []).includes(activeTab) || (p as any).businessUnitId === activeTab)
    }

    // Categories for current unit
    const unitCategories = categories.filter(c => c.businessUnitId === activeTab)

    const getUnitIcon = (id: string) => {
        switch (id) {
            case "green-science": return <Pipette className="h-4 w-4" />;
            case "power-air": return <Zap className="h-4 w-4" />;
            case "vacuum-to-zero": return <Box className="h-4 w-4" />;
            case "tank-nara": return <Cylinder className="h-4 w-4" />;
            default: return <Box className="h-4 w-4" />;
        }
    }

    return (
        <div className="flex flex-col min-h-screen pt-20">
            {/* Tab Navigation Navigation */}
            <div className="bg-white border-b border-slate-100 sticky top-[68px] z-30">
                <div className="container px-4 md:px-8">
                    <div className="flex items-center justify-center -mb-px overflow-x-auto no-scrollbar py-2">
                        <div className="flex gap-2 p-1 bg-slate-100/50 rounded-2xl">
                            {units.map((unit) => (
                                <button
                                    key={unit.id}
                                    onClick={() => handleTabChange(unit.id)}
                                    className={`
                                        flex items-center gap-2.5 px-6 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap
                                        ${activeTab === unit.id
                                            ? "bg-white text-primary shadow-sm ring-1 ring-slate-200"
                                            : "text-slate-500 hover:text-slate-900 hover:bg-white/50"}
                                    `}
                                >
                                    <span className={activeTab === unit.id ? "text-primary" : "text-slate-400"}>
                                        {getUnitIcon(unit.id)}
                                    </span>
                                    {unit.name}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Dynamic Content */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                >
                    <UnitHero name={unitWithProducts.name} />
                    <BusinessUnitMainContent
                        unit={unitWithProducts}
                        unitCategories={unitCategories}
                    />
                </motion.div>
            </AnimatePresence>
        </div>
    )
}

export default function BusinessUnitsPage() {
    return (
        <Suspense fallback={<BusinessUnitsPageSkeleton />}>
            <BusinessUnitsContent />
        </Suspense>
    )
}
