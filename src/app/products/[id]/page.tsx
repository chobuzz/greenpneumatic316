
"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, CheckCircle2, ShoppingCart, FileText, Minus, Plus, ChevronLeft, ChevronRight } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import type { Product, BusinessUnit, ProductModel } from "@/lib/db"
import { Loading } from "@/components/ui/loading"
import { QuotationModal } from "@/components/quotation-modal"

export default function ProductDetailPage() {
    const params = useParams()
    const router = useRouter()
    const id = params.id as string

    const [data, setData] = useState<{ product: Product, unit: BusinessUnit } | null>(null)
    const [loading, setLoading] = useState(true)
    const [selectedModel, setSelectedModel] = useState<ProductModel | null>(null)
    const [quantity, setQuantity] = useState(1)
    const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false)
    const [activeImageIndex, setActiveImageIndex] = useState(0)

    useEffect(() => {
        fetch("/api/products/" + id)
            .then(res => res.json())
            .then(product => {
                fetch("/api/business-units")
                    .then(res => res.json())
                    .then((units: BusinessUnit[]) => {
                        // Use product.businessUnitIds[0] as primary unit for UI context
                        const targetBUId = product.businessUnitIds?.[0] || product.businessUnitId;
                        const unit = units.find(u => u.id === targetBUId);

                        if (product && unit) {
                            setData({ product, unit })
                            if (product.models && product.models.length > 0) {
                                setSelectedModel(product.models[0])
                            }
                        }
                        setLoading(false)
                    })
            })
            .catch(() => {
                setLoading(false)
            })
    }, [id])

    if (loading) return <Loading />
    if (!data) return <div className="min-h-screen flex items-center justify-center">상품을 찾을 수 없습니다.</div>

    const { product, unit } = data
    const allImages = product.images || []

    const nextImage = () => {
        if (allImages.length === 0) return
        setActiveImageIndex((prev) => (prev + 1) % allImages.length)
    }

    const prevImage = () => {
        if (allImages.length === 0) return
        setActiveImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length)
    }

    return (
        <div className="min-h-screen pb-20 pt-10">
            <div className="container px-4 md:px-8">
                <Link href={`/business-units/${unit.id}`} className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-8 transition-colors">
                    <ArrowLeft className="mr-2 h-4 w-4" /> {unit.name}로 돌아가기
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
                    {/* Image Gallery */}
                    <div className="space-y-6">
                        <div className="group relative aspect-square bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm flex items-center justify-center">
                            {allImages.length > 0 ? (
                                <>
                                    <Image
                                        src={allImages[activeImageIndex]}
                                        alt={product.name}
                                        fill
                                        className="object-contain p-8 transition-all duration-500 ease-in-out"
                                        priority
                                    />

                                    {/* Navigation Arrows */}
                                    {allImages.length > 1 && (
                                        <>
                                            <button
                                                onClick={(e) => { e.preventDefault(); prevImage(); }}
                                                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-2xl bg-white/90 backdrop-blur shadow-lg flex items-center justify-center text-slate-400 hover:text-primary hover:scale-110 transition-all opacity-0 group-hover:opacity-100 z-10"
                                            >
                                                <ChevronLeft className="h-6 w-6" />
                                            </button>
                                            <button
                                                onClick={(e) => { e.preventDefault(); nextImage(); }}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-2xl bg-white/90 backdrop-blur shadow-lg flex items-center justify-center text-slate-400 hover:text-primary hover:scale-110 transition-all opacity-0 group-hover:opacity-100 z-10"
                                            >
                                                <ChevronRight className="h-6 w-6" />
                                            </button>

                                            {/* Image Counter */}
                                            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-slate-900/80 text-white text-[10px] font-bold tracking-widest backdrop-blur">
                                                {activeImageIndex + 1} / {allImages.length}
                                            </div>
                                        </>
                                    )}
                                </>
                            ) : (
                                <div className="flex flex-col items-center justify-center text-slate-300 gap-3">
                                    <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-200">
                                        <FileText className="h-8 w-8" />
                                    </div>
                                    <p className="font-bold">이미지가 없습니다.</p>
                                </div>
                            )}
                        </div>

                        {/* Thumbnails */}
                        {allImages.length > 1 && (
                            <div className="flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar scroll-smooth">
                                {allImages.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setActiveImageIndex(idx)}
                                        className={`relative flex-shrink-0 w-24 h-24 rounded-2xl overflow-hidden border-2 transition-all p-2 ${activeImageIndex === idx
                                            ? "border-primary bg-primary/5 shadow-md scale-105"
                                            : "border-slate-100 grayscale-[50%] hover:grayscale-0 hover:border-slate-300 opacity-60 hover:opacity-100"
                                            }`}
                                    >
                                        <div className="relative w-full h-full">
                                            <Image
                                                src={img}
                                                alt={`${product.name} thumbnail ${idx + 1}`}
                                                fill
                                                className="object-contain"
                                            />
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Product Selection & Actions */}
                    <div className="flex flex-col">
                        <div className="mb-6">
                            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary mb-3">
                                {unit.name}
                            </span>
                            <h1 className="text-3xl md:text-4xl font-bold mb-4">{product.name}</h1>
                            <p className="text-lg text-muted-foreground leading-relaxed">
                                {product.description}
                            </p>
                        </div>

                        {/* Model Selection */}
                        {product.models && product.models.length > 0 && (
                            <div className="mb-8 space-y-4">
                                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">모델 선택</h3>
                                <div className="grid grid-cols-1 gap-3">
                                    {product.models.map((model, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setSelectedModel(model)}
                                            className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${selectedModel?.name === model.name
                                                ? "border-primary bg-primary/5 ring-1 ring-primary"
                                                : "border-slate-100 bg-white hover:border-slate-200"
                                                }`}
                                        >
                                            <div className="flex items-center">
                                                <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${selectedModel?.name === model.name ? "border-primary" : "border-slate-300"}`}>
                                                    {selectedModel?.name === model.name && <div className="w-2.5 h-2.5 bg-primary rounded-full" />}
                                                </div>
                                                <div className="text-left">
                                                    <div className="font-bold text-slate-800">{model.name}</div>
                                                </div>
                                            </div>
                                            <div className="font-bold text-primary text-sm">
                                                견적서 확인
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Quantity Selection */}
                        <div className="mb-8 flex items-center justify-between p-4 bg-slate-50 rounded-xl border">
                            <span className="font-bold text-slate-700">구매 수량</span>
                            <div className="flex items-center gap-4 bg-white border rounded-lg p-1">
                                <button
                                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                    className="p-1 hover:bg-slate-100 rounded text-slate-500"
                                >
                                    <Minus className="h-4 w-4" />
                                </button>
                                <span className="w-10 text-center font-bold">{quantity}</span>
                                <button
                                    onClick={() => setQuantity(q => q + 1)}
                                    className="p-1 hover:bg-slate-100 rounded text-slate-500"
                                >
                                    <Plus className="h-4 w-4" />
                                </button>
                            </div>
                        </div>

                        {/* CTA Only (Price Hidden) */}
                        <div className="mt-auto space-y-4">
                            <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 mb-4 text-center">
                                <p className="text-sm text-blue-700 font-medium leading-relaxed">
                                    본 상품의 상세 견적 및 가격은<br />
                                    <span className="font-bold">'온라인 견적 받기'</span>를 통해 확인하실 수 있습니다.
                                </p>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Button
                                    size="lg"
                                    variant="outline"
                                    className="h-14 text-lg rounded-xl border-2 hover:bg-slate-50"
                                    asChild
                                >
                                    <Link href="/contact">문의하기</Link>
                                </Button>
                                <Button
                                    size="lg"
                                    className={`h-14 text-lg rounded-xl shadow-lg transition-all ${selectedModel?.quotationDisabled
                                        ? "bg-slate-400 hover:bg-slate-500 shadow-slate-200"
                                        : "bg-primary hover:bg-primary/90 shadow-primary/20"}`}
                                    onClick={() => {
                                        if (selectedModel?.quotationDisabled) {
                                            if (confirm("해당 모델은 온라인 견적 발급이 불가능한 품목입니다.\n문의하기를 통해 상세 내용을 남겨주시면 빠르게 안내해 드리겠습니다.\n문의하기 페이지로 이동하시겠습니까?")) {
                                                router.push("/contact");
                                            }
                                        } else {
                                            setIsQuoteModalOpen(true);
                                        }
                                    }}
                                >
                                    <FileText className="mr-2 h-5 w-5" /> 온라인 견적 받기
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Specifications / Detail Content */}
                <div className="border-t pt-16">
                    <div className="max-w-4xl mx-auto space-y-12">
                        <h2 className="text-2xl font-bold text-center relative pb-4">
                            제품 상세 정보
                            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-primary rounded-full" />
                        </h2>

                        {/* Detailed Spec Images */}
                        {product.specImages && product.specImages.length > 0 && (
                            <div className="flex flex-col gap-4">
                                {product.specImages.map((img, idx) => (
                                    <div key={idx} className="relative w-full overflow-hidden rounded-lg bg-gray-50 border border-slate-100/50">
                                        <img
                                            src={img}
                                            alt={`Spec Detail ${idx + 1}`}
                                            className="w-full h-auto object-contain block"
                                        />
                                    </div>
                                ))}
                            </div>
                        )}

                    </div>
                </div>
            </div>

            {/* Quotation Modal */}
            {selectedModel && (
                <QuotationModal
                    isOpen={isQuoteModalOpen}
                    onClose={() => setIsQuoteModalOpen(false)}
                    product={product}
                    unitName={unit.name}
                    selectedModel={selectedModel}
                    quantity={quantity}
                />
            )}
        </div>
    )
}
