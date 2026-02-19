
"use client"

import { motion } from "framer-motion"
import Image from "next/image"

export function Loading() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-white">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                    duration: 0.8,
                    ease: "easeOut"
                }}
                className="relative"
            >
                {/* Logo with subtle pulse */}
                <motion.div
                    animate={{
                        opacity: [0.8, 1, 0.8],
                        scale: [1, 1.02, 1]
                    }}
                    transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="relative w-24 h-24 mb-6"
                >
                    <Image
                        src="/GREENPNEUMATIC_logo.png"
                        alt="Green Pneumatic Logo"
                        fill
                        className="object-contain"
                    />
                </motion.div>

                {/* Loading Line */}
                <div className="absolute -bottom-2 left-0 w-full h-[2px] bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                        animate={{
                            left: ["-100%", "100%"]
                        }}
                        transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        className="absolute top-0 w-1/2 h-full bg-gradient-to-r from-transparent via-primary/50 to-transparent"
                    />
                </div>
            </motion.div>

            <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] mt-8"
            >
                Loading
            </motion.p>
        </div>
    )
}
