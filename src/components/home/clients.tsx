
"use client"

import Image from "next/image"
import { motion } from "framer-motion"

export function Clients() {
    // Generate array for 1.png to 20.png
    const clientLogos = Array.from({ length: 20 }, (_, i) => `/clients/${i + 1}.png`)

    return (
        <section className="py-24 bg-white overflow-hidden">
            <div className="max-w-7xl mx-auto px-4">
                <div className="text-center mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="text-3xl md:text-4xl font-black text-slate-900 mb-4"
                    >
                        이미 많은 단체와 기업이<br />
                        <span className="text-primary">그린 뉴메틱</span>과 함께하고 있습니다
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="text-slate-500 font-medium"
                    >
                        혁신적인 파트너십을 통해 미래를 함께 그려나갑니다.
                    </motion.p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-8 md:gap-12 items-center opacity-60">
                    {clientLogos.map((logo, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.8 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.05 }}
                            className="flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-300 hover:opacity-100"
                        >
                            <div className="relative h-12 w-full max-w-[140px]">
                                <Image
                                    src={logo}
                                    alt={`Client Logo ${index + 1}`}
                                    fill
                                    className="object-contain"
                                    unoptimized
                                />
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
