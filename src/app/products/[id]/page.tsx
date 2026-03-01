
"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, CheckCircle2, ShoppingCart, FileText, Minus, Plus, ChevronLeft, ChevronRight, ChevronDown } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import type { Product, BusinessUnit, ProductModel } from "@/lib/db"
import { Loading } from "@/components/ui/loading"
import { ProductDetailSkeleton } from "@/components/product/product-detail-skeleton"
import { QuotationModal } from "@/components/quotation-modal"
import { MediaRenderer } from "@/components/ui/media-renderer"

export default function ProductDetailPage() {
    const params = useParams()
    const router = useRouter()
    const id = params.id as string

    const [data, setData] = useState<{ product: Product, unit: BusinessUnit } | null>(null)
    const [loading, setLoading] = useState(true)
    const [selectedModel, setSelectedModel] = useState<ProductModel | null>(null)
    const [selectedOptions, setSelectedOptions] = useState<{ id: number, groupName: string, name: string, price: number }[]>([])
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

    if (loading) return <ProductDetailSkeleton />
    if (!data) return <div className="min-h-screen flex items-center justify-center">상품을 찾을 수 없습니다.</div>

    const { product, unit } = data
    const allImages = (product.images || []).filter(img => typeof img === 'string' && img.trim() !== "")

    const nextImage = () => {
        if (allImages.length === 0) return
        setActiveImageIndex((prev) => (prev + 1) % allImages.length)
    }

    const prevImage = () => {
        if (allImages.length === 0) return
        setActiveImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length)
    }

    const addOption = (groupName: string, option: { name: string, price: number }, allowMulti: boolean) => {
        setSelectedOptions(prev => {
            const newOption = { ...option, groupName, id: Date.now() + Math.random() };
            if (allowMulti) {
                return [...prev, newOption];
            } else {
                // 단일 선택일 경우 동일 그룹 내 기존 옵션들 제거 후 새 옵션 추가
                return [...prev.filter(o => o.groupName !== groupName), newOption];
            }
        });
    }

    const removeOption = (idToRemove: number) => {
        setSelectedOptions(prev => prev.filter(o => o.id !== idToRemove));
    }

    const basePrice = selectedModel?.price || 0
    const optionsPrice = selectedOptions.reduce((acc, opt) => acc + opt.price, 0)
    const unitPrice = basePrice + optionsPrice

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
                                        unoptimized
                                    />

                                    {/* ... existing code for navigation and counter ... */}
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
                                                unoptimized
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
                            <h1 className="text-3xl md:text-4xl font-bold mb-5">{product.name}</h1>
                            {product.description && (
                                <div className="bg-slate-50 rounded-2xl border border-slate-100 px-6 py-5">
                                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">제품 설명</p>
                                    <p className="text-base text-slate-700 leading-relaxed font-medium whitespace-pre-line">
                                        {product.description}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Model Selection Dropdown */}
                        {product.models && product.models.length > 0 && (
                            <div className="mb-8 space-y-4">
                                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">모델 선택</h3>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary">
                                        <CheckCircle2 className="h-5 w-5" />
                                    </div>
                                    <select
                                        value={selectedModel?.name || ""}
                                        onChange={(e) => {
                                            const model = product.models?.find(m => m.name === e.target.value);
                                            if (model) setSelectedModel(model);
                                        }}
                                        className="w-full h-14 pl-12 pr-12 rounded-2xl border-2 border-slate-100 bg-white text-slate-900 font-bold focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none appearance-none transition-all cursor-pointer hover:border-slate-200"
                                    >
                                        {product.models.map((model, idx) => (
                                            <option key={idx} value={model.name}>
                                                {model.name}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-primary transition-colors">
                                        <ChevronDown className="h-5 w-5" />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Option Groups Selection */}
                        {product.optionGroups && product.optionGroups.filter(g => g.options && g.options.length > 0).length > 0 && product.optionGroups.map((group, groupIdx) => (
                            group.options && group.options.length > 0 && (
                                <div key={groupIdx} className="mb-8 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                                            {group.name}
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full ${group.isRequired ? 'bg-red-50 text-red-500 border border-red-100' : 'bg-slate-100 text-slate-500 border border-slate-200'}`}>
                                                {group.isRequired ? '필수' : '선택'}
                                            </span>
                                            {group.allowMultiSelect && <span className="text-[10px] text-primary bg-primary/5 px-2 py-0.5 rounded-full">중복 가능</span>}
                                        </h3>
                                    </div>

                                    <div className="space-y-4">
                                        {/* Dropdown for picking */}
                                        <div className="relative group">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                                {group.allowMultiSelect ? <Plus className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />}
                                            </div>
                                            <select
                                                value=""
                                                onChange={(e) => {
                                                    const optName = e.target.value;
                                                    if (!optName) return;
                                                    const option = group.options?.find(o => o.name === optName);
                                                    if (!option) return;

                                                    addOption(group.name, { name: option.name, price: option.price }, group.allowMultiSelect);
                                                    e.target.value = "";
                                                }}
                                                className="w-full h-14 pl-12 pr-12 rounded-2xl border-2 border-slate-100 bg-white text-slate-900 font-bold focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none appearance-none transition-all cursor-pointer hover:border-slate-200"
                                            >
                                                <option value="">{group.name}</option>
                                                {group.options.map((option, idx) => (
                                                    <option key={idx} value={option.name}>
                                                        {option.name} (선택 가능)
                                                    </option>
                                                ))}
                                            </select>
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-primary transition-colors">
                                                <ChevronDown className="h-5 w-5" />
                                            </div>
                                        </div>

                                        {/* Selected Options List for this group */}
                                        {selectedOptions.filter(o => o.groupName === group.name).length > 0 && (
                                            <div className="flex flex-wrap gap-2 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                                {selectedOptions.filter(o => o.groupName === group.name).map((opt, idx) => (
                                                    <div
                                                        key={idx}
                                                        className="flex items-center gap-2 px-3 py-2 bg-white rounded-xl border border-primary/20 text-primary shadow-sm animate-in fade-in zoom-in duration-200"
                                                    >
                                                        <span className="text-[10px] text-slate-400 font-medium">{group.name}:</span>
                                                        <span className="text-xs font-bold">{opt.name}</span>
                                                        <button
                                                            onClick={() => removeOption(opt.id)}
                                                            className="hover:bg-primary/10 rounded-full p-0.5 transition-colors"
                                                        >
                                                            <Plus className="h-3 w-3 rotate-45" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )
                        ))}

                        {/* Quantity Selection and Price Preview */}
                        <div className="mb-8 space-y-4">
                            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border">
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

                            <div className="flex items-end justify-between px-2">
                                <div className="space-y-1">
                                    <p className="text-xs text-slate-400 font-bold uppercase">견적 안내</p>
                                    <p className="text-sm font-medium text-slate-500">
                                        상세 모델 및 옵션 가격은 견적서에서 확인 가능합니다.
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] text-slate-400 font-bold uppercase">합계 금액</p>
                                    <p className="text-2xl font-black text-slate-900 italic">견적서 확인</p>
                                </div>
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
                                    className={`h-14 text-lg rounded-xl shadow-lg transition-all ${(!selectedModel || selectedModel?.quotationDisabled)
                                        ? "bg-slate-400 hover:bg-slate-500 shadow-slate-200"
                                        : "bg-primary hover:bg-primary/90 shadow-primary/20"}`}
                                    onClick={() => {
                                        if (!selectedModel || selectedModel?.quotationDisabled) {
                                            const message = !selectedModel
                                                ? "해당 상품은 온라인 견적 발급이 불가능한 품목입니다.\n문의하기를 통해 상세 내용을 남겨주시면 빠르게 안내해 드리겠습니다.\n문의하기 페이지로 이동하시겠습니까?"
                                                : "해당 모델은 온라인 견적 발급이 불가능한 품목입니다.\n문의하기를 통해 상세 내용을 남겨주시면 빠르게 안내해 드리겠습니다.\n문의하기 페이지로 이동하시겠습니까?";

                                            if (confirm(message)) {
                                                router.push("/contact");
                                            }
                                        } else {
                                            // 필수 옵션 체크
                                            const missingRequired = product.optionGroups?.filter(g =>
                                                g.isRequired &&
                                                g.options && g.options.length > 0 &&
                                                !selectedOptions.some(o => o.groupName === g.name)
                                            );

                                            if (missingRequired && missingRequired.length > 0) {
                                                alert(`필수 옵션을 선택해주세요:\n${missingRequired.map(g => `• ${g.name}`).join("\n")}`);
                                                return;
                                            }

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

                        {/* Unified Media Contents (Images & Rich Media) */}
                        {product.mediaItems && product.mediaItems.length > 0 ? (
                            <MediaRenderer items={product.mediaItems} />
                        ) : (
                            /* Fallback to legacy specImages if mediaItems is empty */
                            product.specImages && product.specImages.length > 0 && (
                                <div className="flex flex-col gap-10">
                                    {product.specImages.map((img, idx) => (
                                        <div key={idx} className="relative w-full overflow-hidden rounded-2xl bg-gray-50 border border-slate-100/50">
                                            <Image
                                                src={img}
                                                alt={`Spec Detail ${idx + 1}`}
                                                width={0}
                                                height={0}
                                                sizes="100vw"
                                                style={{ width: '100%', height: 'auto' }}
                                                className="block"
                                                unoptimized
                                            />
                                        </div>
                                    ))}
                                </div>
                            )
                        )}

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
                        selectedOptions={selectedOptions}
                        quantity={quantity}
                    />
                )}
            </div>
        </div>
    )
}
