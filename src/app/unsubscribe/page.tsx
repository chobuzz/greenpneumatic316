
"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MailCheck, MailX, Loader2, CheckCircle2, AlertCircle } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

function UnsubscribeForm() {
    const searchParams = useSearchParams()
    const [email, setEmail] = useState("")
    const [isAutoFilled, setIsAutoFilled] = useState(false)
    const [isConfirmed, setIsConfirmed] = useState(false)
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
    const [message, setMessage] = useState("")

    useEffect(() => {
        const emailParam = searchParams.get('email')
        if (emailParam) {
            setEmail(emailParam)
            setIsAutoFilled(true)
        }
    }, [searchParams])

    const handleConfirm = () => {
        setIsConfirmed(true)
    }

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault()
        if (!email) return

        setStatus('loading')
        try {
            const res = await fetch("/api/unsubscribe", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            })
            const data = await res.json()

            if (res.ok) {
                setStatus('success')
            } else {
                setStatus('error')
                setMessage(data.error || "수신 거부 처리 중 오류가 발생했습니다.")
            }
        } catch (err) {
            setStatus('error')
            setMessage("서버와 통신하는 중 오류가 발생했습니다.")
        }
    }

    if (status === 'success') {
        return (
            <CardContent className="pt-12 pb-12 text-center space-y-4">
                <div className="flex justify-center">
                    <div className="h-16 w-16 bg-emerald-100 rounded-full flex items-center justify-center">
                        <CheckCircle2 className="h-10 w-10 text-emerald-600" />
                    </div>
                </div>
                <CardTitle className="text-2xl font-bold text-slate-900">수신 거부 완료</CardTitle>
                <p className="text-slate-500 leading-relaxed px-4 text-sm font-medium">
                    <strong>{email}</strong> 계정의 수신 거부 처리가 완료되었습니다.<br />
                    앞으로 그린뉴메틱의 홍보성 메일이 발송되지 않습니다.
                </p>
                <div className="pt-6">
                    <Button asChild variant="outline" className="w-full h-12 rounded-xl border-slate-200">
                        <Link href="/">홈으로 돌아가기</Link>
                    </Button>
                </div>
            </CardContent>
        )
    }

    // Confirmation Step (when linked from email)
    if (isAutoFilled && !isConfirmed) {
        return (
            <CardContent className="pt-10 pb-12 text-center space-y-6">
                <div className="flex justify-center">
                    <div className="h-16 w-16 bg-blue-50 rounded-full flex items-center justify-center">
                        <AlertCircle className="h-10 w-10 text-blue-500" />
                    </div>
                </div>
                <div className="space-y-2">
                    <CardTitle className="text-2xl font-bold text-slate-900">정말로 중단하시겠습니까?</CardTitle>
                    <CardDescription className="text-slate-500">
                        <strong>{email}</strong> 계정으로 더 이상<br />
                        소식을 받지 않으시려면 아래 버튼을 눌러주세요.
                    </CardDescription>
                </div>
                <div className="space-y-3 pt-4">
                    <Button
                        onClick={handleConfirm}
                        className="w-full h-12 text-base font-bold bg-slate-900 hover:bg-slate-800 rounded-xl"
                    >
                        예, 수신 거부하겠습니다
                    </Button>
                    <Button asChild variant="ghost" className="w-full h-11 text-slate-500 hover:text-slate-900">
                        <Link href="/">아니요, 계속 받겠습니다</Link>
                    </Button>
                </div>
            </CardContent>
        )
    }

    return (
        <CardContent className="pb-10 pt-10">
            {isConfirmed ? (
                <div className="text-center space-y-6">
                    <div className="flex justify-center">
                        <div className="h-16 w-16 bg-red-50 rounded-full flex items-center justify-center animate-pulse">
                            <MailX className="h-10 w-10 text-red-500" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-lg font-bold text-slate-900">마지막 확인</h3>
                        <p className="text-sm text-slate-500">
                            버튼을 누르시면 <strong>{email}</strong> 주소로의<br />
                            모든 뉴스레터 발송이 즉시 차단됩니다.
                        </p>
                    </div>
                    <Button
                        onClick={() => handleSubmit()}
                        className="w-full h-12 text-base font-bold bg-red-600 hover:bg-red-700 rounded-xl shadow-lg shadow-red-200"
                        disabled={status === 'loading'}
                    >
                        {status === 'loading' ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                처리 중...
                            </>
                        ) : (
                            "지금 바로 수신 거부"
                        )}
                    </Button>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="text-center mb-6 space-y-2">
                        <div className="flex justify-center mb-4">
                            <MailX className="h-12 w-12 text-slate-400" />
                        </div>
                        <CardTitle className="text-2xl font-bold text-slate-900">뉴스레터 수신 거부</CardTitle>
                        <CardDescription className="text-slate-500">
                            수신을 원하지 않는 이메일 주소를 입력해 주세요.
                        </CardDescription>
                    </div>
                    <div className="space-y-2">
                        <Input
                            type="email"
                            placeholder="email@example.com"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="h-12 text-base rounded-xl border-slate-200"
                            disabled={status === 'loading'}
                        />
                    </div>
                    {status === 'error' && (
                        <p className="text-sm font-medium text-red-500 text-center animate-in fade-in slide-in-from-top-1">
                            {message}
                        </p>
                    )}
                    <Button
                        type="submit"
                        className="w-full h-12 text-base font-bold rounded-xl bg-slate-900 hover:bg-slate-800"
                        disabled={status === 'loading' || !email}
                    >
                        {status === 'loading' ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                처리 중...
                            </>
                        ) : (
                            "수신 거부하기"
                        )}
                    </Button>
                </form>
            )}
            <p className="mt-8 text-[11px] text-center text-slate-400 leading-relaxed font-medium">
                수신 거부 시 더 이상 그린뉴메틱의 새로운 솔루션과<br />
                중요한 소식을 받아보실 수 없습니다.
            </p>
        </CardContent>
    )
}

export default function UnsubscribePage() {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
            <Link href="/" className="mb-8 hover:opacity-80 transition-opacity">
                <div className="relative w-48 h-12">
                    <Image
                        src="/logo.png"
                        alt="그린뉴메틱"
                        fill
                        className="object-contain"
                    />
                </div>
            </Link>

            <Card className="w-full max-w-md shadow-2xl border-none rounded-[2rem] overflow-hidden bg-white/80 backdrop-blur-xl">
                <Suspense fallback={
                    <div className="p-20 text-center">
                        <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
                    </div>
                }>
                    <UnsubscribeForm />
                </Suspense>
            </Card>

            <footer className="mt-8 text-center text-slate-300 text-[10px] font-black uppercase tracking-[0.2em]">
                Green Pneumatic &copy; 2026 Admin Management System
            </footer>
        </div>
    )
}
