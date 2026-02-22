
"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Loader2, CheckCircle2, XCircle, MailX, ShieldOff, ArrowLeft } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

function UnsubscribeForm() {
    const searchParams = useSearchParams()
    const [email, setEmail] = useState("")
    const [isAutoFilled, setIsAutoFilled] = useState(false)
    const [step, setStep] = useState<'input' | 'confirm' | 'loading' | 'success' | 'error'>('input')
    const [errorMessage, setErrorMessage] = useState("")

    useEffect(() => {
        const emailParam = searchParams.get('email')
        if (emailParam) {
            setEmail(emailParam)
            setIsAutoFilled(true)
            setStep('confirm')
        }
    }, [searchParams])

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault()
        if (!email) return
        setStep('confirm')
    }

    const handleConfirm = async () => {
        setStep('loading')
        try {
            const res = await fetch("/api/unsubscribe", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            })
            const data = await res.json()
            if (res.ok) {
                setStep('success')
            } else {
                setStep('error')
                setErrorMessage(data.error || "처리 중 오류가 발생했습니다.")
            }
        } catch {
            setStep('error')
            setErrorMessage("서버와 통신하는 중 오류가 발생했습니다.")
        }
    }

    // ── 성공 화면 ──────────────────────────────────────────
    if (step === 'success') {
        return (
            <div className="text-center space-y-6 py-4">
                <div className="relative mx-auto w-20 h-20">
                    <div className="absolute inset-0 bg-emerald-100 rounded-full animate-ping opacity-30" />
                    <div className="relative h-20 w-20 bg-emerald-50 border-2 border-emerald-200 rounded-full flex items-center justify-center">
                        <CheckCircle2 className="h-10 w-10 text-emerald-500" />
                    </div>
                </div>
                <div className="space-y-2">
                    <h2 className="text-xl font-bold text-slate-800">수신 거부 완료</h2>
                    <p className="text-sm text-slate-500 leading-relaxed">
                        <span className="font-semibold text-slate-700">{email}</span><br />
                        위 주소로 더 이상 메일이 발송되지 않습니다.
                    </p>
                </div>
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" />
                    홈으로 돌아가기
                </Link>
            </div>
        )
    }

    // ── 에러 화면 ──────────────────────────────────────────
    if (step === 'error') {
        return (
            <div className="text-center space-y-6 py-4">
                <div className="h-20 w-20 mx-auto bg-red-50 border-2 border-red-200 rounded-full flex items-center justify-center">
                    <XCircle className="h-10 w-10 text-red-500" />
                </div>
                <div className="space-y-2">
                    <h2 className="text-xl font-bold text-slate-800">오류 발생</h2>
                    <p className="text-sm text-slate-500">{errorMessage}</p>
                </div>
                <button
                    onClick={() => setStep('input')}
                    className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" />
                    다시 시도하기
                </button>
            </div>
        )
    }

    // ── 로딩 ──────────────────────────────────────────────
    if (step === 'loading') {
        return (
            <div className="flex flex-col items-center justify-center gap-4 py-10">
                <Loader2 className="h-10 w-10 animate-spin text-emerald-500" />
                <p className="text-sm text-slate-500 font-medium">처리 중입니다...</p>
            </div>
        )
    }

    // ── 확인 단계 ─────────────────────────────────────────
    if (step === 'confirm') {
        return (
            <div className="text-center space-y-6 py-2">
                <div className="h-20 w-20 mx-auto bg-orange-50 border-2 border-orange-200 rounded-full flex items-center justify-center">
                    <ShieldOff className="h-10 w-10 text-orange-400" />
                </div>
                <div className="space-y-2">
                    <h2 className="text-xl font-bold text-slate-800">정말 수신 거부하시겠어요?</h2>
                    <p className="text-sm text-slate-500 leading-relaxed">
                        <span className="font-semibold text-slate-700">{email}</span><br />
                        위 주소로 발송되는 모든 홍보 메일이 차단됩니다.
                    </p>
                </div>

                {/* 구분선 경고 박스 */}
                <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 text-left space-y-1">
                    <p className="text-xs font-semibold text-orange-600 uppercase tracking-wider">주의</p>
                    <p className="text-xs text-slate-500 leading-relaxed">
                        수신 거부 후에는 새로운 제품 소식, 특별 할인, 기술 인사이트 등의 정보를 더 이상 받아보실 수 없습니다.
                    </p>
                </div>

                <div className="flex flex-col gap-3 pt-2">
                    <button
                        onClick={handleConfirm}
                        className="w-full h-12 rounded-2xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-sm transition-all active:scale-[0.98] shadow-lg shadow-slate-200"
                    >
                        네, 수신 거부하겠습니다
                    </button>
                    <Link
                        href="/"
                        className="w-full h-11 rounded-2xl border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-800 font-medium text-sm transition-all flex items-center justify-center gap-1"
                    >
                        아니요, 계속 받겠습니다
                    </Link>
                </div>
            </div>
        )
    }

    // ── 이메일 입력 단계 ──────────────────────────────────
    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <div className="text-center space-y-3 pb-2">
                <div className="h-20 w-20 mx-auto bg-slate-100 border-2 border-slate-200 rounded-full flex items-center justify-center">
                    <MailX className="h-10 w-10 text-slate-400" />
                </div>
                <div className="space-y-1">
                    <h2 className="text-xl font-bold text-slate-800">뉴스레터 수신 거부</h2>
                    <p className="text-sm text-slate-500">
                        수신 거부할 이메일 주소를 입력해 주세요.
                    </p>
                </div>
            </div>

            <div className="space-y-3">
                <input
                    type="email"
                    placeholder="email@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-12 px-4 rounded-2xl border-2 border-slate-200 bg-slate-50 focus:outline-none focus:border-slate-400 focus:bg-white text-sm text-slate-800 placeholder:text-slate-400 transition-all"
                />
                <button
                    type="submit"
                    disabled={!email}
                    className="w-full h-12 rounded-2xl bg-slate-800 hover:bg-slate-900 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-sm transition-all active:scale-[0.98] shadow-lg shadow-slate-200"
                >
                    다음 단계
                </button>
            </div>

            <p className="text-center text-[11px] text-slate-400 leading-relaxed pt-2">
                수신 거부 처리 후에는 홍보성 메일 발송이 즉시 차단됩니다.
            </p>
        </form>
    )
}

export default function UnsubscribePage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{
            background: "linear-gradient(135deg, #f0fdf4 0%, #f8fafc 50%, #f0f9ff 100%)"
        }}>
            {/* 배경 장식 */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-100 rounded-full opacity-40 blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-sky-100 rounded-full opacity-40 blur-3xl" />
            </div>

            {/* 로고 */}
            <Link href="/" className="mb-8 relative z-10 hover:opacity-70 transition-opacity">
                <div className="relative w-44 h-10">
                    <Image
                        src="/logo.png"
                        alt="그린뉴메틱"
                        fill
                        className="object-contain"
                    />
                </div>
            </Link>

            {/* 카드 */}
            <div className="relative z-10 w-full max-w-sm">
                <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-2xl shadow-slate-200/60 border border-white/60 p-8">
                    <Suspense fallback={
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
                        </div>
                    }>
                        <UnsubscribeForm />
                    </Suspense>
                </div>
            </div>

            {/* 푸터 */}
            <footer className="relative z-10 mt-8 text-center">
                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest">
                    Green Pneumatic &copy; 2026
                </p>
            </footer>
        </div>
    )
}
