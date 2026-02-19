
"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ImageSelector } from "@/components/ui/image-selector"

export default function EditBusinessUnit() {
    const params = useParams()
    const router = useRouter()
    const isNew = params.id === "new"

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        image: ""
    })

    const [loading, setLoading] = useState(!isNew)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        if (!isNew) {
            fetch(`/api/business-units/${params.id}`)
                .then((res) => {
                    if (!res.ok) throw new Error("Failed to fetch")
                    return res.json()
                })
                .then((data) => {
                    setFormData({
                        name: data.name,
                        description: data.description,
                        image: data.image
                    })
                    setLoading(false)
                })
                .catch((err) => {
                    alert("데이터를 불러오는데 실패했습니다.")
                    router.push("/admin/business-units")
                })
        }
    }, [params.id, isNew, router])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)

        try {
            const url = isNew ? "/api/business-units" : `/api/business-units/${params.id}`
            const method = isNew ? "POST" : "PUT"

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            })

            if (!res.ok) throw new Error("Failed")

            alert(isNew ? "등록되었습니다." : "수정되었습니다.")
            router.push("/admin/business-units")
        } catch (err) {
            alert("저장에 실패했습니다.")
        } finally {
            setSaving(false)
        }
    }

    if (loading) return <div>Loading...</div>

    return (
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow">
            <h2 className="text-2xl font-bold mb-6">{isNew ? "새 사업 분야 추가" : `사업 분야 수정: ${formData.name}`}</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium mb-1">이름</label>
                    <Input
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="예: 공압 실험기기"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">설명</label>
                    <Textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={4}
                        placeholder="사업 분야에 대한 상세 설명을 입력하세요."
                        required
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ImageSelector
                        label="대표 로고/이미지"
                        value={formData.image}
                        onChange={(url) => setFormData({ ...formData, image: url })}
                    />
                </div>

                <div className="flex gap-4 pt-4 border-t">
                    <Button type="button" variant="outline" onClick={() => router.back()}>
                        취소
                    </Button>
                    <Button type="submit" disabled={saving}>
                        {saving ? "저장 중..." : "저장하기"}
                    </Button>
                </div>
            </form>
        </div>
    )
}
