"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"

interface PaginationProps {
    currentPage: number
    totalPages: number
    onPageChange: (page: number) => void
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
    if (totalPages <= 1) return null

    const getPageNumbers = () => {
        const pages = []
        const showMax = 5 // Maximum number of page buttons to show (excluding ellipses)

        if (totalPages <= showMax) {
            for (let i = 1; i <= totalPages; i++) pages.push(i)
        } else {
            // Always show first page
            pages.push(1)

            if (currentPage > 3) {
                pages.push("ellipsis-1")
            }

            // Show pages around current page
            const start = Math.max(2, currentPage - 1)
            const end = Math.min(totalPages - 1, currentPage + 1)

            for (let i = start; i <= end; i++) {
                if (!pages.includes(i)) pages.push(i)
            }

            if (currentPage < totalPages - 2) {
                pages.push("ellipsis-2")
            }

            // Always show last page
            if (!pages.includes(totalPages)) pages.push(totalPages)
        }
        return pages
    }

    return (
        <div className="flex items-center justify-center gap-2 pt-6">
            <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="rounded-xl h-9 px-3"
            >
                <ChevronLeft className="h-4 w-4 mr-1" />
                이전
            </Button>

            <div className="flex items-center gap-1">
                {getPageNumbers().map((page, index) => {
                    if (typeof page === "string") {
                        return (
                            <div key={`ellipsis-${index}`} className="w-9 h-9 flex items-center justify-center text-slate-400">
                                <MoreHorizontal className="h-4 w-4" />
                            </div>
                        )
                    }

                    return (
                        <Button
                            key={page}
                            variant={currentPage === page ? "default" : "outline"}
                            size="sm"
                            onClick={() => onPageChange(page)}
                            className={`w-9 h-9 p-0 rounded-xl transition-all ${currentPage === page
                                    ? "bg-slate-900 text-white shadow-sm scale-105"
                                    : "text-slate-600 hover:bg-slate-50"
                                }`}
                        >
                            {page}
                        </Button>
                    )
                })}
            </div>

            <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="rounded-xl h-9 px-3"
            >
                다음
                <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
        </div>
    )
}
