
"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import type { BusinessUnit } from "@/lib/db"
import { Loading } from "@/components/ui/loading"

export default function BusinessUnitList() {
    const [units, setUnits] = useState<BusinessUnit[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch("/api/business-units")
            .then((res) => res.json())
            .then((data) => {
                setUnits(data)
                setLoading(false)
            })
    }, [])

    if (loading) return <Loading />

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">사업 분야 관리</h2>
                <Button asChild>
                    <Link href="/admin/business-units/new">
                        새 사업 분야 추가
                    </Link>
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {units.map((unit) => (
                    <div key={unit.id} className="bg-white rounded-lg shadow overflow-hidden">
                        <div className="h-40 relative bg-gray-200">
                            {/* Use a placeholder if image fails to load or empty */}
                            {unit.image && (
                                <Image
                                    src={unit.image}
                                    alt={unit.name}
                                    fill
                                    className="object-cover"
                                />
                            )}
                        </div>
                        <div className="p-4">
                            <h3 className="font-bold text-lg mb-2">{unit.name}</h3>
                            <p className="text-sm text-gray-500 mb-4 h-10 overflow-hidden text-ellipsis line-clamp-2">
                                {unit.description}
                            </p>
                            <Button asChild size="sm" className="w-full">
                                <Link href={`/admin/business-units/${unit.id}`}>
                                    수정하기
                                </Link>
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
