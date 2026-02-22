
"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Trash2 } from "lucide-react"
import { ImageSelector } from "@/components/ui/image-selector"
import { MediaEditor } from "@/components/ui/media-editor"
import type { BusinessUnit, Category, ProductModel, MediaItem } from "@/lib/db"
import { Loading } from "@/components/ui/loading"

export default function EditProduct() {
    const params = useParams()
    const router = useRouter()
    const isNew = params.id === "new"

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        businessUnitIds: [] as string[],
        categoryIds: [] as string[],
        images: [] as string[],
        specifications: "",
        specImages: [] as string[],
        models: [] as ProductModel[],
        mediaItems: [] as MediaItem[],
        mediaPosition: 'bottom' as 'top' | 'bottom'
    })

    const [units, setUnits] = useState<BusinessUnit[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(!isNew)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        Promise.all([
            fetch("/api/business-units").then(res => res.json()),
            fetch("/api/categories").then(res => res.json())
        ]).then(([unitData, catData]) => {
            setUnits(unitData)
            setCategories(catData)
        })

        if (!isNew) {
            fetch(`/api/products/${params.id}`)
                .then((res) => {
                    if (!res.ok) throw new Error("Failed");
                    return res.json()
                })
                .then((data) => {
                    // Data migration: if models are strings, convert to objects
                    const formalModels = (data.models || []).map((m: any) =>
                        typeof m === "string" ? { name: m, price: 0, description: "" } : m
                    )

                    setFormData({
                        name: data.name,
                        description: data.description,
                        businessUnitIds: data.businessUnitIds || (data.businessUnitId ? [data.businessUnitId] : []),
                        categoryIds: data.categoryIds || (data.categoryId ? [data.categoryId] : []),
                        images: data.images || [],
                        specifications: data.specifications || "",
                        specImages: data.specImages || [],
                        models: formalModels,
                        mediaItems: data.mediaItems && data.mediaItems.length > 0
                            ? data.mediaItems
                            : (data.specImages || []).map((url: string) => ({ type: 'image', url })),
                        mediaPosition: data.mediaPosition || 'bottom'
                    })
                    setLoading(false)
                })
                .catch(() => {
                    alert("상품을 찾을 수 없습니다.")
                    router.push("/admin/products")
                })
        }
    }, [params.id, isNew, router])

    const toggleBusinessUnit = (id: string) => {
        setFormData(prev => {
            const newUnits = prev.businessUnitIds.includes(id)
                ? prev.businessUnitIds.filter(v => v !== id)
                : [...prev.businessUnitIds, id];

            // Filter out categories that are no longer valid for any selected BU
            const validUnitIds = newUnits;
            const newCategories = prev.categoryIds.filter(catId => {
                const cat = categories.find(c => c.id === catId);
                return cat && validUnitIds.includes(cat.businessUnitId);
            });

            return { ...prev, businessUnitIds: newUnits, categoryIds: newCategories };
        });
    }

    const toggleCategory = (id: string) => {
        setFormData(prev => ({
            ...prev,
            categoryIds: prev.categoryIds.includes(id)
                ? prev.categoryIds.filter(v => v !== id)
                : [...prev.categoryIds, id]
        }));
    }

    const removeImage = (index: number) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }))
    }

    const addModel = () => {
        setFormData(prev => ({ ...prev, models: [...prev.models, { name: "", price: 0, description: "" }] }))
    }

    const updateModel = (index: number, field: keyof ProductModel, value: any) => {
        const newModels = [...formData.models]
        newModels[index] = { ...newModels[index], [field]: value }
        setFormData(prev => ({ ...prev, models: newModels }))
    }

    const removeModel = (index: number) => {
        setFormData(prev => ({
            ...prev,
            models: prev.models.filter((_, i) => i !== index)
        }))
    }


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)

        try {
            const url = isNew ? "/api/products" : `/api/products/${params.id}`
            const method = isNew ? "POST" : "PUT"

            const payload = {
                ...formData,
                specImages: formData.mediaItems
                    .filter(item => item.type === 'image')
                    .map(item => item.url)
            }

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            })

            if (!res.ok) throw new Error("Failed")
            alert(isNew ? "등록되었습니다." : "수정되었습니다.")
            router.push("/admin/products")
        } catch (err) {
            alert("저장에 실패했습니다.")
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async () => {
        if (!confirm("정말 삭제하시겠습니까?")) return;
        setSaving(true);
        try {
            await fetch(`/api/products/${params.id}`, { method: "DELETE" });
            alert("삭제되었습니다.");
            router.push("/admin/products");
        } catch (err) {
            alert("삭제 실패");
            setSaving(false);
        }
    }

    const filteredCategories = categories.filter(c => formData.businessUnitIds.includes(c.businessUnitId))

    if (loading) return <Loading />

    return (
        <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow pb-24">
            <h2 className="text-2xl font-bold mb-8 flex items-center gap-2">
                <span className="w-1.5 h-8 bg-primary rounded-full" />
                {isNew ? "상품 등록" : "상품 수정"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-10">
                <section className="space-y-6">
                    <h3 className="text-lg font-semibold border-b pb-2">기본 정보</h3>

                    <div className="space-y-4">
                        <label className="block text-sm font-bold text-slate-700">사업 분야 설정 <span className="text-red-500">* (중복 선택 가능)</span></label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {units.map(u => {
                                const isSelected = formData.businessUnitIds.includes(u.id);
                                return (
                                    <button
                                        key={u.id}
                                        type="button"
                                        onClick={() => toggleBusinessUnit(u.id)}
                                        className={`px-4 py-3 rounded-xl border-2 transition-all text-sm font-bold ${isSelected
                                            ? "border-primary bg-primary/5 text-primary shadow-sm"
                                            : "border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-200"
                                            }`}
                                    >
                                        {u.name}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="block text-sm font-bold text-slate-700">카테고리 설정 <span className="text-slate-400 font-medium">(중복 선택 가능)</span></label>
                        {formData.businessUnitIds.length === 0 ? (
                            <div className="p-6 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-100 text-center text-slate-400 text-sm">
                                먼저 사업 분야를 선택해 주세요.
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {formData.businessUnitIds.map(buId => {
                                    const unit = units.find(u => u.id === buId);
                                    const unitCategories = categories.filter(c => c.businessUnitId === buId && !c.parentId);
                                    if (unitCategories.length === 0) return null;

                                    return (
                                        <div key={buId} className="bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
                                            <h4 className="text-sm font-black text-slate-900 mb-4 flex items-center gap-2">
                                                <span className="w-1 h-3 bg-slate-900 rounded-full" />
                                                {unit?.name} 카테고리
                                            </h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                                                {unitCategories.map(parent => (
                                                    <div key={parent.id} className="space-y-3">
                                                        <label className="flex items-center gap-3 cursor-pointer group">
                                                            <input
                                                                type="checkbox"
                                                                className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary"
                                                                checked={formData.categoryIds.includes(parent.id)}
                                                                onChange={() => toggleCategory(parent.id)}
                                                            />
                                                            <span className={`text-sm font-bold ${formData.categoryIds.includes(parent.id) ? "text-primary" : "text-slate-600"}`}>
                                                                {parent.name}
                                                            </span>
                                                        </label>

                                                        {categories.filter(c => c.parentId === parent.id).map(child => (
                                                            <div key={child.id} className="space-y-2 ml-6">
                                                                <label className="flex items-center gap-3 cursor-pointer group">
                                                                    <input
                                                                        type="checkbox"
                                                                        className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary"
                                                                        checked={formData.categoryIds.includes(child.id)}
                                                                        onChange={() => toggleCategory(child.id)}
                                                                    />
                                                                    <span className={`text-sm ${formData.categoryIds.includes(child.id) ? "text-primary font-bold" : "text-slate-500"}`}>
                                                                        ㄴ {child.name}
                                                                    </span>
                                                                </label>

                                                                {/* 3rd Level Category */}
                                                                {categories.filter(c => c.parentId === child.id).map(grandChild => (
                                                                    <label key={grandChild.id} className="flex items-center gap-3 ml-6 cursor-pointer group">
                                                                        <input
                                                                            type="checkbox"
                                                                            className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary"
                                                                            checked={formData.categoryIds.includes(grandChild.id)}
                                                                            onChange={() => toggleCategory(grandChild.id)}
                                                                        />
                                                                        <span className={`text-sm ${formData.categoryIds.includes(grandChild.id) ? "text-primary font-bold" : "text-slate-400"}`}>
                                                                            ㄴㄴ {grandChild.name}
                                                                        </span>
                                                                    </label>
                                                                ))}
                                                            </div>
                                                        ))}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1.5 text-gray-700">상품명</label>
                        <Input
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                            className="text-lg font-semibold"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1.5 text-gray-700">간략 설명 <span className="text-slate-400 font-medium">(선택)</span></label>
                        <Textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows={3}
                            placeholder="상품 목록에 노출될 짧은 설명을 입력하세요. (비워두면 설명 없이 표시됩니다)"
                        />
                    </div>
                </section>

                {/* Models Section (Updated) */}
                <section className="space-y-6 bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold">상품 모델 및 가격 관리</h3>
                        <Button type="button" variant="outline" size="sm" onClick={addModel} className="rounded-full bg-white shadow-sm">
                            <Plus className="h-4 w-4 mr-1.5" /> 모델 추가
                        </Button>
                    </div>

                    <div className="space-y-4">
                        {formData.models.map((model, i) => (
                            <div key={i} className="bg-white p-5 rounded-xl border shadow-sm space-y-4">
                                <div className="flex justify-between items-start gap-4">
                                    <div className="flex-1 space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">모델명</label>
                                                <Input
                                                    value={model.name}
                                                    onChange={(e) => updateModel(i, "name", e.target.value)}
                                                    placeholder="예: RV-10"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">가격 (원)</label>
                                                <Input
                                                    type="text"
                                                    value={model.price.toLocaleString()}
                                                    onChange={(e) => {
                                                        const val = e.target.value.replace(/[^0-9]/g, "");
                                                        updateModel(i, "price", parseInt(val) || 0);
                                                    }}
                                                    placeholder="0"
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">특징/옵션 설명 (견적서 기재용)</label>
                                            <Textarea
                                                value={model.description || ""}
                                                onChange={(e) => updateModel(i, "description", e.target.value)}
                                                placeholder="예: 저소음 설계&#10;강화 필터 포함&#10;2년 무상 AS"
                                                rows={3}
                                                className="bg-white border-slate-200 focus:bg-white transition-all text-sm leading-relaxed"
                                            />
                                        </div>
                                        <div className="flex items-center gap-2 pt-2">
                                            <label className="relative flex items-center cursor-pointer group">
                                                <input
                                                    type="checkbox"
                                                    className="sr-only peer"
                                                    checked={model.quotationDisabled || false}
                                                    onChange={(e) => updateModel(i, "quotationDisabled", e.target.checked)}
                                                />
                                                <div className="w-5 h-5 border-2 border-slate-300 rounded-md peer-checked:bg-red-500 peer-checked:border-red-500 transition-all flex items-center justify-center group-hover:border-slate-400">
                                                    <div className="w-2.5 h-2.5 bg-white rounded-[2px] opacity-0 peer-checked:opacity-100 transition-opacity" />
                                                </div>
                                                <span className="ml-2 text-sm font-semibold text-slate-600 group-hover:text-slate-900 transition-colors">이 모델은 온라인 견적서 발급 불가</span>
                                            </label>
                                        </div>
                                    </div>
                                    <Button type="button" variant="ghost" size="icon" onClick={() => removeModel(i)} className="text-red-400 hover:text-red-600 hover:bg-red-50 mt-6">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                        {formData.models.length === 0 && (
                            <div className="text-center py-10 text-gray-400 border-2 border-dashed rounded-xl">
                                등록된 모델이 없습니다. 견적 시스템을 위해 최소 1개 이상의 모델을 등록하세요.
                            </div>
                        )}
                    </div>
                </section>

                <section className="space-y-6">
                    <h3 className="text-lg font-semibold border-b pb-2">이미지 관리</h3>

                    <div className="space-y-4">
                        <label className="block text-sm font-medium text-gray-700">기본 갤러리 이미지</label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">
                            {formData.images.map((url, i) => (
                                <div key={i} className="relative aspect-square border-2 rounded-xl overflow-hidden group shadow-sm bg-slate-50">
                                    <img src={url} alt={`Preview ${i}`} className="w-full h-full object-contain" />
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button type="button" onClick={() => removeImage(i)} className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-transform hover:scale-110">
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                    {i === 0 && <span className="absolute bottom-0 left-0 right-0 bg-primary/90 text-white text-[10px] text-center py-1 font-bold">메인</span>}
                                </div>
                            ))}
                        </div>
                        <ImageSelector
                            label=""
                            value=""
                            onChange={(url) => url && setFormData(prev => ({ ...prev, images: [...prev.images, url] }))}
                        />
                    </div>
                </section>

                {/* Media Section */}
                <section className="space-y-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-2 mb-1">
                        <div>
                            <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                                통합 미디어 / 상세 정보 구성
                            </h3>
                            <p className="text-sm text-slate-400">상세 이미지, 유튜브 영상, 링크 카드를 원하는 순서대로 자유롭게 배치하세요.</p>
                        </div>
                    </div>
                    <MediaEditor
                        value={formData.mediaItems}
                        onChange={(items) => setFormData(prev => ({ ...prev, mediaItems: items }))}
                    />
                </section>

                <div className="flex gap-4 pt-10 justify-between items-center sticky bottom-0 bg-white/90 backdrop-blur-sm py-6 border-t z-20">
                    <div className="flex gap-4">
                        <Button type="button" variant="outline" onClick={() => router.back()} className="px-8 h-12 rounded-full font-medium">취소</Button>
                        <Button type="submit" disabled={saving} className="px-12 h-12 rounded-full font-bold shadow-lg shadow-primary/20">
                            {saving ? "저장 중..." : (isNew ? "상품 등록하기" : "변경사항 저장")}
                        </Button>
                    </div>
                    {!isNew && (
                        <Button type="button" variant="ghost" onClick={handleDelete} disabled={saving} className="text-red-500 hover:text-red-700 hover:bg-red-50 font-medium">
                            상품 삭제
                        </Button>
                    )}
                </div>
            </form>
        </div>
    )
}
