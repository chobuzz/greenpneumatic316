
"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowRight, BookOpen, ExternalLink, Building2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Insight, BusinessUnit } from "@/lib/db"

export default function InsightUserPage() {
    const [insights, setInsights] = useState<Insight[]>([])
    const [units, setUnits] = useState<BusinessUnit[]>([])
    const [loading, setLoading] = useState(true)
    const [activeUnit, setActiveUnit] = useState("all")

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [insightRes, unitRes] = await Promise.all([
                    fetch("/api/insights"),
                    fetch("/api/business-units")
                ])
                const insightData = await insightRes.json()
                const unitData: BusinessUnit[] = await unitRes.json()

                setInsights(insightData)
                // Sort units by order
                setUnits(unitData.sort((a, b) => (a.order ?? 0) - (b.order ?? 0)))
            } catch (error) {
                console.error("Failed to fetch data", error)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    const filterTabs = ["all", ...units.map(u => u.id)]

    const filtered = activeUnit === "all"
        ? insights
        : insights.filter(i => i.businessUnitId === activeUnit)

    return (
        <div className="min-h-screen bg-slate-50/50 pb-24">
            {/* Hero Section */}
            <div className="bg-slate-900 text-white py-24 relative overflow-hidden">
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/40 via-transparent to-transparent" />
                <div className="max-w-7xl mx-auto px-4 relative z-10 text-center space-y-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 backdrop-blur-md px-5 py-2"
                    >
                        <BookOpen className="h-4 w-4 text-primary" />
                        <span className="text-xs font-bold tracking-[0.2em] uppercase">Knowledge & News</span>
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight"
                    >
                        <span className="text-primary">그린뉴메틱</span> 인사이트
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-slate-400 max-w-2xl mx-auto text-lg"
                    >
                        그린뉴메틱의 다양한 컨텐츠를 만나보세요.
                    </motion.p>
                </div>
            </div>

            {/* Filter Section */}
            <div className="max-w-7xl mx-auto px-4 -mt-8 relative z-20">
                <div className="bg-white rounded-3xl p-2 shadow-xl shadow-slate-200/50 flex flex-wrap gap-2">
                    {filterTabs.map(unitId => {
                        const unit = units.find(u => u.id === unitId)
                        const label = unitId === "all" ? "전체보기" : (unit?.name || unitId)

                        return (
                            <button
                                key={unitId}
                                onClick={() => setActiveUnit(unitId)}
                                className={`px-6 py-3 rounded-2xl text-sm font-bold transition-all ${activeUnit === unitId
                                    ? "bg-primary text-white shadow-lg shadow-primary/20 scale-105"
                                    : "text-slate-500 hover:bg-slate-50"
                                    }`}
                            >
                                {label}
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* Content Grid */}
            <div className="max-w-7xl mx-auto px-4 mt-16">
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-[450px] bg-white rounded-[2.5rem] animate-pulse" />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <AnimatePresence mode="popLayout">
                            {filtered.map((insight, idx) => (
                                <motion.div
                                    layout
                                    key={insight.id}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ duration: 0.4, delay: idx * 0.05 }}
                                    className="group bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500"
                                >
                                    <div className="relative h-64 overflow-hidden">
                                        <Image
                                            src={insight.image}
                                            alt={insight.title}
                                            fill
                                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                        {insight.businessUnitId && (
                                            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-900 flex items-center gap-1.5 shadow-lg">
                                                <Building2 className="h-3 w-3 text-primary" />
                                                {insight.businessUnitId.replace(/-/g, ' ')}
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-8 space-y-4">
                                        <div className="space-y-2">
                                            <span className="text-[10px] font-black text-primary/40 uppercase tracking-widest leading-none">
                                                {new Date(insight.createdAt).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
                                            </span>
                                            <h2 className="text-xl font-bold text-slate-900 leading-snug group-hover:text-primary transition-colors line-clamp-2">
                                                {insight.title}
                                            </h2>
                                            <p className="text-slate-500 text-sm line-clamp-3 leading-relaxed">
                                                {insight.description}
                                            </p>
                                        </div>
                                        <div className="pt-4 flex items-center border-t border-slate-50">
                                            {insight.externalUrl ? (
                                                <a
                                                    href={insight.externalUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-2 text-sm font-bold text-primary hover:gap-3 transition-all"
                                                >
                                                    상세보기 <ExternalLink className="h-4 w-4" />
                                                </a>
                                            ) : (
                                                <button className="flex items-center gap-2 text-sm font-bold text-slate-400 cursor-not-allowed">
                                                    상세내용 없음
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}

                {!loading && filtered.length === 0 && (
                    <div className="text-center py-32 bg-white rounded-[3rem] border-2 border-dashed border-slate-200">
                        <BookOpen className="h-16 w-16 text-slate-200 mx-auto mb-6" />
                        <h3 className="text-2xl font-bold text-slate-900">검색된 정보가 없습니다</h3>
                        <p className="text-slate-400 mt-2">다른 카테고리를 선택해 보세요.</p>
                        <Button onClick={() => setActiveUnit("all")} variant="outline" className="mt-8 rounded-xl font-bold">전체보기로 돌아가기</Button>
                    </div>
                )}
            </div>
        </div>
    )
}
