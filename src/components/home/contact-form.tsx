
"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { motion } from "framer-motion"
import { Mail, Phone, MessageSquare, Send } from "lucide-react"
import { useState } from "react"

export function ContactForm() {
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setStatus("loading")

        const formData = new FormData(e.currentTarget)
        const data = Object.fromEntries(formData)

        try {
            const res = await fetch("/api/inquiries", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...data, subject: "[Home Contact] 문의" })
            })
            if (res.ok) setStatus("success")
            else setStatus("error")
        } catch (error) {
            setStatus("error")
        }
    }

    return (
        <section id="contact" className="py-32 bg-white relative">
            <div className="container px-4 md:px-8">
                <div className="bg-slate-900 rounded-[3.5rem] overflow-hidden shadow-2xl">
                    <div className="grid grid-cols-1 lg:grid-cols-2">
                        {/* Info Side (Dark for Contrast) */}
                        <div className="bg-slate-900 p-12 md:p-20 text-white flex flex-col justify-between">
                            <div>
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    whileInView={{ opacity: 1 }}
                                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-8"
                                >
                                    <MessageSquare className="h-3 w-3 text-primary" />
                                    <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Get in Touch</span>
                                </motion.div>
                                <h2 className="text-4xl md:text-5xl font-black mb-10 leading-tight">
                                    비즈니스의 <br />성장을 함께합니다
                                </h2>
                                <p className="text-slate-400 text-lg mb-12 max-w-sm leading-relaxed">
                                    설계 단계부터 유지보수까지, <br />
                                    그린뉴메틱 전문가가 신속하게 <br />
                                    최적의 솔루션을 제안해 드립니다.
                                </p>

                                <div className="space-y-8">
                                    <div className="flex items-center gap-5 group cursor-pointer">
                                        <div className="h-14 w-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-primary transition-colors duration-300">
                                            <Phone className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500 uppercase tracking-widest font-bold mb-1">Professional Support</p>
                                            <p className="text-2xl font-black group-hover:text-primary transition-colors">010-7392-9809</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-5 group cursor-pointer">
                                        <div className="h-14 w-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-secondary transition-colors duration-300">
                                            <Mail className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500 uppercase tracking-widest font-bold mb-1">Direct Email</p>
                                            <p className="text-2xl font-black group-hover:text-secondary transition-colors break-all">greenpneumatic316<br className="md:hidden" />@gmail.com</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-20 pt-10 border-t border-white/5 text-slate-500 text-xs font-medium">
                                <p>© Green Pneumatic Corporation. Excellence in Precision.</p>
                            </div>
                        </div>

                        {/* Form Side (Light for Clarity) */}
                        <div className="p-12 md:p-20 bg-white">
                            {status === "success" ? (
                                <div className="h-full flex flex-col items-center justify-center text-center">
                                    <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center mb-8 animate-bounce">
                                        <Send className="h-10 w-10 text-primary" />
                                    </div>
                                    <h3 className="text-4xl font-black text-slate-900 mb-4">전송 성공!</h3>
                                    <p className="text-slate-500 text-lg font-medium">소중한 문의가 안전하게 접수되었습니다. <br />빠르게 연락 드리겠습니다.</p>
                                    <Button variant="outline" className="mt-10 h-14 px-10 rounded-2xl font-bold border-slate-200" onClick={() => setStatus("idle")}>새로운 문의 작성</Button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-3">
                                            <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] ml-1">담당자 성함</label>
                                            <Input required name="name" placeholder="성함을 입력하세요" className="h-16 rounded-2xl bg-slate-50 border-slate-100 focus:bg-white focus:border-primary/50 transition-all text-slate-900 font-bold px-6" />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] ml-1">회사/기관명</label>
                                            <Input required name="company" placeholder="업체명을 입력하세요" className="h-16 rounded-2xl bg-slate-50 border-slate-100 focus:bg-white focus:border-primary/50 transition-all text-slate-900 font-bold px-6" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-3">
                                            <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] ml-1">연락처</label>
                                            <Input required name="phone" placeholder="연락처를 입력하세요" className="h-16 rounded-2xl bg-slate-50 border-slate-100 focus:bg-white focus:border-primary/50 transition-all text-slate-900 font-bold px-6" />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] ml-1">이메일</label>
                                            <Input required type="email" name="email" placeholder="이메일을 입력하세요" className="h-16 rounded-2xl bg-slate-50 border-slate-100 focus:bg-white focus:border-primary/50 transition-all text-slate-900 font-bold px-6" />
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] ml-1">문의내용</label>
                                        <Textarea required name="message" placeholder="문의사항을 남겨주세요." className="min-h-[180px] rounded-2xl bg-slate-50 border-slate-100 focus:bg-white focus:border-primary/50 transition-all text-slate-900 font-bold px-6 py-5 resize-none" />
                                    </div>
                                    <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                        <input
                                            required
                                            type="checkbox"
                                            name="marketingConsent"
                                            id="marketingConsent"
                                            className="mt-1 h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
                                        />
                                        <label htmlFor="marketingConsent" className="text-sm text-slate-600 font-medium leading-relaxed cursor-pointer select-none">
                                            (필수) 그린뉴메틱 이메일 수신에 동의합니다.
                                        </label>
                                    </div>
                                    <Button type="submit" className="w-full h-20 rounded-2xl text-xl font-black bg-primary hover:bg-primary/90 shadow-2xl shadow-primary/20 transition-all" disabled={status === "loading"}>
                                        {status === "loading" ? "전송 처리 중..." : "문의하기"}
                                    </Button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
