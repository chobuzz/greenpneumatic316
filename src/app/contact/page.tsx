
"use client"

import { ContactForm } from "@/components/home/contact-form"
import { motion } from "framer-motion"
import { Mail, MessageSquare, Clock, Box, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function ContactPage() {
    return (
        <div className="flex flex-col min-h-screen pt-20">
            {/* Header Section */}
            <section className="bg-slate-50 py-20 border-b border-slate-100">
                <div className="container px-4 md:px-8">
                    <div className="max-w-3xl">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-6"
                        >
                            <Mail className="h-3 w-3 text-primary" />
                            <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Contact Us</span>
                        </motion.div>
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-4xl md:text-5xl font-black text-slate-900 mb-6"
                        >
                            그린뉴메틱에 <br />궁금하신 점을 남겨주세요
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-lg text-slate-500 font-medium leading-relaxed mb-10"
                        >
                            전문 엔지니어가 고객님의 요구사항을 분석하여 <br />
                            최적의 장비와 솔루션을 제안해 드립니다.
                        </motion.p>

                        {/* Online Quote Guidance */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.3 }}
                            className="bg-primary/5 border border-primary/20 rounded-3xl p-8 flex flex-col md:flex-row items-center gap-6"
                        >
                            <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center text-white shrink-0 shadow-lg shadow-primary/20">
                                <Box className="h-8 w-8" />
                            </div>
                            <div className="text-center md:text-left">
                                <h3 className="text-xl font-black text-slate-900 mb-2">원하시는 제품이 있으신가요?</h3>
                                <p className="text-sm text-slate-600 font-medium leading-relaxed">
                                    [사업 분야]에서 제품을 선택하신 후, <strong className="text-primary underline underline-offset-4">"온라인 견적 받기"</strong> 버튼을 누르시면 즉시 공식 견적서(PDF)를 이메일로 받아보실 수 있습니다.
                                </p>
                            </div>
                            <Link
                                href="/business-units"
                                className="h-12 px-6 rounded-xl bg-slate-900 text-white text-xs font-black flex items-center gap-2 hover:bg-slate-800 transition-all shrink-0 ml-auto"
                            >
                                제품 보러가기 <ArrowRight className="h-4 w-4" />
                            </Link>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Form Section */}
            <ContactForm />

            {/* Additional Info Section */}
            <section className="py-20 bg-slate-50">
                <div className="container px-4 md:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
                            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6">
                                <Clock className="h-6 w-6" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-2">빠른 답신</h3>
                            <p className="text-sm text-slate-500 font-medium">영업일 기준 24시간 이내에 <br />전문가가 직접 연락드립니다.</p>
                        </div>
                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
                            <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary mb-6">
                                <MessageSquare className="h-6 w-6" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-2">상세 컨설팅</h3>
                            <p className="text-sm text-slate-500 font-medium">단순 견적을 넘어 기술적인 <br />상담까지 한 번에 해결하세요.</p>
                        </div>
                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
                            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500 mb-6">
                                <Mail className="h-6 w-6" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-2">대량 발주 문의</h3>
                            <p className="text-sm text-slate-500 font-medium">기관 및 기업 단체 발주를 위한 <br />별도의 혜택을 제안해 드립니다.</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}
