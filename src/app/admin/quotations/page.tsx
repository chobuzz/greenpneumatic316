
"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Trash2, Search, FileText, Calendar, User, Building2 } from "lucide-react"
import { Quotation } from "@/lib/db"
import { Input } from "@/components/ui/input"
import { Pagination } from "@/components/admin/pagination"

export default function AdminQuotationPage() {
    const [quotations, setQuotations] = useState<Quotation[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [error, setError] = useState<string | null>(null)
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 10

    useEffect(() => {
        setLoading(true)
        setError(null)
        fetch("/api/quotations")
            .then(res => {
                if (!res.ok) throw new Error("데이터를 가져오는 데 실패했습니다 (HTTP " + res.status + ")")
                return res.json()
            })
            .then(data => {
                setQuotations(Array.isArray(data) ? data : [])
                setLoading(false)
            })
            .catch((err) => {
                setError(err.message)
                setLoading(false)
            })
    }, [])

    const filtered = quotations.filter(q =>
        String(q.customerName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(q.company || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(q.productName || "").toLowerCase().includes(searchTerm.toLowerCase())
    )

    // Reset to page 1 when searching
    useEffect(() => {
        setCurrentPage(1)
    }, [searchTerm])

    const totalPages = Math.ceil(filtered.length / itemsPerPage)
    const paginatedItems = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

    if (loading) return (
        <div className="p-20 text-center space-y-4">
            <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mx-auto" />
            <p className="text-slate-500 font-medium">구글 스프레드시트에서 데이터를 불러오는 중...</p>
        </div>
    )

    if (error) return (
        <div className="p-20 text-center bg-red-50 rounded-[2.5rem] border border-red-100">
            <div className="bg-red-100 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-red-600 text-2xl font-bold">!</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">데이터 로드 실패</h2>
            <p className="text-red-500 font-medium mb-8">{error}</p>
            <Button onClick={() => window.location.reload()} className="bg-slate-900">다시 시도</Button>
            <div className="mt-8 text-sm text-slate-400 max-w-md mx-auto">
                <p>팁: .env.local의 GOOGLE_SCRIPT_URL이 올바른지, </p>
                <p>Apps Script가 '모든 사용자(Anyone)' 권한으로 배포되었는지 확인해 주세요.</p>
            </div>
        </div>
    )

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">견적 내역 관리</h1>
                    <p className="text-slate-500 mt-1">구글 스프레드시트에서 실시간으로 불러온 내역입니다.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                    <Button asChild variant="outline" className="glass">
                        <a href={process.env.NEXT_PUBLIC_SPREADSHEET_URL || "#"} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                            <Building2 className="h-4 w-4" /> 시트 바로가기
                        </a>
                    </Button>
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="이름, 회사명, 상품명 검색..."
                            className="pl-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800 flex items-center gap-3">
                <span className="flex-shrink-0 bg-amber-200 rounded-full w-6 h-6 flex items-center justify-center font-bold">!</span>
                <p>내역 삭제는 구글 스프레드시트에서 직접 진행해 주세요. (웹사이트 DB는 더 이상 사용되지 않습니다)</p>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {paginatedItems.map((quote, index) => (
                    <div key={`${quote.id || 'quote'}-${index}`} className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:shadow-md transition-shadow group">
                        <div className="flex-1 space-y-4">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100 italic">
                                    {quote.createdAt}
                                </span>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                                    {quote.unitName}
                                </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                                        <User className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">고객명</p>
                                        <p className="text-sm font-bold text-slate-800">{quote.customerName}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                                        <Building2 className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">회사명</p>
                                        <p className="text-sm font-bold text-slate-800">{quote.company || "-"}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                                        <FileText className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">선택 상품</p>
                                        <p className="text-sm font-bold text-slate-800 truncate max-w-[150px]">{quote.productName}</p>
                                        <p className="text-[10px] text-slate-400">{quote.modelName} | {quote.quantity}개</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                                        <span className="font-bold text-xs">₩</span>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">총 견적가</p>
                                        <p className="text-sm font-black text-primary">
                                            {typeof quote.totalPrice === 'number'
                                                ? quote.totalPrice.toLocaleString() + '원'
                                                : String(quote.totalPrice).includes('원')
                                                    ? quote.totalPrice
                                                    : quote.totalPrice + '원'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-4 text-xs text-slate-500 pt-1 border-t border-slate-50">
                                <span className="flex items-center gap-1"><span className="font-bold">연락처:</span> {quote.phone}</span>
                                <span className="flex items-center gap-1"><span className="font-bold">이메일:</span> {quote.email}</span>
                            </div>
                        </div>
                    </div>
                ))}

                {filtered.length === 0 && (
                    <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-slate-200">
                        <FileText className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                        <p className="text-slate-500">검색된 견적 내역이 없습니다.</p>
                    </div>
                )}
            </div>

            {/* Pagination UI */}
            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
            />
        </div>
    )
}
