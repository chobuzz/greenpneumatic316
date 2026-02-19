
"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Trash2, Plus, Search, Building2, LayoutGrid, Package, ChevronRight } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import type { BusinessUnit, Product } from "@/lib/db"

interface ProductWithUnit extends Product {
    businessUnitName: string
    businessUnitId: string
}

export default function ProductList() {
    const [products, setProducts] = useState<ProductWithUnit[]>([])
    const [units, setUnits] = useState<BusinessUnit[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")

    useEffect(() => {
        const fetchData = async () => {
            const [prodRes, unitRes] = await Promise.all([
                fetch("/api/products"),
                fetch("/api/business-units")
            ]);
            const prodData = await prodRes.json();
            const unitData = await unitRes.json();
            setProducts(prodData);
            setUnits(unitData);
            setLoading(false);
        }
        fetchData();
    }, [])

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.businessUnitName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return (
        <div className="p-20 text-center">
            <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-slate-500">데이터를 불러오는 중...</p>
        </div>
    )

    return (
        <div className="space-y-10 max-w-6xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">상품 관리</h1>
                    <p className="text-slate-500 mt-1">등록된 상품을 조회하고 수정합니다.</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="상품명 또는 사업부 검색"
                            className="pl-10 h-12 rounded-xl bg-white border-slate-200"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Button asChild className="h-12 px-6 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold shadow-lg shadow-primary/10">
                        <Link href="/admin/products/new">
                            <Plus className="h-5 w-5 mr-2" /> 상품 등록
                        </Link>
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-12">
                {units.map(unit => {
                    const unitProducts = filteredProducts.filter(p => {
                        // Sometimes businessUnitId is missing if not strictly typed in DB, fallback to name match if needed
                        return p.businessUnitId === unit.id || p.businessUnitName === unit.name;
                    });

                    if (searchTerm && unitProducts.length === 0) return null;

                    return (
                        <div key={unit.id} className="space-y-6">
                            <div className="flex items-center gap-3 pb-2 border-b border-slate-200">
                                <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-lg">
                                    <Building2 className="h-5 w-5" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-slate-900">{unit.name}</h2>
                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{unitProducts.length} Products</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {unitProducts.map(product => (
                                    <div key={product.id} className="group bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all">
                                        <div className="p-5 flex gap-5">
                                            <div className="relative h-24 w-24 flex-shrink-0 bg-slate-50 rounded-2xl overflow-hidden border border-slate-100">
                                                {product.images?.[0] ? (
                                                    <Image
                                                        src={product.images[0]}
                                                        alt={product.name}
                                                        fill
                                                        className="object-contain p-2 group-hover:scale-110 transition-transform duration-500"
                                                    />
                                                ) : (
                                                    <div className="flex items-center justify-center h-full text-[10px] text-slate-300 font-bold">NO IMAGE</div>
                                                )}
                                            </div>
                                            <div className="flex-1 flex flex-col justify-between py-1">
                                                <div>
                                                    <h3 className="font-bold text-slate-900 group-hover:text-primary transition-colors line-clamp-1">{product.name}</h3>
                                                    <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                                                        {product.description || "등록된 설명이 없습니다."}
                                                    </p>
                                                </div>
                                                <div className="flex items-center justify-between mt-4">
                                                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-tighter">ID: {product.id.slice(0, 8)}</span>
                                                    <Button asChild variant="ghost" size="sm" className="h-8 rounded-lg text-primary hover:bg-primary/5 font-bold">
                                                        <Link href={`/admin/products/${product.id}`}>
                                                            상세 관리 <ChevronRight className="ml-1 h-3 w-3" />
                                                        </Link>
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {unitProducts.length === 0 && (
                                    <div className="col-span-full py-12 text-center bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-100">
                                        <Package className="h-8 w-8 text-slate-200 mx-auto mb-3" />
                                        <p className="text-slate-400 text-sm italic font-medium">이 사업부에 등록된 상품이 없습니다.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
