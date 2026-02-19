
"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Box, Zap, Shield, Globe } from "lucide-react"
import type { BusinessUnit } from "@/lib/db"

export default function BusinessUnitsPage() {
    const [units, setUnits] = useState<BusinessUnit[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch("/api/business-units")
            .then(res => res.json())
            .then(data => {
                setUnits(data)
                setLoading(false)
            })
    }, [])

    if (loading) return null

    return (
        <div className="flex flex-col min-h-screen pt-20">
            {/* Hero Section */}
            <section className="relative py-32 overflow-hidden bg-slate-900 text-white">
                <div className="absolute inset-0 bg-[url('/grid-dark.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
                <div className="container relative z-10 px-4 md:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-3xl"
                    >
                        <span className="inline-block px-4 py-1.5 rounded-full border border-primary/20 bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-[0.2em] mb-8">
                            Our Solutions
                        </span>
                        <h1 className="text-5xl md:text-7xl font-black mb-8 leading-[1.1]">
                            그린뉴메틱의 <br />
                            <span className="text-primary">차세대 사업 분야</span>
                        </h1>
                        <p className="text-xl text-slate-400 font-medium leading-relaxed max-w-2xl">
                            실험실 장비부터 산업 현장의 유체 시스템까지, <br />
                            분야별 최고의 전문 기술력으로 산업의 지평을 넓힙니다.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Units Grid */}
            <section className="py-32 bg-white">
                <div className="container px-4 md:px-8 space-y-32">
                    {/* Define explicit order */}
                    {["green-science", "power-air", "vacuum-to-zero", "tank-nara"].map((id) => {
                        const unit = units.find(u => u.id === id);
                        if (!unit) return null;
                        const index = ["green-science", "power-air", "vacuum-to-zero", "tank-nara"].indexOf(id);
                        const divisionLabel = `Division 0${index + 1}`;

                        return (
                            <motion.div
                                key={unit.id}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className={`flex flex-col ${index % 2 === 1 ? 'lg:flex-row-reverse' : 'lg:flex-row'} gap-12 lg:gap-24 items-center`}
                            >
                                {/* Image side - Clean Frame */}
                                <div className="flex-1 w-full group">
                                    <div className="relative aspect-[16/10] rounded-[3rem] overflow-hidden shadow-2xl shadow-slate-200 border border-slate-100">
                                        <Image
                                            src={unit.image}
                                            alt={unit.name}
                                            fill
                                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-slate-900/5 group-hover:bg-transparent transition-colors duration-500" />
                                    </div>
                                </div>

                                {/* Text side - Pure Typography */}
                                <div className="flex-1 space-y-8">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-2 w-12 rounded-full bg-primary" />
                                            <span className="text-sm font-black text-slate-400 uppercase tracking-widest">{divisionLabel}</span>
                                        </div>
                                        <h2 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight">
                                            {unit.name}
                                        </h2>
                                    </div>
                                    <p className="text-lg text-slate-500 font-medium leading-relaxed">
                                        {unit.description}
                                    </p>

                                    <div className="pt-4">
                                        <Link
                                            href={`/business-units/${unit.id}`}
                                            className="inline-flex items-center gap-3 px-8 h-14 rounded-2xl bg-slate-900 text-white font-bold hover:bg-primary transition-all shadow-xl shadow-slate-200"
                                        >
                                            사업부 상세 카탈로그
                                            <ArrowRight className="h-5 w-5" />
                                        </Link>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </section>

            {/* Vision Section */}
            <section className="py-32 bg-slate-50 relative overflow-hidden">
                <div className="container px-4 md:px-8 text-center">
                    <div className="max-w-3xl mx-auto space-y-10">
                        <Globe className="h-16 w-16 text-slate-300 mx-auto" />
                        <h2 className="text-4xl md:text-5xl font-black text-slate-900">
                            변화하는 기술의 중심에서 <br />
                            변하지 않는 가치를 전합니다
                        </h2>
                        <p className="text-lg text-slate-500 font-medium leading-relaxed">
                            그린뉴메틱은 단순히 장비를 공급하는 것을 넘어, <br />
                            고객의 연구와 성공을 지원하는 최적의 환경을 디자인합니다. <br />
                        </p>
                    </div>
                </div>
            </section>
        </div>
    )
}
