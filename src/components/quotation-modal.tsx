
"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X, Download, FileCheck, Building2, User, Phone, Mail, Loader2 } from "lucide-react"
import type { Product, ProductModel } from "@/lib/db"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"

interface QuotationModalProps {
    isOpen: boolean;
    onClose: () => void;
    product: Product;
    unitName: string;
    selectedModel: ProductModel;
    selectedOptions: { groupName: string, name: string, price: number }[];
    quantity: number;
}

export function QuotationModal({ isOpen, onClose, product, unitName, selectedModel, selectedOptions = [], quantity }: QuotationModalProps) {
    const [userInfo, setUserInfo] = useState({
        name: "",
        company: "",
        phone: "",
        email: "",
        marketingConsent: false
    })
    const [isGenerating, setIsGenerating] = useState(false)
    const [previewImage, setPreviewImage] = useState<string | null>(null)
    const templateRef = useRef<HTMLDivElement>(null)

    if (!isOpen) return null;

    const basePrice = selectedModel.price || 0
    const optionsPrice = selectedOptions.reduce((acc, opt) => acc + opt.price, 0)
    const unitPrice = basePrice + optionsPrice
    const totalPrice = unitPrice * quantity
    const vat = totalPrice * 0.1
    const finalTotal = totalPrice + vat

    const handleGenerateAndSend = async () => {
        if (!templateRef.current) return;

        setIsGenerating(true)
        try {
            // 1. Generate Image for Preview & PDF
            await new Promise(resolve => setTimeout(resolve, 500));
            const canvas = await html2canvas(templateRef.current, {
                scale: 2.5,
                useCORS: true,
                logging: false,
                backgroundColor: "#ffffff",
                windowWidth: 1200
            });

            const imgData = canvas.toDataURL('image/png');
            setPreviewImage(imgData);

            // 2. Generate PDF for Email/Storage
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            // Adjust PDF page height if content is longer than A4
            const finalPdf = pdfHeight > 297
                ? new jsPDF('p', 'mm', [pdfWidth, pdfHeight])
                : pdf;

            finalPdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
            const pdfBase64 = finalPdf.output('datauristring');

            // 3. Dispatch to Server (Email & Spreadsheet)
            const response = await fetch("/api/quotations", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    type: "final_quotation",
                    customerName: userInfo.name,
                    company: userInfo.company,
                    phone: userInfo.phone,
                    email: userInfo.email,
                    productName: product.name,
                    modelName: selectedModel.name,
                    selectedOptions: selectedOptions,
                    quantity: quantity,
                    totalPrice: totalPrice,
                    unitName: unitName,
                    pdfBase64: pdfBase64,
                    marketingConsent: userInfo.marketingConsent
                })
            });

            if (response.ok) {
                alert(`견적서가 성공적으로 발급되었습니다.\n${userInfo.email} 주소와 관리자에게 메일이 발송되었습니다.`);
            } else {
                console.error("Dispatch failure");
                alert("발급 내역 기록 중 오류가 발생했으나 미리보기는 생성되었습니다. 관리자에게 문의 부탁드립니다.");
            }

        } catch (err) {
            console.error("Process error:", err);
            alert("처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
        } finally {
            setIsGenerating(false)
        }
    }

    const downloadPdfLocally = () => {
        if (!previewImage) return;
        const img = new Image();
        img.src = previewImage;
        img.onload = () => {
            const pdfWidth = 210; // A4 mm
            const pdfHeight = (img.height * pdfWidth) / img.width;

            const pdf = pdfHeight > 297
                ? new jsPDF('p', 'mm', [pdfWidth, pdfHeight])
                : new jsPDF('p', 'mm', 'a4');

            pdf.addImage(previewImage, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
            pdf.save(`견적서_${product.name}_${userInfo.name || "고객"}.pdf`);
        };
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
            <div className={`bg-white w-full ${previewImage ? 'max-w-4xl' : 'max-w-xl'} rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[95vh] transition-all duration-500`}>

                {/* Header */}
                <div className="bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] p-7 text-white relative overflow-hidden shrink-0">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#10b981]/20 blur-[60px] rounded-full -mr-16 -mt-16" />
                    <div className="relative flex justify-between items-center">
                        <div>
                            <h2 className="text-xl font-bold tracking-tight">
                                {previewImage ? "견적서 미리보기" : "온라인 견적서 발급"}
                            </h2>
                            <p className="text-xs text-slate-400 mt-0.5">그린뉴메틱 공식 온라인 견적 서비스</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="bg-white/10 hover:bg-white/20 p-2 rounded-xl transition-all"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                <div className="p-8 space-y-8 overflow-y-auto custom-scrollbar">
                    {!previewImage ? (
                        <>
                            {/* Selected Item Summary */}
                            <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100 flex items-center gap-4">
                                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center border border-slate-100 overflow-hidden p-1 shrink-0">
                                    <img src={product.images?.[0]} className="w-full h-full object-contain" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[10px] font-black text-[#10b981] uppercase tracking-widest">{unitName}</p>
                                    <h3 className="font-bold text-slate-900 truncate">{product.name}</h3>
                                    <p className="text-xs text-slate-400 font-medium">{selectedModel.name} | {quantity}개</p>
                                    {selectedOptions.length > 0 && (
                                        <p className="text-[10px] text-primary font-bold mt-1">
                                            옵션: {selectedOptions.map(o => `${o.groupName}: ${o.name}`).join(", ")}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Form Input */}
                            <div className="space-y-5">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-500 ml-1 uppercase">담당자 성함 *</label>
                                        <Input
                                            placeholder="성함을 입력하세요"
                                            className="h-12 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all"
                                            value={userInfo.name}
                                            onChange={e => setUserInfo({ ...userInfo, name: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-500 ml-1 uppercase">회사/기관명 *</label>
                                        <Input
                                            placeholder="회사/기관명을 입력하세요"
                                            className="h-12 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all"
                                            value={userInfo.company}
                                            onChange={e => setUserInfo({ ...userInfo, company: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-500 ml-1 uppercase">연락처 *</label>
                                        <Input
                                            placeholder="연락처를 입력하세요"
                                            className="h-12 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all"
                                            value={userInfo.phone}
                                            onChange={e => setUserInfo({ ...userInfo, phone: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-500 ml-1 uppercase">이메일 *</label>
                                        <Input
                                            placeholder="이메일을 입력하세요"
                                            className="h-12 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all"
                                            type="email"
                                            value={userInfo.email}
                                            onChange={e => setUserInfo({ ...userInfo, email: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <input
                                        required
                                        type="checkbox"
                                        id="modalMarketingConsent"
                                        checked={userInfo.marketingConsent}
                                        onChange={e => setUserInfo({ ...userInfo, marketingConsent: e.target.checked })}
                                        className="mt-1 h-4 w-4 rounded border-slate-300 text-[#10b981] focus:ring-[#10b981] cursor-pointer"
                                    />
                                    <label htmlFor="modalMarketingConsent" className="text-[13px] text-slate-600 font-medium leading-relaxed cursor-pointer select-none">
                                        (필수) 그린뉴메틱 이메일 수신에 동의합니다.
                                    </label>
                                </div>
                            </div>

                            <Button
                                className="w-full h-14 text-base font-black rounded-2xl bg-slate-900 hover:bg-slate-800 text-white shadow-xl shadow-slate-100"
                                disabled={!userInfo.name || !userInfo.company || !userInfo.phone || !userInfo.email || !userInfo.marketingConsent || isGenerating}
                                onClick={handleGenerateAndSend}
                            >
                                {isGenerating ? (
                                    <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> 견적서 발급 중...</>
                                ) : (
                                    <><FileCheck className="mr-2 h-5 w-5" /> 견적서 발급 및 확인</>
                                )}
                            </Button>
                        </>
                    ) : (
                        <div className="space-y-6">
                            <div className="relative border-4 border-slate-100 rounded-[2.5rem] overflow-hidden bg-slate-50 shadow-inner group">
                                <div className="max-h-[60vh] overflow-y-auto custom-scrollbar p-4 bg-slate-200/50">
                                    <img src={previewImage} className="w-full h-auto shadow-2xl rounded-sm mx-auto" style={{ maxWidth: '800px' }} />
                                </div>
                                <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-slate-900/10 to-transparent pointer-events-none" />
                            </div>

                            <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 flex items-start gap-3">
                                <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center shrink-0 mt-0.5">
                                    <X className="h-3 w-3 text-white rotate-45" /> {/* Success check proxy */}
                                </div>
                                <div className="text-[13px] text-emerald-800 leading-relaxed">
                                    <b>발송 완료:</b> 견적서가 성공적으로 발송되었습니다. <br />
                                    수신: <b>{userInfo.email}</b> 전송 완료.
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <Button
                                    variant="outline"
                                    className="h-14 rounded-2xl font-bold text-slate-500"
                                    onClick={onClose}
                                >
                                    닫기 (완료)
                                </Button>
                                <Button
                                    className="h-14 rounded-2xl font-black bg-[#0f172a] hover:bg-slate-800 text-white shadow-lg"
                                    onClick={downloadPdfLocally}
                                >
                                    <Download className="mr-2 h-4 w-4" /> PDF 개인 소장
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Premium Quotation Template (Expanded Width for Export) */}
            {/* [CRITICAL FIX] Using strict HEX/RGB to avoid html2canvas "lab" color error */}
            <div className="fixed left-[-9999px] top-0 pointer-events-none select-none">
                <div
                    ref={templateRef}
                    className="w-[240mm] font-sans leading-relaxed"
                    style={{ minHeight: '297mm', color: '#1e293b', backgroundColor: '#ffffff' }}
                >
                    {/* 상단 포인트 라인 */}
                    <div style={{ height: '4px', backgroundColor: '#10b981' }} />

                    <div style={{ padding: '15mm 20mm' }}>
                        {/* 헤더 영역: 정갈한 한글 구성 */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                            <div>
                                <h1 style={{ color: '#0f172a', fontSize: '42px', fontWeight: 900, letterSpacing: '12px', marginBottom: '8px' }}>견 적 서</h1>
                                <div style={{ height: '3px', width: '60px', backgroundColor: '#10b981', marginBottom: '4px' }} />
                                <p style={{ color: '#94a3b8', fontSize: '15px', fontWeight: 700, letterSpacing: '2px' }}>그린뉴메틱 공식 견적 문서</p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <img
                                    src="/uploads/quotation-images/GREENPNEUMATIC_logo.png"
                                    style={{ height: '44px', width: 'auto', marginBottom: '12px', marginLeft: 'auto', objectFit: 'contain' }}
                                    alt="GREEN PNEUMATIC"
                                />
                                <div style={{ color: '#cbd5e1', fontSize: '13px', fontWeight: 700, letterSpacing: '0.05em' }}>
                                    문서번호: GN{new Date().toISOString().slice(2, 10).replace(/-/g, '')}-QT
                                </div>
                            </div>
                        </div>

                        {/* 정보 그리드: 수신 및 발신인 정보 */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '40px', marginBottom: '40px' }}>
                            {/* 수신인 정보 */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div>
                                    <div style={{ color: '#10b981', fontSize: '14px', fontWeight: 900, letterSpacing: '0.1em', marginBottom: '8px' }}>수신</div>
                                    <h2 style={{ color: '#0f172a', fontSize: '36px', fontWeight: 900, borderBottom: '2px solid #f1f5f9', paddingBottom: '12px', marginBottom: '16px' }}>
                                        {userInfo.company || userInfo.name} <span style={{ color: '#94a3b8', fontSize: '20px', fontWeight: 400 }}>귀중</span>
                                    </h2>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '16px' }}>
                                    <div style={{ display: 'flex', gap: '20px' }}>
                                        <span style={{ color: '#94a3b8', minWidth: '80px', fontWeight: 700 }}>견적일자</span>
                                        <span style={{ color: '#475569', fontWeight: 500 }}>{new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                    </div>
                                    <div style={{ display: 'flex', gap: '20px' }}>
                                        <span style={{ color: '#94a3b8', minWidth: '80px', fontWeight: 700 }}>유효기간</span>
                                        <span style={{ color: '#475569', fontWeight: 500 }}>발급일로부터 10일간</span>
                                    </div>
                                    <div style={{ display: 'flex', gap: '20px' }}>
                                        <span style={{ color: '#94a3b8', minWidth: '80px', fontWeight: 700 }}>수신메일</span>
                                        <span style={{ color: '#475569', fontWeight: 500 }}>{userInfo.email || "-"}</span>
                                    </div>
                                </div>
                            </div>

                            {/* 발송인 정보 (도장 위치 최적화) */}
                            <div>
                                <div style={{ color: '#10b981', fontSize: '14px', fontWeight: 900, letterSpacing: '0.1em', marginBottom: '8px' }}>공급자</div>
                                <div style={{ border: '1px solid #f1f5f9', borderRadius: '12px', padding: '24px', backgroundColor: '#ffffff', position: 'relative' }}>
                                    <h3 style={{ color: '#0f172a', fontSize: '20px', fontWeight: 900, marginBottom: '20px' }}>주식회사 그린뉴메틱</h3>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '15px', lineHeight: 1.5 }}>
                                        <p style={{ display: 'flex', gap: '12px' }}>
                                            <span style={{ color: '#94a3b8', minWidth: '55px', fontWeight: 700 }}>주 소</span>
                                            <span style={{ color: '#475569' }}>경기도 양평군 강상면 다래길 27</span>
                                        </p>
                                        <p style={{ display: 'flex', gap: '12px' }}>
                                            <span style={{ color: '#94a3b8', minWidth: '55px', fontWeight: 700 }}>전 화</span>
                                            <span style={{ color: '#475569' }}>010-7392-9809</span>
                                        </p>
                                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                            <span style={{ color: '#94a3b8', minWidth: '55px', fontWeight: 700 }}>대표자</span>
                                            <span style={{ color: '#0f172a', fontWeight: 800 }}>
                                                정 성 희
                                                <span style={{ position: 'relative', marginLeft: '8px', fontWeight: 400, color: '#94a3b8', display: 'inline-block' }}>
                                                    (인)
                                                    {/* 도장 이미지를 (인) 글자와 겹치게 배치 */}
                                                    <img
                                                        src="/uploads/quotation-images/GN_도장.png"
                                                        style={{
                                                            position: 'absolute',
                                                            top: '60%',
                                                            left: '50%',
                                                            transform: 'translate(-50%, -50%)',
                                                            width: '100px',
                                                            height: 'auto',
                                                            objectFit: 'contain',
                                                            opacity: 0.9,
                                                            zIndex: 10
                                                        }}
                                                        alt="직인"
                                                    />
                                                </span>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 합계금액 영역: 폰트 사이즈 최적화 */}
                        <div style={{ borderTop: '2px solid #0f172a', borderBottom: '1px solid #f1f5f9', padding: '24px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                            <div>
                                <h3 style={{ color: '#0f172a', fontSize: '24px', fontWeight: 900, marginBottom: '4px' }}>합계 금액 <span style={{ color: '#94a3b8', fontSize: '14px', fontWeight: 400, marginLeft: '8px' }}>(부가세 별도)</span></h3>
                                <p style={{ color: '#10b981', fontSize: '12px', fontWeight: 700, letterSpacing: '0.1em' }}>TOTAL AMOUNT CALCULATION</p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ color: '#0f172a', fontSize: '32px', fontWeight: 900, letterSpacing: '-0.02em' }}>
                                    <span style={{ fontSize: '18px', fontWeight: 700, marginRight: '8px', verticalAlign: 'middle' }}>KRW</span>
                                    {totalPrice.toLocaleString()}
                                </div>
                            </div>
                        </div>

                        {/* 품목 테이블: 글자 크기 확대 및 간격 조정 */}
                        <div style={{ marginBottom: '40px' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '16px' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid #0f172a' }}>
                                        <th style={{ padding: '12px 8px', width: '60px', fontWeight: 900, textAlign: 'center' }}>번호</th>
                                        <th style={{ padding: '12px 8px', textAlign: 'left', fontWeight: 900 }}>품목 및 사양</th>
                                        <th style={{ padding: '12px 8px', width: '80px', fontWeight: 900, textAlign: 'center' }}>단위</th>
                                        <th style={{ padding: '12px 8px', width: '80px', fontWeight: 900, textAlign: 'center' }}>수량</th>
                                        <th style={{ padding: '12px 8px', width: '180px', fontWeight: 900, textAlign: 'right' }}>금액 (단가)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <td style={{ padding: '24px 8px', textAlign: 'center', color: '#cbd5e1', fontWeight: 700 }}>01</td>
                                        <td style={{ padding: '24px 8px' }}>
                                            <div style={{ color: '#0f172a', fontSize: '20px', fontWeight: 900, marginBottom: '4px' }}>{product.name}</div>
                                            <div style={{ color: '#10b981', fontSize: '14px', fontWeight: 700, textTransform: 'uppercase', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span>모델명: {selectedModel.name}</span>
                                                <span style={{ fontSize: '13px', color: '#64748b' }}>단가: {selectedModel.price.toLocaleString()}원</span>
                                            </div>
                                            {selectedOptions.length > 0 && (
                                                <div style={{ marginTop: '8px', borderTop: '1px dashed #e2e8f0', paddingTop: '8px' }}>
                                                    {selectedOptions.map((opt, i) => (
                                                        <div key={i} style={{ fontSize: '13px', color: '#64748b', display: 'flex', justifyContent: 'space-between' }}>
                                                            <span>• {opt.groupName}: {opt.name}</span>
                                                            <span>+{opt.price.toLocaleString()}원</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </td>
                                        <td style={{ padding: '24px 8px', textAlign: 'center', color: '#64748b' }}>EA</td>
                                        <td style={{ padding: '24px 8px', textAlign: 'center', color: '#0f172a', fontWeight: 700, fontSize: '18px' }}>{quantity}</td>
                                        <td style={{ padding: '24px 8px', textAlign: 'right', color: '#0f172a', fontWeight: 900, fontSize: '22px' }}>
                                            {totalPrice.toLocaleString()}
                                        </td>
                                    </tr>
                                    {selectedModel.description && (
                                        <tr>
                                            <td style={{ padding: '0' }}></td>
                                            <td colSpan={4} style={{ padding: '20px 8px', backgroundColor: '#fcfcfc' }}>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                    <div style={{ color: '#94a3b8', fontSize: '13px', fontWeight: 900, letterSpacing: '0.1em' }}>상세 기술 사양 (SPECIFICATIONS)</div>
                                                    <div style={{ color: '#475569', fontSize: '15px', lineHeight: 1.7, whiteSpace: 'pre-wrap', paddingLeft: '12px', borderLeft: '2px solid #10b981' }}>
                                                        {selectedModel.description}
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* 참고사항: 하단 높이 축소 */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '40px', alignItems: 'flex-start', borderTop: '1px solid #f1f5f9', paddingTop: '32px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <h4 style={{ color: '#0f172a', fontSize: '15px', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <div style={{ width: '6px', height: '6px', backgroundColor: '#10b981', borderRadius: '50%' }} />
                                    견적 참고사항 (Terms)
                                </h4>
                                <div style={{ color: '#94a3b8', fontSize: '14px', lineHeight: 1.8, fontWeight: 500 }}>
                                    <p>• 본 제품은 결제 확인 후 납품이 가능합니다.</p>
                                    <p>• 본 견적은 발급일로부터 유효기간 동안 유효합니다.</p>
                                </div>
                            </div>

                            <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <div style={{ color: '#0f172a', fontSize: '16px', fontWeight: 900 }}>주식회사 그린뉴메틱</div>
                                <p style={{ color: '#cbd5e1', fontSize: '13px', lineHeight: 1.6 }}>
                                    그린뉴메틱은 고객님의 성공적인 비지니스를 지향합니다.<br />
                                    항상 최상의 가치와 정직한 서비스로 보답하겠습니다.
                                </p>
                            </div>
                        </div>

                        {/* Footer 제거 (사용자 요청: 지워줘) */}
                    </div>

                    {/* 하단 포인트 라인 축소 */}
                    <div style={{ height: '6px', backgroundColor: '#fcfcfc', marginTop: 'auto' }} />
                </div>
            </div>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
            `}</style>
        </div>
    )
}
