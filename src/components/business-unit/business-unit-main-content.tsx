
"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import CategorySelector from "@/components/business-unit/category-selector"
import type { BusinessUnit, Category, Product } from "@/lib/db"

interface BusinessUnitMainContentProps {
    unit: BusinessUnit;
    unitCategories: Category[];
}

export function BusinessUnitMainContent({ unit, unitCategories }: BusinessUnitMainContentProps) {
    const unCategorizedProducts = unit.products.filter(p => {
        const pCatIds = Array.isArray(p.categoryIds) ? p.categoryIds : ((p as any).categoryId ? [(p as any).categoryId] : []);
        // Check if ANY of product categories belong to this BU
        const belongsToThisBU = pCatIds.some(catId => unitCategories.some(c => c.id === catId));
        return pCatIds.length === 0 || !belongsToThisBU;
    });

    return (
        <>
            <section className="py-8 border-t border-slate-100">
                <div className="container px-4 md:px-8">
                    <div className="max-w-6xl mx-auto">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                            {/* Left: Info Card */}
                            <motion.div
                                initial={{ opacity: 0, y: 15 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="lg:col-span-3"
                            >
                                <div className="aspect-square relative rounded-xl overflow-hidden bg-white border border-slate-100 shadow-md shadow-slate-200/50 p-6 group max-w-[200px] mx-auto lg:ml-0">
                                    <Image
                                        src={unit.image}
                                        alt={unit.name}
                                        fill
                                        className="object-contain p-4 group-hover:scale-105 transition-transform duration-500"
                                    />
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 15 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.1 }}
                                className="lg:col-span-9"
                            >
                                <h2 className="text-xl font-black text-slate-900 mb-4 flex items-center gap-3">
                                    <span className="w-1.5 h-6 bg-emerald-500 rounded-full hidden lg:block" />
                                    사업부 소개
                                </h2>
                                <p className="text-xl text-slate-900 leading-relaxed font-bold tracking-tight">
                                    {unit.description}
                                </p>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="py-12 bg-slate-50/50 relative border-t border-slate-100/50">
                <div className="container px-4 md:px-8">

                    {/* Interactive Category Selector */}
                    <CategorySelector
                        categories={unitCategories}
                        unitProducts={unit.products}
                    />

                    {/* Uncategorized products if any (fallback) */}
                    {unCategorizedProducts.length > 0 && (
                        <div className="mt-20 pt-20 border-t border-slate-200">
                            <h2 className="text-2xl font-bold mb-8 flex items-center">
                                <span className="w-1.5 h-8 bg-slate-300 mr-4 rounded-full" />
                                기타 제품
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                                {unCategorizedProducts.map((product) => (
                                    <Link href={`/products/${product.id}`} key={product.id} className="group">
                                        <div className="bg-white rounded-[2rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-slate-100 h-full flex flex-col group p-2">
                                            <div className="relative aspect-square rounded-[1.5rem] overflow-hidden bg-slate-50">
                                                {product.images?.[0] ? (
                                                    <Image
                                                        src={product.images[0]}
                                                        alt={product.name}
                                                        fill
                                                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                                                    />
                                                ) : (
                                                    <div className="flex items-center justify-center h-full text-slate-300 font-bold text-xs uppercase tracking-widest">
                                                        No Image
                                                    </div>
                                                )}
                                            </div>
                                            <div className="p-6 flex-1 flex flex-col">
                                                <h3 className="font-bold text-lg mb-2 text-slate-900 group-hover:text-primary transition-colors">
                                                    {product.name}
                                                </h3>
                                                <p className="text-sm text-slate-500 line-clamp-2 font-medium">
                                                    {product.description}
                                                </p>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </section>
        </>
    )
}
