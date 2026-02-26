
"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Trash2, LayoutGrid, AlertCircle } from "lucide-react"
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
        optionGroups: [] as { name: string; allowMultiSelect: boolean; isRequired?: boolean; options: { name: string; price: number; description?: string }[] }[],
        mediaItems: [] as MediaItem[],
        mediaPosition: 'bottom' as 'top' | 'bottom'
    })

    const [units, setUnits] = useState<BusinessUnit[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(!isNew)
    const [saving, setSaving] = useState(false)

    // Bulk Add States
    const [isBulkModelOpen, setIsBulkModelOpen] = useState(false)
    const [bulkModelText, setBulkModelText] = useState("")
    const [bulkOptionGroupId, setBulkOptionGroupId] = useState<number | null>(null)
    const [bulkOptionText, setBulkOptionText] = useState("")

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
                        optionGroups: data.optionGroups || (data.options ? [{ name: "추가 옵션", allowMultiSelect: data.allowMultiSelectOptions || false, options: data.options }] : []),
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

    const addOptionGroup = () => {
        setFormData(prev => ({
            ...prev,
            optionGroups: [...prev.optionGroups, { name: "새 옵션 그룹", allowMultiSelect: false, isRequired: false, options: [] }]
        }))
    }

    const updateOptionGroup = (groupIndex: number, field: string, value: any) => {
        const newGroups = [...formData.optionGroups]
        newGroups[groupIndex] = { ...newGroups[groupIndex], [field]: value }
        setFormData(prev => ({ ...prev, optionGroups: newGroups }))
    }

    const removeOptionGroup = (groupIndex: number) => {
        setFormData(prev => ({
            ...prev,
            optionGroups: prev.optionGroups.filter((_, i) => i !== groupIndex)
        }))
    }

    const addOption = (groupIndex: number) => {
        const newGroups = [...formData.optionGroups]
        newGroups[groupIndex].options.push({ name: "", price: 0, description: "" })
        setFormData(prev => ({ ...prev, optionGroups: newGroups }))
    }

    const updateOption = (groupIndex: number, optionIndex: number, field: string, value: any) => {
        const newGroups = [...formData.optionGroups]
        newGroups[groupIndex].options[optionIndex] = { ...newGroups[groupIndex].options[optionIndex], [field]: value }
        setFormData(prev => ({ ...prev, optionGroups: newGroups }))
    }

    const removeOption = (groupIndex: number, optionIndex: number) => {
        const newGroups = [...formData.optionGroups]
        newGroups[groupIndex].options = newGroups[groupIndex].options.filter((_, i) => i !== optionIndex)
        setFormData(prev => ({ ...prev, optionGroups: newGroups }))
    }

    const bulkAddModels = () => {
        const lines = bulkModelText.split("\n").filter(l => l.trim() !== "");
        const newModels: ProductModel[] = lines.map(line => {
            const parts = line.split("|").map(p => p.trim());
            return {
                name: parts[0] || "새 모델",
                price: parseInt(parts[1]?.replace(/[^0-9]/g, "") ?? "0") || 0,
                description: parts[2] || ""
            };
        });
        setFormData(prev => ({ ...prev, models: [...prev.models, ...newModels] }));
        setBulkModelText("");
        setIsBulkModelOpen(false);
    }

    const bulkAddOptions = (groupIndex: number) => {
        const lines = bulkOptionText.split("\n").filter(l => l.trim() !== "");
        const newOptions = lines.map(line => {
            const parts = line.split("|").map(p => p.trim());
            return {
                name: parts[0] || "새 옵션",
                price: parseInt(parts[1]?.replace(/[^0-9]/g, "") ?? "0") || 0,
                description: parts[2] || ""
            };
        });
        const newGroups = [...formData.optionGroups];
        newGroups[groupIndex].options = [...newGroups[groupIndex].options, ...newOptions];
        setFormData(prev => ({ ...prev, optionGroups: newGroups }));
        setBulkOptionText("");
        setBulkOptionGroupId(null);
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
                            value={formData.name || ""}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                            className="text-lg font-semibold"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1.5 text-gray-700">간략 설명 <span className="text-slate-400 font-medium">(선택)</span></label>
                        <Textarea
                            value={formData.description || ""}
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
                        <div className="flex gap-2">
                            <Button type="button" variant="outline" size="sm" onClick={() => setIsBulkModelOpen(!isBulkModelOpen)} className="rounded-full bg-white shadow-sm text-slate-500">
                                <LayoutGrid className="h-4 w-4 mr-1.5" /> 대량 추가
                            </Button>
                            <Button type="button" variant="outline" size="sm" onClick={addModel} className="rounded-full bg-white shadow-sm border-primary text-primary">
                                <Plus className="h-4 w-4 mr-1.5" /> 개별 추가
                            </Button>
                        </div>
                    </div>

                    {isBulkModelOpen && (
                        <div className="bg-slate-900 rounded-2xl p-6 text-white space-y-4 animate-in slide-in-from-top-2 duration-300">
                            <div className="flex items-center gap-2 mb-2">
                                <AlertCircle className="h-4 w-4 text-emerald-400" />
                                <p className="text-xs text-slate-300">한 줄에 하나씩 입력: <b>모델명 | 가격 | 설명</b> (구분자 | 필수 아님)</p>
                            </div>
                            <Textarea
                                value={bulkModelText}
                                onChange={(e) => setBulkModelText(e.target.value)}
                                placeholder="예:&#10;나사형 15HP | 1500000 | 표준형&#10;피스톤 5HP | 800000 | 저소음 최신형"
                                className="bg-white/10 border-white/20 text-white placeholder:text-slate-500 h-32"
                            />
                            <div className="flex justify-end gap-2">
                                <Button type="button" variant="ghost" size="sm" onClick={() => { setIsBulkModelOpen(false); setBulkModelText(""); }} className="text-slate-400 hover:text-white">취소</Button>
                                <Button type="button" size="sm" onClick={bulkAddModels} className="bg-emerald-500 hover:bg-emerald-600 font-bold">모델 일괄 추가</Button>
                            </div>
                        </div>
                    )}

                    <div className="space-y-4">
                        {formData.models.map((model, i) => (
                            <div key={i} className="bg-white p-5 rounded-xl border shadow-sm space-y-4">
                                <div className="flex justify-between items-start gap-4">
                                    <div className="flex-1 space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">모델명</label>
                                                <Input
                                                    value={model.name || ""}
                                                    onChange={(e) => updateModel(i, "name", e.target.value)}
                                                    placeholder="예: RV-10"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">가격 (원)</label>
                                                <Input
                                                    type="text"
                                                    value={(model.price || 0).toLocaleString()}
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
                    </div>
                </section>

                {/* Option Groups Section */}
                <section className="space-y-6 bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
                    <div className="flex justify-between items-center">
                        <div className="flex flex-col">
                            <h3 className="text-lg font-semibold">옵션 그룹 관리</h3>
                            <p className="text-xs text-slate-400">다양한 종류의 옵션 카테고리를 만들 수 있습니다 (예: 색상, 부품 추가 등).</p>
                        </div>
                        <Button type="button" variant="outline" size="sm" onClick={addOptionGroup} className="rounded-full bg-white shadow-sm">
                            <Plus className="h-4 w-4 mr-1.5" /> 그룹 추가
                        </Button>
                    </div>

                    <div className="space-y-8">
                        {formData.optionGroups.map((group, groupIdx) => (
                            <div key={groupIdx} className="bg-white p-6 rounded-2xl border shadow-sm space-y-6 relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-1.5 h-full bg-primary/20" />

                                <div className="flex justify-between items-start gap-4">
                                    <div className="flex-1 space-y-4">
                                        <div className="flex flex-col md:flex-row md:items-center gap-4">
                                            <div className="flex-1">
                                                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">그룹 이름</label>
                                                <Input
                                                    value={group.name || ""}
                                                    onChange={(e) => updateOptionGroup(groupIdx, "name", e.target.value)}
                                                    placeholder="예: 필터 구성, 배송 방식"
                                                    className="font-bold border-slate-200"
                                                />
                                            </div>
                                            <div className="flex gap-3 pt-5 shrink-0">
                                                <label className="flex items-center gap-2 cursor-pointer group bg-slate-50 border px-3 py-1.5 rounded-xl hover:border-red-400 transition-all">
                                                    <input
                                                        type="checkbox"
                                                        className="w-4 h-4 rounded border-red-300 text-red-500 focus:ring-red-500"
                                                        checked={group.isRequired}
                                                        onChange={(e) => updateOptionGroup(groupIdx, "isRequired", e.target.checked)}
                                                    />
                                                    <span className={`text-xs font-bold ${group.isRequired ? 'text-red-600' : 'text-slate-600'}`}>필수 선택 항목</span>
                                                </label>
                                                <label className="flex items-center gap-2 cursor-pointer group bg-slate-50 border px-3 py-1.5 rounded-xl hover:border-primary transition-all">
                                                    <input
                                                        type="checkbox"
                                                        className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary"
                                                        checked={group.allowMultiSelect}
                                                        onChange={(e) => updateOptionGroup(groupIdx, "allowMultiSelect", e.target.checked)}
                                                    />
                                                    <span className="text-xs font-bold text-slate-600">중복 선택 가능</span>
                                                </label>
                                            </div>
                                        </div>

                                        <div className="space-y-3 pt-2">
                                            <div className="flex items-center justify-between">
                                                <label className="text-xs font-black text-slate-400 uppercase tracking-wider">세부 옵션 리스트</label>
                                                <div className="flex gap-1">
                                                    <Button type="button" variant="ghost" size="sm" onClick={() => setBulkOptionGroupId(bulkOptionGroupId === groupIdx ? null : groupIdx)} className="h-7 text-[10px] font-bold text-slate-400 hover:text-slate-600 px-2">
                                                        <LayoutGrid className="h-3 w-3 mr-1" /> 대량 추가
                                                    </Button>
                                                    <Button type="button" variant="ghost" size="sm" onClick={() => addOption(groupIdx)} className="h-7 text-[10px] font-bold text-primary hover:bg-primary/5 px-2">
                                                        <Plus className="h-3 w-3 mr-1" /> 개별 추가
                                                    </Button>
                                                </div>
                                            </div>

                                            {bulkOptionGroupId === groupIdx && (
                                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 shadow-inner animate-in slide-in-from-top-1">
                                                    <p className="text-[10px] text-slate-400">한 줄에 하나씩 입력: <b>옵션명 | 추가금액 | 설명</b></p>
                                                    <Textarea
                                                        value={bulkOptionText}
                                                        onChange={(e) => setBulkOptionText(e.target.value)}
                                                        placeholder="예:&#10;2m 에어호스 | 20000&#10;디지털 게이지 | 45000 | 고정밀 센서 포함"
                                                        className="bg-white h-24 text-xs"
                                                    />
                                                    <div className="flex justify-end gap-2">
                                                        <Button type="button" variant="ghost" size="sm" onClick={() => { setBulkOptionGroupId(null); setBulkOptionText(""); }} className="h-8 text-xs text-slate-400">취소</Button>
                                                        <Button type="button" size="sm" onClick={() => bulkAddOptions(groupIdx)} className="h-8 text-xs bg-slate-800 text-white font-bold">옵션 일괄 추가</Button>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="space-y-2">
                                                {group.options.map((option, optIdx) => (
                                                    <div key={optIdx} className="flex items-center gap-3 bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                                                        <div className="flex-1 grid grid-cols-2 gap-3">
                                                            <Input
                                                                value={option.name || ""}
                                                                onChange={(e) => updateOption(groupIdx, optIdx, "name", e.target.value)}
                                                                placeholder="옵션명"
                                                                className="h-9 text-sm bg-white"
                                                            />
                                                            <Input
                                                                type="text"
                                                                value={(option.price || 0).toLocaleString()}
                                                                onChange={(e) => {
                                                                    const val = e.target.value.replace(/[^0-9]/g, "");
                                                                    updateOption(groupIdx, optIdx, "price", parseInt(val) || 0);
                                                                }}
                                                                placeholder="상승 가격"
                                                                className="h-9 text-sm bg-white text-right"
                                                            />
                                                        </div>
                                                        <Button type="button" variant="ghost" size="icon" onClick={() => removeOption(groupIdx, optIdx)} className="h-9 w-9 text-slate-300 hover:text-red-500">
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                ))}
                                                {group.options.length === 0 && (
                                                    <div className="text-center py-4 text-[10px] text-slate-400 border border-dashed rounded-xl">
                                                        추가된 옵션이 없습니다.
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <Button type="button" variant="ghost" size="icon" onClick={() => removeOptionGroup(groupIdx)} className="text-slate-300 hover:text-red-500 hover:bg-red-50">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}

                        {formData.optionGroups.length === 0 && (
                            <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200">
                                <p className="text-sm text-slate-400">설정된 옵션 그룹이 없습니다. '그룹 추가' 버튼을 눌러 시작하세요.</p>
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
