
"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowLeft, ChevronRight } from "lucide-react"

interface UnitHeroProps {
    name: string;
}

export function UnitHero({ name }: UnitHeroProps) {
    return (
        <section className="relative pt-16 pb-10 overflow-hidden bg-slate-50">
            {/* Abstract Background Elements */}
            <div className="absolute inset-0 z-0 overflow-hidden">
                <div className="absolute -top-[10%] -right-[5%] w-[40%] h-[60%] rounded-full bg-emerald-500/5 blur-[100px]" />
                <div className="absolute -bottom-[10%] -left-[5%] w-[30%] h-[50%] rounded-full bg-primary/5 blur-[80px]" />
                <div className="absolute inset-0 opacity-[0.02]"
                    style={{ backgroundImage: `radial-gradient(circle at 2px 2px, #000 1px, transparent 0)`, backgroundSize: '24px 24px' }}
                />
            </div>

            <div className="container relative z-10 px-4 md:px-8">
                <motion.nav
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6"
                >
                    <Link href="/" className="hover:text-primary transition-colors">Home</Link>
                    <ChevronRight className="h-2.5 w-2.5" />
                    <span className="text-slate-900">Division</span>
                </motion.nav>

                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-none mb-4">
                            {name}
                        </h1>
                        <div className="h-1 w-16 bg-primary rounded-full" />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                    >
                        <Link
                            href="/"
                            className="group inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-primary transition-all"
                        >
                            <div className="flex items-center justify-center w-7 h-7 rounded-full border border-slate-200 group-hover:border-primary group-hover:bg-primary group-hover:text-white transition-all">
                                <ArrowLeft className="h-3.5 w-3.5" />
                            </div>
                            메인으로
                        </Link>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}
