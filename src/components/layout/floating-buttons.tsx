
"use client"

import { motion, AnimatePresence } from "framer-motion"
import { MessageCircle, FileText, ChevronUp } from "lucide-react"
import { useState, useEffect } from "react"
import Link from "next/link"

export function FloatingButtons() {
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        const toggleVisibility = () => {
            if (window.pageYOffset > 300) {
                setIsVisible(true)
            } else {
                setIsVisible(false)
            }
        }
        window.addEventListener("scroll", toggleVisibility)
        return () => window.removeEventListener("scroll", toggleVisibility)
    }, [])

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        })
    }

    return (
        <div className="fixed bottom-8 right-8 z-[100] flex flex-col gap-4 items-end">
            <AnimatePresence>
                {isVisible && (
                    <motion.button
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 20 }}
                        onClick={scrollToTop}
                        className="w-12 h-12 rounded-full bg-white shadow-xl flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors border border-slate-100"
                    >
                        <ChevronUp className="h-6 w-6" />
                    </motion.button>
                )}
            </AnimatePresence>

            {/* 견적문의 버튼 */}
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
            >
                <Link
                    href="/contact"
                    className="flex items-center gap-3 bg-slate-900 text-white pl-6 pr-5 py-4 rounded-full shadow-2xl hover:bg-slate-800 transition-all hover:scale-105 group"
                >
                    <span className="text-sm font-black tracking-tighter uppercase mb-0.5">견적문의</span>
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-primary transition-colors">
                        <FileText className="h-4 w-4" />
                    </div>
                </Link>
            </motion.div>

            {/* 톡톡문의 버튼 */}
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
            >
                <a
                    href="https://talk.naver.com/profile/wavv6zl"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 bg-[#03C75A] text-white pl-6 pr-5 py-4 rounded-full shadow-2xl hover:opacity-90 transition-all hover:scale-105 group"
                >
                    <span className="text-sm font-black tracking-tighter uppercase mb-0.5">톡톡문의</span>
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
                        <MessageCircle className="h-4 w-4" />
                    </div>
                </a>
            </motion.div>
        </div>
    )
}
