"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ShieldCheck, ShieldAlert, Wifi, Server, RefreshCw, ExternalLink } from "lucide-react"

export default function DiagnosticsPage() {
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    const runCheck = async () => {
        setLoading(true)
        try {
            const res = await fetch("/api/admin/diagnostics")
            const json = await res.json()
            setData(json)
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        runCheck()
    }, [])

    return (
        <div className="space-y-8 max-w-4xl">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">시스템 연동 진단</h1>
                <p className="text-slate-500 mt-1">구글 스프레드시트 및 환경 변수 설정 상태를 점검합니다.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 환경 변수 확인 */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                            <ShieldCheck className="h-5 w-5" />
                        </div>
                        <h2 className="font-bold text-lg">환경 변수 설정 (Vercel/Local)</h2>
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-500">GOOGLE_SCRIPT_URL</span>
                            {data?.env?.GOOGLE_SCRIPT_URL === "설정됨 (SENSITIVE)" ? (
                                <span className="text-emerald-600 font-bold flex items-center gap-1">
                                    <ShieldCheck className="h-4 w-4" /> 설정됨
                                </span>
                            ) : (
                                <span className="text-red-500 font-bold flex items-center gap-1">
                                    <ShieldAlert className="h-4 w-4" /> 미설정
                                </span>
                            )}
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-500">SPREADSHEET_URL</span>
                            {data?.env?.NEXT_PUBLIC_SPREADSHEET_URL === "설정됨" ? (
                                <span className="text-emerald-600 font-bold flex items-center gap-1">
                                    <ShieldCheck className="h-4 w-4" /> 설정됨
                                </span>
                            ) : (
                                <span className="text-red-500 font-bold flex items-center gap-1">
                                    <ShieldAlert className="h-4 w-4" /> 미설정
                                </span>
                            )}
                        </div>
                        <div className="flex justify-between items-center text-sm border-t pt-4">
                            <span className="text-slate-500">환경</span>
                            <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded">{data?.env?.NODE_ENV}</span>
                        </div>
                    </div>
                </div>

                {/* 통신 테스트 결과 */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                            <Wifi className="h-5 w-5" />
                        </div>
                        <h2 className="font-bold text-lg">구글 서버 통신 테스트</h2>
                    </div>

                    {!data?.connectionTest ? (
                        <div className="text-center py-4 text-slate-400 text-sm">
                            테스트를 진행하지 않았거나 URL이 없습니다.
                        </div>
                    ) : data.connectionTest.error ? (
                        <div className="space-y-2">
                            <div className="p-3 bg-red-50 rounded-xl text-red-700 text-sm font-medium border border-red-100">
                                오류: {data.connectionTest.error}
                            </div>
                            <p className="text-xs text-slate-400">Vercel 서버에서 구글 서버로의 연결이 차단되었거나 URL이 잘못되었습니다.</p>
                        </div>
                    ) : (
                        <div className="space-y-4 text-sm">
                            <div className="flex justify-between">
                                <span className="text-slate-500">응답 상태</span>
                                <span className={`font-bold ${data.connectionTest.ok ? 'text-emerald-600' : 'text-red-500'}`}>
                                    {data.connectionTest.status} {data.connectionTest.statusText}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">응답 속도</span>
                                <span>{data.connectionTest.durationMs}ms</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">데이터 구조</span>
                                <span className={data.connectionTest.isJson ? 'text-emerald-600 font-medium' : 'text-amber-600 font-medium'}>
                                    {data.connectionTest.isJson ? '정상 (JSON)' : '비정상 (HTML/Text)'}
                                </span>
                            </div>
                            <div className="flex justify-between items-center border-t pt-4">
                                <span className="text-slate-500">로드된 데이터 수</span>
                                <span className="font-bold">{data.connectionTest.dataCount || 0}건</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] relative overflow-hidden">
                <div className="absolute top-0 right-0 p-12 opacity-10">
                    <Server className="h-32 w-32" />
                </div>
                <div className="relative z-10 space-y-4">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                        <ShieldAlert className="h-6 w-6 text-amber-400" /> Vercel 배포 시 주의사항
                    </h3>
                    <ul className="text-slate-300 text-sm space-y-2 list-disc pl-5">
                        <li><b>환경 변수 필수</b>: Vercel Dashboard의 <code className="bg-slate-800 px-1 rounded">Settings {"->"} Environment Variables</code>에 <code className="bg-slate-800 px-1 rounded text-amber-300">GOOGLE_SCRIPT_URL</code>을 반드시 추가해야 합니다.</li>
                        <li><b>버전 충돌</b>: 로컬의 <code className="bg-slate-800 px-1 rounded">.env.local</code> 파일은 GitHub에 올라가지 않으므로 Vercel에서 직접 입력해야 합니다.</li>
                        <li><b>Anyone 권한</b>: 구글 Apps Script 배포 시 <code className="bg-slate-800 px-1 rounded">Who has access: Anyone</code>으로 설정했는지 확인하세요.</li>
                    </ul>
                    <div className="pt-4 flex gap-4">
                        <Button variant="secondary" onClick={runCheck} disabled={loading} className="rounded-xl">
                            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> 진단 다시 실행
                        </Button>
                        <Button variant="outline" asChild className="rounded-xl bg-white/10 border-white/20 text-white hover:bg-white/20">
                            <a href="https://vercel.com/dashboard" target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-4 w-4 mr-2" /> Vercel 대시보드 열기
                            </a>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
