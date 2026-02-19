
"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Save, Loader2, Image as ImageIcon, Link as LinkIcon, Building2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ImageSelector } from "@/components/ui/image-selector"
import type { Insight, BusinessUnit } from "@/lib/db"

export default function InsightFormPage({ params }: { params: { id?: string } }) {
    const isEdit = !!params.id
    const router = useRouter()

    const [loading, setLoading] = useState(isEdit)
    const [saving, setSaving] = useState(false)
    const [units, setUnits] = useState<BusinessUnit[]>([])

    const [formData, setFormData] = useState<Partial<Insight>>({
        title: "",
        description: "",
        image: "",
        externalUrl: "",
        businessUnitId: "",
    })

    useEffect(() => {
        const fetchData = async () => {
            try {
                const unitRes = await fetch("/api/business-units")
                setUnits(await unitRes.json())

                if (isEdit) {
                    const res = await fetch("/api/insights")
                    const allInsights: Insight[] = await res.json()
                    const current = allInsights.find(i => i.id === params.id)
                    if (current) setFormData(current)
                }
            } catch (error) {
                console.error("Failed to fetch data", error)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [isEdit, params.id])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!formData.title || !formData.image) {
            alert("제목과 이미지는 필수 항목입니다.")
            return
        }

        setSaving(true)
        try {
            const url = isEdit ? `/api/insights/${params.id}` : "/api/insights"
            const method = isEdit ? "PUT" : "POST"
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            })

            if (res.ok) {
                router.push("/admin/insights")
                router.refresh()
            }
        } catch (error) {
            alert("저장에 실패했습니다.")
        } finally {
            setSaving(false)
        }
    }

    if (loading) return (
        <div className="p-20 text-center">
            <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mx-auto" />
        </div>
    )

    return (
        <div className="max-w-4xl space-y-8">
            <div className="flex items-center gap-4">
                <Button asChild variant="ghost" size="icon" className="h-10 w-10 rounded-xl">
                    <Link href="/admin/insights"><ArrowLeft className="h-5 w-5" /></Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">{isEdit ? "인사이트 수정" : "새 인사이트 등록"}</h1>
                    <p className="text-slate-500 mt-1">인사이트 정보를 입력하고 스타일리시하게 홍보하세요.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm space-y-8">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-black tracking-widest text-slate-400 uppercase flex items-center gap-2">
                                <ImageIcon className="h-4 w-4" /> 인사이트 이미지
                            </label>
                            <ImageSelector
                                value={formData.image || ""}
                                onChange={(url) => setFormData({ ...formData, image: url })}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-black tracking-widest text-slate-400 uppercase">제목</label>
                            <Input
                                placeholder="인사이트 제목을 입력하세요"
                                className="h-12 rounded-xl text-lg font-bold"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-black tracking-widest text-slate-400 uppercase">설명</label>
                            <Textarea
                                placeholder="방문자에게 보여줄 간단한 설명을 입력하세요"
                                className="min-h-[120px] rounded-2xl resize-none"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-black tracking-widest text-slate-400 uppercase flex items-center gap-2">
                                <Building2 className="h-4 w-4" /> 관련 사업 분야
                            </label>
                            <select
                                className="w-full h-12 rounded-xl border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                value={formData.businessUnitId || ""}
                                onChange={(e) => setFormData({ ...formData, businessUnitId: e.target.value })}
                            >
                                <option value="">선택 안 함</option>
                                {units.map(u => (
                                    <option key={u.id} value={u.id}>{u.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-black tracking-widest text-slate-400 uppercase flex items-center gap-2">
                                <LinkIcon className="h-4 w-4" /> 외부 링크 (URL)
                            </label>
                            <Input
                                placeholder="https://..."
                                className="h-12 rounded-xl"
                                value={formData.externalUrl}
                                onChange={(e) => setFormData({ ...formData, externalUrl: e.target.value })}
                            />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <Button disabled={saving} className="h-14 px-10 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold text-lg shadow-xl shadow-primary/20">
                        {saving ? <Loader2 className="h-6 w-6 animate-spin" /> : <><Save className="h-6 w-6 mr-2" /> 인사이트 저장</>}
                    </Button>
                </div>
            </form>
        </div>
    )
}
