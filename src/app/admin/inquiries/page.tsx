
"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Trash2, Search, MessageSquare, Calendar, User, Building2, Mail, Phone, ChevronRight } from "lucide-react"
import { Inquiry } from "@/lib/db"
import { Input } from "@/components/ui/input"
import { Pagination } from "@/components/admin/pagination"
import { Loading } from "@/components/ui/loading"

export default function AdminInquiryPage() {
    const [inquiries, setInquiries] = useState<Inquiry[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [error, setError] = useState<string | null>(null)
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 10

    useEffect(() => {
        setLoading(true)
        setError(null)
        fetch("/api/inquiries")
            .then(res => {
                if (!res.ok) throw new Error("데이터를 가져오는 데 실패했습니다 (HTTP " + res.status + ")")
                return res.json()
            })
            .then(data => {
                setInquiries(Array.isArray(data) ? data : [])
                setLoading(false)
            })
            .catch((err) => {
                setError(err.message)
                setLoading(false)
            })
    }, [])

    const filtered = inquiries.filter(i =>
        String(i.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(i.company || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(i.subject || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(i.message || "").toLowerCase().includes(searchTerm.toLowerCase())
    )

    // Reset to page 1 when searching
    useEffect(() => {
        setCurrentPage(1)
    }, [searchTerm])

    const totalPages = Math.ceil(filtered.length / itemsPerPage)
    const paginatedItems = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

    if (loading) return <Loading />

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
                    <h1 className="text-3xl font-bold text-slate-900">상담 문의 관리</h1>
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
                            placeholder="이름, 회사명, 내용 검색..."
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

            <div className="grid grid-cols-1 gap-6">
                {filtered.map((item, index) => (
                    <div key={`${item.id || 'inq'}-${index}`} className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all group">
                        <div className="p-6">
                            <div className="flex flex-col lg:flex-row justify-between gap-6">
                                <div className="flex-1 space-y-4">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-900 text-white">
                                            {item.subject}
                                        </span>
                                        <span className="text-xs text-slate-400 flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            {item.createdAt}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 py-4 border-y border-slate-50">
                                        <div className="flex items-start gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                                                <User className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">성함</p>
                                                <p className="text-sm font-bold text-slate-900">{item.name}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                                                <Building2 className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">업체명</p>
                                                <p className="text-sm font-bold text-slate-900">{item.company || "-"}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                                                <Phone className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">연락처</p>
                                                <p className="text-sm font-bold text-slate-900">{item.phone}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                                                <Mail className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">이메일</p>
                                                <p className="text-sm font-bold text-slate-900">{item.email}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-slate-50/50 rounded-xl p-4">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                                            <MessageSquare className="h-3 w-3" /> 문의 상세 내용
                                        </p>
                                        <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                                            {item.message}
                                        </p>
                                    </div>
                                </div>

                                <div className="lg:w-20 flex lg:flex-col justify-end gap-2 shrink-0">
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="border-slate-200 text-slate-400 hover:bg-slate-50 hover:text-slate-600 rounded-xl"
                                        title="답변 완료 체크 (데모용)"
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {filtered.length === 0 && (
                    <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-slate-200">
                        <MessageSquare className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                        <p className="text-slate-500">검색된 문의 내역이 없습니다.</p>
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
