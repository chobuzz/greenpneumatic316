
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
    const [isBulkOpen, setIsBulkOpen] = useState(false)
    const [bulkNames, setBulkNames] = useState("")
    const [bulkUnit, setBulkUnit] = useState("")
    const [bulkCategory, setBulkCategory] = useState("")
    const [isBulkSaving, setIsBulkSaving] = useState(false)

    useEffect(() => {
        const fetchData = async () => {
            const [prodRes, unitRes, catRes] = await Promise.all([
                fetch("/api/products"),
                fetch("/api/business-units"),
                fetch("/api/categories")
            ]);

            const prodData = prodRes.ok ? await prodRes.json() : [];
            const unitData = unitRes.ok ? await unitRes.json() : [];
            const catData = catRes.ok ? await catRes.json() : [];

            // Ensure we have arrays to map over
            const safeProdData = Array.isArray(prodData) ? prodData : [];
            const safeUnitData = Array.isArray(unitData) ? unitData : [];
            const safeCatData = Array.isArray(catData) ? catData : [];

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
                    businessUnitNames: buIds.map((id: string) => safeUnitData.find((u: any) => u.id === id)?.name).filter(Boolean),
                    categoryNames: catIds.map((id: string) => safeCatData.find((c: any) => c.id === id)?.name).filter(Boolean)
                }
            });

            setProducts(enriched);
            setUnits(safeUnitData);
            setCategories(safeCatData);
            setLoading(false);
        }
        fetchData();
    }, [])

    const filteredProducts = products.filter(p => {
        const matchesSearch = String(p.name ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            String(p.description ?? "").toLowerCase().includes(searchTerm.toLowerCase());

        const matchesUnit = selectedUnit === "all" ||
            p.businessUnitIds?.includes(selectedUnit) ||
            (p as any).businessUnitId === selectedUnit;

        const matchesCategory = selectedCategory === "all" || (() => {
            const selectedCat = categories.find(c => c.id === selectedCategory);
            if (!selectedCat) return false;

            // Get all sub-category IDs recursively
            const getAllChildIds = (catId: string): string[] => {
                const children = categories.filter(c => c.parentId === catId);
                return [catId, ...children.flatMap(child => getAllChildIds(child.id))];
            };

            const targetIds = getAllChildIds(selectedCategory);
            return p.categoryIds?.some(id => targetIds.includes(id)) || targetIds.includes((p as any).categoryId);
        })();

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
                <div className="flex items-center gap-3">
                    <Button asChild className="h-12 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold shadow-lg shadow-slate-200">
                        <Link href="/admin/products/new">
                            <Plus className="h-5 w-5 mr-2" /> 새 상품 등록
                        </Link>
                    </Button>
                    <Button
                        onClick={() => setIsBulkOpen(true)}
                        variant="outline"
                        className="h-12 px-6 rounded-xl border-slate-200 font-bold hover:bg-slate-50 transition-all"
                    >
                        <LayoutGrid className="h-5 w-5 mr-2" /> 대량 등록
                    </Button>
                </div>
            </div>

            {/* Bulk Create Modal/Section */}
            {isBulkOpen && (
                <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                                <Plus className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold">상품 대량 등록</h3>
                                <p className="text-slate-400 text-sm">여러 상품을 한꺼번에 기본 설정으로 생성합니다.</p>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-slate-400 hover:text-white"
                            onClick={() => setIsBulkOpen(false)}
                        >
                            닫기
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-slate-500">사업부 선택 (필수)</label>
                                <select
                                    className="w-full h-12 rounded-xl bg-white/5 border border-white/10 px-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                    value={bulkUnit}
                                    onChange={(e) => {
                                        setBulkUnit(e.target.value);
                                        setBulkCategory("");
                                    }}
                                >
                                    <option value="" className="text-slate-900">사업부 선택</option>
                                    {units.map(u => (
                                        <option key={u.id} value={u.id} className="text-slate-900">{u.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-slate-500">카테고리 선택 (옵션)</label>
                                <select
                                    className="w-full h-12 rounded-xl bg-white/5 border border-white/10 px-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                    value={bulkCategory}
                                    onChange={(e) => setBulkCategory(e.target.value)}
                                >
                                    {categories
                                        .filter(c => c.businessUnitId === bulkUnit && !c.parentId)
                                        .map((parent, index) => (
                                            <optgroup key={parent.id || `optgroup-${index}`} label={parent.name}>
                                                <option key={parent.id || `parent-${index}`} value={parent.id} className="text-slate-900">{parent.name} (전체)</option>
                                                {categories.filter(c => c.parentId === parent.id).flatMap((child, cIndex) => [
                                                    <option key={child.id || `child-${index}-${cIndex}`} value={child.id} className="text-slate-900">
                                                        &nbsp;&nbsp;ㄴ {child.name}
                                                    </option>,
                                                    ...categories.filter(c => c.parentId === child.id).map((grandChild, gIndex) => (
                                                        <option key={grandChild.id || `grandchild-${index}-${cIndex}-${gIndex}`} value={grandChild.id} className="text-slate-900">
                                                            &nbsp;&nbsp;&nbsp;&nbsp;ㄴㄴ {grandChild.name}
                                                        </option>
                                                    ))
                                                ])}
                                            </optgroup>
                                        ))}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-slate-500">상품명 리스트 (줄바꿈 구분)</label>
                            <textarea
                                className="w-full h-[124px] rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none resize-none"
                                placeholder="예:&#10;나사식 콤프레샤 15HP&#10;피스톤 콤프레샤 5HP&#10;에어 드라이어 20"
                                value={bulkNames}
                                onChange={(e) => setBulkNames(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end pt-2">
                        <Button
                            disabled={!bulkUnit || !bulkNames || isBulkSaving}
                            className="bg-primary hover:bg-primary/90 text-white font-bold h-12 px-10 rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-95"
                            onClick={async () => {
                                setIsBulkSaving(true);
                                try {
                                    const names = bulkNames.split("\n").map(n => n.trim()).filter(n => n !== "");
                                    const res = await fetch("/api/products/bulk", {
                                        method: "POST",
                                        headers: { "Content-Type": "application/json" },
                                        body: JSON.stringify({
                                            names,
                                            businessUnitIds: [bulkUnit],
                                            categoryIds: bulkCategory ? [bulkCategory] : []
                                        })
                                    });
                                    if (res.ok) {
                                        window.location.reload();
                                    }
                                } catch (e) {
                                    alert("저장 실패");
                                } finally {
                                    setIsBulkSaving(false);
                                }
                            }}
                        >
                            {isBulkSaving ? "저장 중..." : `${bulkNames.split("\n").filter(n => n.trim()).length}개 상품 일괄 생성`}
                        </Button>
                    </div>
                </div>
            )}

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
                            {units.map((u, idx) => (
                                <option key={u.id || `unit-${idx}`} value={u.id}>{u.name}</option>
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
                            {categories
                                .filter(c => (selectedUnit === "all" || c.businessUnitId === selectedUnit) && !c.parentId)
                                .map((parent, index) => (
                                    <optgroup key={parent.id || `optgroup-filter-${index}`} label={parent.name}>
                                        <option value={parent.id}>{parent.name} (전체)</option>
                                        {categories.filter(c => c.parentId === parent.id).flatMap((child, cIndex) => [
                                            <option key={child.id || `child-filter-${index}-${cIndex}`} value={child.id}>
                                                &nbsp;&nbsp;ㄴ {child.name}
                                            </option>,
                                            ...categories.filter(c => c.parentId === child.id).map((grandChild, gIndex) => (
                                                <option key={grandChild.id || `grandchild-filter-${index}-${cIndex}-${gIndex}`} value={grandChild.id}>
                                                    &nbsp;&nbsp;&nbsp;&nbsp;ㄴㄴ {grandChild.name}
                                                </option>
                                            ))
                                        ])}
                                    </optgroup>
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
                {filteredProducts.map((product, index) => (
                    <div key={product.id || `product-${index}`} className="group bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
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
