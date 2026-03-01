"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import type { BusinessUnit } from "@/lib/db"
import { ArrowUpRight } from "lucide-react"

interface BusinessUnitsProps {
    units: BusinessUnit[]
}

export function BusinessUnits({ units }: BusinessUnitsProps) {
    return (
        <section id="business-units" className="py-32 bg-white relative overflow-hidden">
            <div className="container px-4 md:px-8">
                <div className="flex flex-col items-center text-center mb-24">
                    <motion.span
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        className="inline-block px-4 py-1.5 rounded-full border border-primary/10 bg-primary/5 text-primary text-[10px] font-bold uppercase tracking-[0.2em] mb-6"
                    >
                        Our Core Business
                    </motion.span>
                    <h2 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 mb-8">
                        그린뉴메틱의 <br className="sm:hidden" /><span className="text-primary">전문 사업 영역</span>
                    </h2>
                    <p className="text-lg text-slate-500 max-w-2xl">
                        실험, 연구, 산업 현장을 아우르는 4가지 핵심 사업부를 통해 <br className="hidden md:block" />
                        분야별 최고의 장비와 하이엔드 기술 솔루션을 제공합니다.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
                    {units.map((unit, index) => (
                        <Link href={`/business-units?tab=${unit.id}`} key={unit.id} className="block group">
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: index * 0.1 }}
                                viewport={{ once: true }}
                                className="glass-card rounded-[2.5rem] overflow-hidden flex flex-col h-full group bg-slate-50/50"
                            >
                                <div className="relative h-72 w-full overflow-hidden">
                                    <Image
                                        src={unit.image}
                                        alt={unit.name}
                                        fill
                                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <div className="absolute top-8 right-8 z-20 h-12 w-12 rounded-2xl glass flex items-center justify-center opacity-0 group-hover:opacity-100 -translate-y-4 group-hover:translate-y-0 transition-all duration-300 shadow-lg">
                                        <ArrowUpRight className="h-6 w-6 text-slate-700" />
                                    </div>
                                </div>
                                <div className="p-10 flex-1 flex flex-col pt-8">
                                    <div className="mb-5 inline-flex items-center gap-3">
                                        <div className="h-1.5 w-12 rounded-full bg-primary" />
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Division {index + 1}</span>
                                    </div>
                                    <h3 className="text-2xl font-black mb-4 text-slate-900 group-hover:text-primary transition-colors">
                                        {unit.name}
                                    </h3>
                                    <p className="text-slate-500 text-sm leading-relaxed mb-8 flex-1 font-medium">
                                        {unit.description}
                                    </p>
                                    <div className="text-xs font-bold text-primary flex items-center gap-3">
                                        상세보기
                                        <div className="w-8 h-[2px] bg-primary group-hover:w-16 transition-all duration-300 rounded-full" />
                                    </div>
                                </div>
                            </motion.div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    )
}

import { Skeleton } from "@/components/ui/skeleton"

export function BusinessUnitsSkeleton() {
    return (
        <section className="py-32 bg-white relative overflow-hidden">
            <div className="container px-4 md:px-8">
                <div className="flex flex-col items-center text-center mb-24">
                    <Skeleton className="h-8 w-32 rounded-full mb-6" />
                    <Skeleton className="h-12 w-64 md:w-96 mb-8" />
                    <Skeleton className="h-16 w-full max-w-2xl" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="rounded-[2.5rem] overflow-hidden flex flex-col h-full bg-slate-50/50">
                            <Skeleton className="h-72 w-full" />
                            <div className="p-10 flex-1 flex flex-col pt-8">
                                <div className="mb-5 flex items-center gap-3">
                                    <Skeleton className="h-1.5 w-12 rounded-full" />
                                    <Skeleton className="h-3 w-20" />
                                </div>
                                <Skeleton className="h-8 w-3/4 mb-4" />
                                <Skeleton className="h-20 w-full mb-8" />
                                <Skeleton className="h-4 w-24" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
