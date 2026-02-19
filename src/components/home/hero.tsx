
"use client"

import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { ArrowRight, Sparkles } from "lucide-react"
import { useState, useEffect } from "react"

const HERO_IMAGES = Array.from({ length: 15 }, (_, i) => `/hero/${i + 1}.png`)

export function Hero() {
    const [currentIndex, setCurrentIndex] = useState(0)

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % HERO_IMAGES.length)
        }, 5000)
        return () => clearInterval(timer)
    }, [])

    return (
        <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-900">
            {/* Background Image Slider */}
            <div className="absolute inset-0 z-0">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentIndex}
                        initial={{ opacity: 0, scale: 1.1 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="absolute inset-0"
                    >
                        <div
                            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                            style={{ backgroundImage: `url(${HERO_IMAGES[currentIndex]})` }}
                        />
                    </motion.div>
                </AnimatePresence>
                {/* Gradient Overlay for Readability */}
                <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/60 via-black/40 to-slate-900/90" />
            </div>

            <div className="relative z-20 max-w-5xl text-center px-4 pt-20">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8 }}
                    className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-md px-5 py-2 mb-10 shadow-xl"
                >
                    <Sparkles className="h-4 w-4 text-green-400" />
                    <span className="text-xs font-bold tracking-[0.2em] text-white uppercase">Elite Precision Systems</span>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.1 }}
                >
                    <h1 className="mb-8 text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl leading-[1.3] break-keep drop-shadow-2xl">
                        연구 환경을 완성하는 유체 기술<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-300">
                            실험실 · 유체 시스템 전문 기업, <span className="inline-block">그린뉴메틱</span>
                        </span>
                    </h1>
                </motion.div>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="mx-auto mb-12 max-w-3xl text-sm text-slate-200 sm:text-lg font-medium leading-relaxed break-keep px-4 opacity-90"
                >
                    <span className="inline-block">Green Pneumatic은 연구소에 최적화된</span>{" "}
                    <span className="inline-block">실험 장비를 공급하며,</span>{" "}
                    <span className="inline-block">전문적인 기술지원을 통해</span>{" "}
                    <span className="inline-block">고객의 연구 성과와 생산성을 극대화합니다.</span>
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className="flex flex-col items-center justify-center gap-5 sm:flex-row"
                >
                    <Button asChild size="lg" className="h-16 px-10 text-lg font-bold bg-green-600 hover:bg-green-500 text-white shadow-2xl shadow-green-900/20 transition-all hover:scale-105 active:scale-95 border-none">
                        <Link href="#contact">
                            전문가 상담 신청 <ArrowRight className="ml-2 h-5 w-5" />
                        </Link>
                    </Button>
                    <Button asChild variant="outline" size="lg" className="h-16 px-10 text-lg font-bold bg-white/10 text-white border-white/20 hover:bg-white/20 backdrop-blur-md transition-all hover:scale-105 active:scale-95 shadow-xl">
                        <Link href="#business-units">
                            사업 분야 및 제품군
                        </Link>
                    </Button>
                </motion.div>
            </div>

            {/* Scroll Indicator */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 z-20"
            >
                <div className="w-px h-12 bg-gradient-to-b from-white/30 to-transparent" />
            </motion.div>

            {/* Image Counter Indicator */}
            <div className="absolute bottom-10 right-10 z-20 hidden md:flex items-center gap-2">
                {HERO_IMAGES.map((_, i) => (
                    <div
                        key={i}
                        className={`h-1 transition-all duration-500 rounded-full ${currentIndex === i ? 'w-8 bg-green-400' : 'w-2 bg-white/20'}`}
                    />
                ))}
            </div>
        </section>
    )
}
