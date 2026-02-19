
"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Trash2, Plus, Search, Filter, ChevronRight, LayoutGrid, List as ListIcon, Building2, Tag } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import type { BusinessUnit, Category, Product } from "@/lib/db"
import { Loading } from "@/components/ui/loading"

interface ProductWithMetadata extends Product {
    businessUnitNames: string[]
    categoryNames: string[]
}

export default function ProductList() {
    const [products, setProducts] = useState<ProductWithMetadata[]>([])
    const [units, setUnits] = useState<BusinessUnit[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(true)

    // Filters
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedUnit, setSelectedUnit] = useState("all")
    const [selectedCategory, setSelectedCategory] = useState("all")

    useEffect(() => {
        const fetchData = async () => {
            const [prodRes, unitRes, catRes] = await Promise.all([
                fetch("/api/products"),
                fetch("/api/business-units"),
                fetch("/api/categories")
            ]);

            const prodData = await prodRes.json();
            const unitData = await unitRes.json();
            const catData = await catRes.json();

            // Enrich products with name metadata for easier filtering
            const enriched = prodData.map((p: any) => {
                const parseField = (field: any) => {
                    if (typeof field === 'string' && (field.startsWith('[') || field.startsWith('{'))) {
                        try { return JSON.parse(field); } catch (e) { return [field]; }
                    }
                    return Array.isArray(field) ? field : (field ? [field] : []);
                };

                const buIds = parseField(p.businessUnitIds || p.businessUnitId);
                const catIds = parseField(p.categoryIds || p.categoryId);

                return {
                    ...p,
                    businessUnitIds: buIds,
                    categoryIds: catIds,
                    businessUnitNames: buIds.map((id: string) => unitData.find((u: any) => u.id === id)?.name).filter(Boolean),
                    categoryNames: catIds.map((id: string) => catData.find((c: any) => c.id === id)?.name).filter(Boolean)
                }
            });

            setProducts(enriched);
            setUnits(unitData);
            setCategories(catData);
            setLoading(false);
        }
        fetchData();
    }, [])

    const filteredProducts = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.description?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesUnit = selectedUnit === "all" ||
            p.businessUnitIds?.includes(selectedUnit) ||
            (p as any).businessUnitId === selectedUnit;

        const matchesCategory = selectedCategory === "all" ||
            p.categoryIds?.includes(selectedCategory) ||
            (p as any).categoryId === selectedCategory;

        return matchesSearch && matchesUnit && matchesCategory;
    });

    if (loading) return <Loading />

    return (
        <div className="space-y-8 max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">상품 관리</h1>
                    <p className="text-slate-500 mt-1">등록된 모든 상품을 한눈에 관리하세요.</p>
                </div>
                <Button asChild className="h-12 px-6 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold shadow-lg shadow-primary/10">
                    <Link href="/admin/products/new">
                        <Plus className="h-5 w-5 mr-2" /> 새 상품 등록
                    </Link>
                </Button>
            </div>

            {/* Filter Bar */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="상품명 또는 설명 검색..."
                            className="pl-10 h-11 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-primary transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-slate-400 shrink-0" />
                        <select
                            className="w-full h-11 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-primary transition-all text-sm px-4 outline-none"
                            value={selectedUnit}
                            onChange={(e) => setSelectedUnit(e.target.value)}
                        >
                            <option value="all">모든 사업부</option>
                            {units.map(u => (
                                <option key={u.id} value={u.id}>{u.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4 text-slate-400 shrink-0" />
                        <select
                            className="w-full h-11 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-primary transition-all text-sm px-4 outline-none"
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                        >
                            <option value="all">모든 카테고리</option>
                            {categories.filter(c => selectedUnit === "all" || c.businessUnitId === selectedUnit).map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
                        Total {filteredProducts.length} Products Found
                    </p>
                    {(searchTerm || selectedUnit !== "all" || selectedCategory !== "all") && (
                        <button
                            onClick={() => { setSearchTerm(""); setSelectedUnit("all"); setSelectedCategory("all"); }}
                            className="text-xs text-primary font-bold hover:underline"
                        >
                            필터 초기화
                        </button>
                    )}
                </div>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map(product => (
                    <div key={product.id} className="group bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
                        <div className="p-5 flex flex-col h-full">
                            <div className="relative aspect-square mb-5 bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 flex items-center justify-center p-6">
                                {product.images?.[0] ? (
                                    <Image
                                        src={product.images[0]}
                                        alt={product.name}
                                        fill
                                        className="object-contain p-4 group-hover:scale-110 transition-transform duration-500"
                                    />
                                ) : (
                                    <div className="text-[10px] text-slate-300 font-bold uppercase tracking-widest">No Image</div>
                                )}

                                <div className="absolute top-3 left-3 flex flex-wrap gap-1">
                                    {product.businessUnitNames.slice(0, 2).map((name, i) => (
                                        <span key={i} className="px-2 py-1 rounded-md bg-white/90 backdrop-blur shadow-sm text-[9px] font-black text-slate-900 border border-slate-100">
                                            {name}
                                        </span>
                                    ))}
                                    {product.businessUnitNames.length > 2 && (
                                        <span className="px-2 py-1 rounded-md bg-primary text-white text-[9px] font-black shadow-sm">
                                            +{product.businessUnitNames.length - 2}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="flex-1 space-y-2">
                                <h3 className="font-bold text-slate-900 group-hover:text-primary transition-colors line-clamp-1">{product.name}</h3>
                                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed h-8">
                                    {product.description || "등록된 설명이 없습니다."}
                                </p>

                                <div className="flex flex-wrap gap-1 mt-3">
                                    {product.categoryNames.slice(0, 3).map((name, i) => (
                                        <span key={i} className="text-[10px] text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-100 italic">
                                            #{name}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-50">
                                <span className="text-[10px] font-black text-slate-200 uppercase tracking-tighter shrink-0">ID: {product.id.slice(0, 8)}</span>
                                <Button asChild variant="ghost" size="sm" className="h-9 px-4 rounded-xl text-primary hover:bg-primary/5 font-bold group/btn">
                                    <Link href={`/admin/products/${product.id}`} className="flex items-center">
                                        상세 관리 <ChevronRight className="ml-1 h-4 w-4 group-hover/btn:translate-x-0.5 transition-transform" />
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filteredProducts.length === 0 && (
                <div className="py-32 text-center bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
                    <Search className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-slate-900">검색 결과가 없습니다</h3>
                    <p className="text-slate-400 mt-2">다른 검색어나 필터를 사용해 보세요.</p>
                </div>
            )}
        </div>
    )
}
