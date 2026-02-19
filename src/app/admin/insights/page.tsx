
"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Plus, Search, FileText, ExternalLink, Trash2, Edit2, ChevronUp, ChevronDown } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import type { Insight } from "@/lib/db"

export default function InsightListPage() {
    const [insights, setInsights] = useState<Insight[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")

    const fetchInsights = async () => {
        setLoading(true)
        try {
            const res = await fetch("/api/insights")
            const data = await res.json()
            setInsights(data)
        } catch (error) {
            console.error("Failed to fetch insights", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchInsights()
    }, [])

    const filteredInsights = insights.filter(i =>
        i.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.description.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const handleDelete = async (id: string) => {
        if (!confirm("정말 이 인사이트를 삭제하시겠습니까?")) return

        try {
            const res = await fetch(`/api/insights/${id}`, { method: "DELETE" })
            if (res.ok) {
                setInsights(insights.filter(i => i.id !== id))
            }
        } catch (error) {
            alert("삭제에 실패했습니다.")
        }
    }

    const handleMove = async (index: number, direction: 'up' | 'down') => {
        if (searchTerm) {
            alert("검색 중에는 순서를 변경할 수 없습니다. 검색어를 지우고 다시 시도해주세요.");
            return;
        }

        const insightToMove = filteredInsights[index];
        if (!insightToMove) return;

        const currentOriginalIndex = insights.findIndex(i => i.id === insightToMove.id);
        if (currentOriginalIndex === -1) return;

        const newInsights = [...insights];
        const targetOriginalIndex = direction === 'up' ? currentOriginalIndex - 1 : currentOriginalIndex + 1;

        if (targetOriginalIndex < 0 || targetOriginalIndex >= newInsights.length) return;

        // Swap
        const [movedItem] = newInsights.splice(currentOriginalIndex, 1);
        newInsights.splice(targetOriginalIndex, 0, movedItem);

        // Optimistic update
        setInsights(newInsights)

        try {
            const res = await fetch("/api/insights/reorder", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ insightIds: newInsights.map(i => i.id) }),
            })
            if (!res.ok) throw new Error()
        } catch (error) {
            alert("순서 변경에 실패했습니다. 페이지를 새로고침 해주세요.")
            fetchInsights()
        }
    }

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
                    <h1 className="text-3xl font-bold text-slate-900">인사이트 관리</h1>
                    <p className="text-slate-500 mt-1">인사이트 콘텐츠를 조회하고 순서를 관리합니다.</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="제목 또는 내용 검색"
                            className="pl-10 h-12 rounded-xl bg-white border-slate-200"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Button asChild className="h-12 px-6 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold shadow-lg shadow-primary/10">
                        <Link href="/admin/insights/new">
                            <Plus className="h-5 w-5 mr-2" /> 인사이트 등록
                        </Link>
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredInsights.map((insight, index) => (
                    <div key={insight.id} className="group bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all relative">
                        {/* Reorder Controls Overlay on Hover */}
                        <div className="absolute top-4 right-4 z-10 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                                variant="secondary"
                                size="icon"
                                className="h-8 w-8 rounded-full bg-white/90 backdrop-blur shadow-sm hover:bg-white"
                                onClick={() => handleMove(index, 'up')}
                                disabled={index === 0}
                            >
                                <ChevronUp className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="secondary"
                                size="icon"
                                className="h-8 w-8 rounded-full bg-white/90 backdrop-blur shadow-sm hover:bg-white"
                                onClick={() => handleMove(index, 'down')}
                                disabled={index === filteredInsights.length - 1}
                            >
                                <ChevronDown className="h-4 w-4" />
                            </Button>
                        </div>

                        <div className="relative h-48 bg-slate-100 overflow-hidden">
                            {insight.image ? (
                                <Image src={insight.image} alt={insight.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                            ) : (
                                <div className="flex items-center justify-center h-full text-slate-300">NO IMAGE</div>
                            )}
                            <div className="absolute top-4 left-4 bg-slate-900/60 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded">
                                #{index + 1}
                            </div>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 line-clamp-1">{insight.title}</h3>
                                <p className="text-sm text-slate-500 line-clamp-2 mt-1">{insight.description}</p>
                            </div>
                            <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{new Date(insight.createdAt).toLocaleDateString()}</span>
                                <div className="flex items-center gap-2">
                                    <Button asChild variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-slate-400 hover:text-primary hover:bg-primary/5">
                                        <Link href={`/admin/insights/${insight.id}`}>
                                            <Edit2 className="h-4 w-4" />
                                        </Link>
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50" onClick={() => handleDelete(insight.id)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {filteredInsights.length === 0 && (
                    <div className="col-span-full py-20 text-center bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-100">
                        <FileText className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                        <p className="text-slate-400 font-medium whitespace-pre-wrap">{searchTerm ? "검색 결과가 없습니다." : "등록된 인사이트가 없습니다.\n첫 번째 인사이트를 등록해 보세요!"}</p>
                    </div>
                )}
            </div>
        </div>
    )
}
