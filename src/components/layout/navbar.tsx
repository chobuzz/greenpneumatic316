
"use client"

import * as React from "react"
import Link from "next/link"
import { Menu, X, ChevronDown, ArrowRight, Box, Zap, Pipette, Cylinder, Send } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { usePathname } from "next/navigation"

export function Navbar() {
    const [isOpen, setIsOpen] = useState(false)
    const [scrolled, setScrolled] = useState(false)
    const [hoveredItem, setHoveredItem] = useState<string | null>(null)
    const [expandedItem, setExpandedItem] = useState<string | null>(null)
    const pathname = usePathname()

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20)
        }
        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    const [dbBusinessUnits, setDbBusinessUnits] = useState<any[]>([])

    // Icon mapping based on ID
    const getUnitIcon = (id: string) => {
        switch (id) {
            case "green-science": return <Pipette className="h-5 w-5" />;
            case "power-air": return <Zap className="h-5 w-5" />;
            case "vacuum-to-zero": return <Box className="h-5 w-5" />;
            case "tank-nara": return <Cylinder className="h-5 w-5" />;
            default: return <Box className="h-5 w-5" />;
        }
    }

    useEffect(() => {
        const fetchBUs = async () => {
            try {
                const res = await fetch("/api/business-units")
                if (res.ok) {
                    const data = await res.json()
                    setDbBusinessUnits(data)
                }
            } catch (err) {
                console.error("Failed to fetch business units for navbar", err)
            }
        }
        fetchBUs()
    }, [])

    // Merge DB data with local icons
    const businessUnits = dbBusinessUnits.map(bu => ({
        id: bu.id,
        name: bu.name,
        desc: bu.description, // Use real description from DB
        icon: getUnitIcon(bu.id)
    }))

    const navLinks = [
        { name: "사업 분야", href: "/business-units", hasDropdown: true },
        { name: "인사이트", href: "/insights" },
        { name: "문의하기", href: "/contact" },
    ]

    return (
        <>
            {/* Mobile Nav Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        key="mobile-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[999]"
                    >
                        {/* Solid Backdrop */}
                        <div className="absolute inset-0 bg-slate-900/60" onClick={() => setIsOpen(false)} />

                        <motion.div
                            key="mobile-menu-panel"
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="absolute top-0 right-0 h-full w-[85%] md:w-[400px] bg-white shadow-2xl flex flex-col overflow-hidden"
                        >
                            {/* Header in Menu */}
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                <Image src="/GREENPNEUMATIC_logo.png" alt="Logo" width={140} height={30} className="object-contain" />
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-2 rounded-xl h-10 w-10 bg-slate-900 text-white flex items-center justify-center hover:bg-slate-800 transition-colors"
                                >
                                    <X className="h-6 w-6" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto">
                                <nav className="p-6 space-y-8">
                                    {navLinks.map((link) => {
                                        const isContact = link.name === "문의하기";
                                        const isExpanded = expandedItem === link.name;

                                        return (
                                            <div key={link.name} className="space-y-4">
                                                <div className="flex items-center justify-between group/link">
                                                    <div className="flex items-center gap-3 w-full">
                                                        <div className={cn(
                                                            "h-1 w-6 rounded-full transition-all duration-300",
                                                            isExpanded ? "bg-primary w-12" : "bg-slate-200"
                                                        )} />
                                                        {link.hasDropdown ? (
                                                            <div className="flex items-center gap-4">
                                                                <button
                                                                    onClick={() => setExpandedItem(isExpanded ? null : link.name)}
                                                                    className="text-2xl font-black text-slate-900 text-left flex items-center gap-2"
                                                                >
                                                                    {link.name}
                                                                    <ChevronDown className={cn(
                                                                        "h-5 w-5 text-slate-400 transition-transform duration-300",
                                                                        isExpanded && "rotate-180 text-primary"
                                                                    )} />
                                                                </button>
                                                                <Link
                                                                    href={link.href}
                                                                    className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1 bg-primary/5 px-2.5 py-1 rounded-full"
                                                                    onClick={() => setIsOpen(false)}
                                                                >
                                                                    전체보기 <ArrowRight className="h-3 w-3" />
                                                                </Link>
                                                            </div>
                                                        ) : (
                                                            <Link
                                                                href={link.href}
                                                                className={cn(
                                                                    "text-2xl font-black transition-all flex items-center justify-center gap-3",
                                                                    isContact
                                                                        ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-2xl px-8 py-5 shadow-2xl shadow-green-600/30 text-center flex-1 mt-6 hover:shadow-green-600/40 hover:scale-[1.02] active:scale-[0.98]"
                                                                        : "text-slate-900"
                                                                )}
                                                                onClick={() => setIsOpen(false)}
                                                            >
                                                                {isContact && <Send className="h-6 w-6" />}
                                                                {link.name}
                                                            </Link>
                                                        )}
                                                    </div>
                                                </div>

                                                {link.hasDropdown && (
                                                    <AnimatePresence>
                                                        {isExpanded && (
                                                            <motion.div
                                                                initial={{ height: 0, opacity: 0 }}
                                                                animate={{ height: "auto", opacity: 1 }}
                                                                exit={{ height: 0, opacity: 0 }}
                                                                transition={{ duration: 0.3, ease: "easeInOut" }}
                                                                className="overflow-hidden"
                                                            >
                                                                <div className="grid grid-cols-1 gap-3 pl-2 py-2">
                                                                    {businessUnits.map((bu) => (
                                                                        <Link
                                                                            key={bu.id}
                                                                            href={`/business-units?tab=${bu.id}`}
                                                                            className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-transparent hover:border-primary/20 hover:bg-white transition-all group"
                                                                            onClick={() => setIsOpen(false)}
                                                                        >
                                                                            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                                                                                {bu.icon}
                                                                            </div>
                                                                            <div>
                                                                                <h4 className="text-sm font-black text-slate-900">{bu.name}</h4>
                                                                                <p className="text-[10px] text-slate-500 font-medium">{bu.desc}</p>
                                                                            </div>
                                                                        </Link>
                                                                    ))}
                                                                </div>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                )}
                                            </div>
                                        );
                                    })}
                                </nav>
                            </div>

                            {/* Footer in Menu */}
                            <div className="p-8 bg-slate-900 text-white">
                                <div className="space-y-6">
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Direct Contact</p>
                                        <p className="text-xl font-black tracking-tight text-white">010-7392-9809</p>
                                    </div>
                                    <div className="pt-6 border-t border-white/10 flex justify-between items-center">
                                        <p className="text-[9px] font-medium text-slate-400">
                                            Trusted Industrial Partner <br />
                                            Green Pneumatic Ltd.
                                        </p>
                                        <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                                            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <header className={cn(
                "fixed top-0 z-50 w-full transition-all duration-300",
                "bg-white/90 backdrop-blur-xl border-b border-slate-200/60 py-3 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_4px_6px_-2px_rgba(0,0,0,0.05)]"
            )}>
                <div className="container flex items-center justify-between px-4 md:px-8">
                    {/* Logo */}
                    <Link href="/" className="relative z-10 flex items-center group">
                        <div className="relative w-48 h-10">
                            <Image
                                src="/GREENPNEUMATIC_logo.png"
                                alt="Green Pneumatic Logo"
                                fill
                                className="object-contain"
                                priority
                            />
                        </div>
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden lg:flex items-center gap-10">
                        <div className="flex items-center gap-8">
                            {navLinks.map((link) => (
                                <div
                                    key={link.name}
                                    className="relative group"
                                    onMouseEnter={() => setHoveredItem(link.hasDropdown ? "bu" : null)}
                                    onMouseLeave={() => setHoveredItem(null)}
                                >
                                    <Link
                                        href={link.href}
                                        className={cn(
                                            "text-sm font-bold transition-all flex items-center gap-2 py-2",
                                            link.name === "문의하기"
                                                ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-full hover:shadow-xl hover:shadow-green-600/30 shadow-lg shadow-green-600/20 ml-4 hover:scale-105 active:scale-95"
                                                : pathname === link.href
                                                    ? "text-primary border-b-2 border-primary"
                                                    : "text-slate-600 hover:text-primary"
                                        )}
                                    >
                                        {link.name === "문의하기" && <Send className="h-4 w-4" />}
                                        {link.name}
                                        {link.hasDropdown && <ChevronDown className={cn("h-3 w-3 transition-transform", hoveredItem === "bu" && "rotate-180")} />}
                                    </Link>

                                    {/* Hover Dropdown for Business Units */}
                                    {link.hasDropdown && (
                                        <AnimatePresence>
                                            {hoveredItem === "bu" && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                    transition={{ duration: 0.2 }}
                                                    className="absolute top-full right-0 w-[600px] pt-4"
                                                >
                                                    <div className="bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-100 overflow-hidden p-8 grid grid-cols-2 gap-4">
                                                        <div className="col-span-2 mb-4 border-b border-slate-50 pb-4 flex justify-between items-center">
                                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Our Core Business Units</span>
                                                            <Link href="/business-units" className="text-primary text-[11px] font-bold hover:underline flex items-center gap-1">
                                                                전체보기 <ArrowRight className="h-3 w-3" />
                                                            </Link>
                                                        </div>
                                                        {businessUnits.map((bu) => (
                                                            <Link
                                                                key={bu.id}
                                                                href={`/business-units?tab=${bu.id}`}
                                                                className="flex items-start gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-colors group/item"
                                                            >
                                                                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover/item:bg-primary group-hover/item:text-white transition-all">
                                                                    {bu.icon}
                                                                </div>
                                                                <div>
                                                                    <h4 className="text-sm font-black text-slate-900 mb-1 group-hover/item:text-primary transition-colors">{bu.name}</h4>
                                                                    <p className="text-[11px] text-slate-500 font-medium leading-relaxed">{bu.desc}</p>
                                                                </div>
                                                            </Link>
                                                        ))}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="h-6 w-[1px] bg-slate-200" />

                    </nav>

                    {/* Mobile/Tablet Nav Toggle */}
                    <button
                        className="lg:hidden h-12 w-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-lg active:scale-95 transition-all"
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                </div>
            </header>
        </>
    )
}
