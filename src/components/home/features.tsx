
"use client"

import { ShieldCheck, Settings, Award } from "lucide-react"
import { motion } from "framer-motion"

const features = [
    {
        name: "신속하고 책임감 있는 A/S",
        description: "그린뉴메틱은 단순한 제품 공급을 넘어, 고객과의 신뢰를 최우선 가치로 생각합니다.",
        icon: ShieldCheck,
        color: "from-emerald-50 to-emerald-100",
        iconColor: "text-emerald-600"
    },
    {
        name: "고객 맞춤형 솔루션 제공",
        description: "그린뉴메틱의 모든 고객은 최상의 서비스를 제공받아야 하며, 맞춤형 솔루션을 제공하는 것이 우리의 사명입니다.",
        icon: Settings,
        color: "from-blue-50 to-blue-100",
        iconColor: "text-blue-600"
    },
    {
        name: "제품의 퀄리티, 고객의 선택",
        description: "그린뉴메틱은 제품의 품질이 곧 고객 만족과 신뢰의 근간이라고 믿습니다.",
        icon: Award,
        color: "from-indigo-50 to-indigo-100",
        iconColor: "text-indigo-600"
    },
]

export function Features() {
    return (
        <section id="features" className="py-32 bg-slate-50">
            <div className="container px-4 md:px-8">
                <div className="text-center mb-24">
                    <motion.span
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        className="text-primary font-bold text-xs uppercase tracking-[0.3em] mb-4 block"
                    >
                        Why Green Pneumatic
                    </motion.span>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 mb-8"
                    >
                        변함없는 <span className="text-primary">신뢰의 가치</span>
                    </motion.h2>
                    <p className="text-xl text-slate-500 max-w-2xl mx-auto font-medium">
                        그린뉴메틱이 업계 선두를 지켜온 이유는 단순합니다. <br />타협하지 않는 품질과 고객 중심의 서비스 철학입니다.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    {features.map((feature, idx) => (
                        <motion.div
                            key={feature.name}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="relative group p-10 rounded-[2.5rem] bg-white border border-slate-100 hover:border-primary/20 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500"
                        >
                            <div className={`mb-10 inline-flex items-center justify-center h-20 w-20 rounded-3xl bg-gradient-to-br ${feature.color} ${feature.iconColor} shadow-inner`}>
                                <feature.icon className="h-10 w-10" />
                            </div>

                            <h3 className="mb-5 text-2xl font-bold text-slate-900 tracking-tight">{feature.name}</h3>
                            <p className="text-slate-500 leading-relaxed font-medium">
                                {feature.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
