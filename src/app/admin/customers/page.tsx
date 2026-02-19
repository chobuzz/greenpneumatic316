
"use client"

import { useEffect, useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Search, User, Building2, Mail, Phone, Calendar, Tag, Info, CheckCircle2, Send, X, ShieldCheck, MapPin, Briefcase, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Pagination } from "@/components/admin/pagination"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { RichTextEditor } from "@/components/admin/rich-text-editor"

export interface Customer {
    id: string;
    source: string;
    ledgerNo?: string;        // 장부번호
    ledgerName?: string;      // 장부명
    name: string;             // 거래처명
    businessNo: string;       // 사업번호
    subBusinessNo?: string;   // 종사업장
    corporationNo?: string;   // 법인등록번호
    ceo: string;              // 대표자
    address: string;          // 사업주소
    businessType?: string;    // 업태
    category: string;         // 종목
    zipCode?: string;         // 우편번호
    address1?: string;        // 실제주소1
    address2?: string;        // 실제주소2
    phone1?: string;          // 전화1
    phone2?: string;          // 전화2
    fax?: string;             // 팩스
    manager: string;          // 담당자
    phone: string;            // 핸드폰
    email: string;            // 이메일
    email2?: string;          // 이메일2
    homepage?: string;        // 홈페이지
    tradeType?: string;       // 거래구분
    treeType?: string;        // 트리구분
    remark?: string;          // 비고
    relatedAccount?: string;  // 관련계정
    className?: string;       // 분류명
    salesManager?: string;    // 영업담당자
    reportOutput?: string;    // 보고서출력여부
    balance?: string;         // 잔액
    salesPrice?: string;      // 매출가격
    smsOptIn?: string;        // SMS발송
    faxOptIn?: string;        // FAX발송
    vatPractice?: string;     // 부가세처리관행
    autoCategory?: string;    // 자동범주
    initialBalance?: string;  // 이월기초잔액
    bankName?: string;        // 은행명
    bankAccount?: string;     // 계좌번호
    accountHolder?: string;   // 예금주
    fixedRate?: string;       // 정률
}

export default function AdminCustomerPage() {
    const [customers, setCustomers] = useState<Customer[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [error, setError] = useState<string | null>(null)
    const [currentPage, setCurrentPage] = useState(1)
    const [selectedIds, setSelectedIds] = useState<string[]>([])
    const [isEmailModalOpen, setIsEmailModalOpen] = useState(false)
    const itemsPerPage = 10

    useEffect(() => {
        setLoading(true)
        setError(null)
        fetch("/api/customers")
            .then(res => {
                if (!res.ok) throw new Error("고객 데이터를 가져오는 데 실패했습니다 (HTTP " + res.status + ")")
                return res.json()
            })
            .then(data => {
                setCustomers(Array.isArray(data) ? data : [])
                setLoading(false)
            })
            .catch((err) => {
                setError(err.message)
                setLoading(false)
            })
    }, [])

    // Universal Search Logic
    const filtered = useMemo(() => {
        if (!searchTerm) return customers
        const lowerTerm = searchTerm.toLowerCase()
        return customers.filter(c => {
            return Object.values(c).some(val =>
                String(val || "").toLowerCase().includes(lowerTerm)
            )
        })
    }, [customers, searchTerm])

    // Reset to page 1 when searching
    useEffect(() => {
        setCurrentPage(1)
    }, [searchTerm])

    const totalPages = Math.ceil(filtered.length / itemsPerPage)
    const paginatedItems = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

    const toggleSelectAllVisible = () => {
        const visibleIds = filtered.map(c => c.id)
        const allVisibleSelected = visibleIds.length > 0 && visibleIds.every(id => selectedIds.includes(id))

        if (allVisibleSelected) {
            // Unselect only those currently visible
            setSelectedIds(prev => prev.filter(id => !visibleIds.includes(id)))
        } else {
            // Select all visible (cumulative with previously selected)
            setSelectedIds(prev => {
                const next = [...prev]
                visibleIds.forEach(id => {
                    if (!next.includes(id)) next.push(id)
                })
                return next
            })
        }
    }

    const toggleSelect = (id: string, e?: React.MouseEvent) => {
        if (e) e.stopPropagation()
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        )
    }

    if (loading) return (
        <div className="p-20 text-center space-y-4">
            <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mx-auto" />
            <p className="text-slate-500 font-medium">구글 스프레드시트에서 고객 데이터를 불러오는 중...</p>
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
        </div>
    )

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">전체 고객 관리</h1>
                    <p className="text-slate-500 mt-1">전자장부 기반 대량 고객 리스트 ({filtered.length}건)</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="업체명, 업태, 종목, 전화, 메일 등 통합 검색..."
                            className="pl-10 h-11 rounded-xl shadow-sm border-slate-200"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    {selectedIds.length > 0 && (
                        <Button
                            onClick={() => setIsEmailModalOpen(true)}
                            className="bg-primary hover:bg-primary/90 h-11 rounded-xl shadow-lg shadow-primary/20 flex items-center gap-2 px-6 animate-in slide-in-from-right-4 duration-300"
                        >
                            <Send className="h-4 w-4" />
                            {selectedIds.length}명에게 이메일 발송
                        </Button>
                    )}
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-sm transition-all duration-300">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2 cursor-pointer group" onClick={toggleSelectAllVisible}>
                            <Checkbox
                                id="select-all"
                                checked={filtered.length > 0 && filtered.every(c => selectedIds.includes(c.id))}
                                onCheckedChange={toggleSelectAllVisible}
                                className="w-5 h-5 rounded-md"
                            />
                            <label className="text-xs font-bold text-slate-600 cursor-pointer group-hover:text-primary transition-colors">
                                현재 결과 전체 선택 ({filtered.length}건)
                            </label>
                        </div>

                        {selectedIds.length > 0 && (
                            <div className="flex items-center gap-3 animate-in fade-in slide-in-from-left-2 duration-300">
                                <div className="h-4 w-[1px] bg-slate-200" />
                                <span className="text-xs font-black text-primary uppercase tracking-widest">총 {selectedIds.length}명 선택됨</span>
                                <button
                                    onClick={() => setSelectedIds([])}
                                    className="text-[10px] font-bold text-slate-400 hover:text-red-500 transition-colors uppercase tracking-tighter underline underline-offset-4"
                                >
                                    선택 해제
                                </button>
                            </div>
                        )}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 italic">
                        <ShieldCheck className="h-3 w-3" /> 수신거부 시트는 발송 시 자동 제외됩니다
                    </div>
                </div>

                {/* Global Selection Banner (Gmail style) */}
                {filtered.length > 0 &&
                    filtered.every(c => selectedIds.includes(c.id)) &&
                    selectedIds.length < customers.length && (
                        <div className="bg-primary/10 border border-primary/20 rounded-xl p-3 text-center animate-in slide-in-from-top-2 duration-300">
                            <p className="text-sm font-medium text-slate-700">
                                현재 페이지의 모든 고객({filtered.length}명)이 선택되었습니다.
                                <button
                                    onClick={() => setSelectedIds(customers.map(c => c.id))}
                                    className="ml-2 text-primary font-bold hover:underline"
                                >
                                    전체 고객({customers.length}명)을 모두 선택하시겠습니까?
                                </button>
                            </p>
                        </div>
                    )}
            </div>

            <div className="grid grid-cols-1 gap-4">
                {paginatedItems.map((customer, index) => (
                    <div
                        key={`${customer.id}-${index}`}
                        className={`bg-white rounded-2xl border transition-all duration-300 p-6 hover:shadow-lg group relative overflow-hidden cursor-pointer ${selectedIds.includes(customer.id) ? 'border-primary ring-1 ring-primary/20 bg-primary/5' : 'border-slate-200'
                            }`}
                        onClick={(e) => toggleSelect(customer.id, e)}
                    >
                        <div className="flex items-start gap-4">
                            <Checkbox
                                checked={selectedIds.includes(customer.id)}
                                onCheckedChange={() => toggleSelect(customer.id)}
                                className="mt-1 w-5 h-5 rounded-md transition-transform group-hover:scale-110"
                            />

                            <div className="flex-1 space-y-4">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-900 text-white">
                                        {customer.source}
                                    </span>
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700">
                                        {customer.tradeType || "일반"}
                                    </span>
                                    <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                                        <Tag className="h-3 w-3" /> {customer.businessNo || "-"}
                                    </span>
                                </div>

                                {/* 기업 핵심 정보 */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 py-4 border-y border-slate-50">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white transition-all">
                                            <Building2 className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">거래처명</p>
                                            <p className="text-sm font-bold text-slate-900">{customer.name}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white transition-all">
                                            <User className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">대표자 / 업태</p>
                                            <p className="text-sm font-bold text-slate-900">{customer.ceo || "-"} <span className="text-xs text-slate-400 font-medium ml-1">({customer.businessType || "-"})</span></p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white transition-all">
                                            <Briefcase className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">담당자 / 핸드폰</p>
                                            <p className="text-sm font-bold text-slate-900">{customer.manager || "-"} / {customer.phone || "-"}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white transition-all">
                                            <Mail className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">이메일</p>
                                            <p className="text-sm font-bold text-slate-900 truncate max-w-[150px]">{customer.email || "-"}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* 추가 세부 정보 */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-slate-50/50 rounded-xl p-3 border border-slate-100 flex items-start gap-2 h-full">
                                        <MapPin className="h-4 w-4 text-slate-400 mt-0.5" />
                                        <div className="text-xs text-slate-600">
                                            <span className="font-bold mr-2 text-slate-400 uppercase text-[9px]">주소</span>
                                            {customer.address || "등록된 주소가 없습니다."}
                                        </div>
                                    </div>
                                    <div className="bg-slate-50/50 rounded-xl p-3 border border-slate-100 flex items-start gap-2 h-full">
                                        <Phone className="h-4 w-4 text-slate-400 mt-0.5" />
                                        <div className="text-xs text-slate-600 grid grid-cols-2 gap-x-4">
                                            <div><span className="font-bold mr-2 text-slate-400 uppercase text-[9px]">전화1</span> {customer.phone1 || "-"}</div>
                                            <div><span className="font-bold mr-2 text-slate-400 uppercase text-[9px]">팩스</span> {customer.fax || "-"}</div>
                                            <div><span className="font-bold mr-2 text-slate-400 uppercase text-[9px]">종목</span> {customer.category || "-"}</div>
                                            <div><span className="font-bold mr-2 text-slate-400 uppercase text-[9px]">거래처 등급</span> {customer.className || "-"}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {filtered.length === 0 && (
                    <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-slate-200">
                        <User className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                        <p className="text-slate-500 font-medium">검색된 고객 데이터가 없습니다.</p>
                        <Button variant="outline" onClick={() => setSearchTerm("")} className="mt-4">전체 보기</Button>
                    </div>
                )}
            </div>

            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
            />

            {/* Manual Email Modal */}
            <ManualEmailModal
                isOpen={isEmailModalOpen}
                onClose={() => setIsEmailModalOpen(false)}
                selectedEmails={customers.filter(c => selectedIds.includes(c.id)).map(c => c.email)}
                selectedNames={customers.filter(c => selectedIds.includes(c.id)).map(c => c.name)}
            />
        </div>
    )
}

function ManualEmailModal({ isOpen, onClose, selectedEmails, selectedNames }: { isOpen: boolean, onClose: () => void, selectedEmails: string[], selectedNames: string[] }) {
    const [subject, setSubject] = useState("")
    const [body, setBody] = useState("")
    const [isSending, setIsSending] = useState(false)

    const handleSend = async () => {
        if (!subject || !body) {
            alert("제목과 본문을 입력해주세요.")
            return
        }

        setIsSending(true)
        try {
            const res = await fetch("/api/admin/customer-emails/send-manual", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    recipients: selectedEmails.map((email, i) => ({ email, name: selectedNames[i] })),
                    subject,
                    body
                })
            })
            if (!res.ok) throw new Error("발송 실패")
            alert(`${selectedEmails.length}명에게 메일 발송을 시작했습니다.`)
            onClose()
        } catch (err) {
            alert("메일 발송 중 오류가 발생했습니다.")
        } finally {
            setIsSending(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-5xl max-h-[92vh] overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 flex flex-col border border-white/20">
                {/* 헤더 */}
                <div className="flex items-center justify-between p-8 bg-gradient-to-r from-slate-50 to-white border-b border-slate-100 flex-shrink-0 relative">
                    <div className="flex items-center gap-5">
                        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                            <Mail className="h-7 w-7" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight">맞춤 이메일 발송</h3>
                            <p className="text-sm font-medium text-slate-500 mt-1 flex items-center gap-2">
                                <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                선택된 <strong className="text-primary font-bold">{selectedEmails.length}명</strong>의 고객에게 특별한 소식을 전합니다.
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all duration-200"
                    >
                        <X className="h-6 w-6" />
                    </button>
                    {/* 상단 장식 라인 */}
                    <div className="absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-primary/50 to-transparent w-full" />
                </div>

                {/* 본문 */}
                <div className="p-8 md:p-10 space-y-8 overflow-y-auto flex-1 custom-scrollbar">
                    <div className="grid grid-cols-1 gap-8">
                        {/* 제목 */}
                        <div className="space-y-3">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 px-1">
                                <span className="w-1 h-3 bg-primary/40 rounded-full" />
                                이메일 제목
                            </label>
                            <Input
                                placeholder="(광고) 제목을 입력하여 고객의 시선을 사로잡으세요..."
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                className="h-14 rounded-2xl border-slate-200 text-lg font-medium focus:ring-4 focus:ring-primary/5 transition-all bg-slate-50/30"
                            />
                        </div>

                        {/* 본문 에디터 */}
                        <div className="space-y-3">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] flex justify-between items-center px-1">
                                <div className="flex items-center gap-2">
                                    <span className="w-1 h-3 bg-primary/40 rounded-full" />
                                    이메일 본문 (에디터 지원)
                                </div>
                                <div className="text-[10px] bg-primary/10 text-primary px-3 py-1 rounded-full font-bold normal-case">
                                    팁: {'{name}'} 치환 코드를 활용해 보세요!
                                </div>
                            </label>
                            <div className="rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                <RichTextEditor
                                    value={body}
                                    onChange={(content) => setBody(content)}
                                    placeholder="멋진 소식을 전해 보세요. {name} 고객님께 가장 먼저 알려드릴게요..."
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* 푸터 */}
                <div className="px-10 py-8 bg-slate-50/50 border-t border-slate-100 flex-shrink-0">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        {/* 수신자 아바타 리스트 */}
                        <div className="flex items-center gap-4">
                            <div className="flex -space-x-3">
                                {selectedNames.slice(0, 6).map((name, i) => (
                                    <div
                                        key={i}
                                        className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 border-2 border-white flex items-center justify-center text-xs font-black text-slate-600 shadow-sm"
                                        title={name}
                                    >
                                        {name.charAt(0)}
                                    </div>
                                ))}
                                {selectedNames.length > 6 && (
                                    <div className="w-10 h-10 rounded-full bg-slate-800 border-2 border-white flex items-center justify-center text-xs font-black text-white shadow-md">
                                        +{selectedNames.length - 6}
                                    </div>
                                )}
                            </div>
                            <div className="text-xs font-semibold text-slate-400">
                                <span className="text-slate-900">{selectedEmails.length}명</span>의 수신자 선택됨
                            </div>
                        </div>

                        {/* 액션 버튼 */}
                        <div className="flex gap-4 w-full md:w-auto">
                            <Button
                                variant="ghost"
                                onClick={onClose}
                                className="rounded-2xl h-14 px-8 text-slate-500 font-bold hover:bg-slate-200/50 transition-all"
                            >
                                나중에 하기
                            </Button>
                            <Button
                                onClick={handleSend}
                                disabled={isSending}
                                className="flex-1 md:flex-none rounded-2xl h-14 px-10 bg-primary text-lg font-black shadow-xl shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-3"
                            >
                                {isSending ? (
                                    <>
                                        <Loader2 className="animate-spin h-5 w-5" />
                                        발송 준비 중...
                                    </>
                                ) : (
                                    <>
                                        <Send className="h-5 w-5" />
                                        발송 시작하기
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #e2e8f0;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #cbd5e1;
                }
            `}</style>
        </div>
    )
}
