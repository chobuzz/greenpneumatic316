"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Mail, Info, Save, Loader2 } from "lucide-react"
import { RichTextEditor } from "@/components/admin/rich-text-editor"

export default function EmailSettingsPage() {
    const [settings, setSettings] = useState({
        subject: "",
        body: "",
        senderAddress: "",
        senderPhone: "",
        isAd: true
    })
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        fetch("/api/admin/email-settings")
            .then(res => res.json())
            .then(data => {
                setSettings({
                    subject: data.subject || "",
                    body: data.body || "",
                    senderAddress: data.senderAddress || "",
                    senderPhone: data.senderPhone || "",
                    isAd: data.isAd ?? true
                })
                setLoading(false)
            })
            .catch(err => {
                console.error("Failed to fetch settings:", err)
                setLoading(false)
            })
    }, [])

    const cleanEmailBody = (html: string): string => {
        // 빈 태그 제거
        let cleaned = html.replace(/<h3>\s*<\/h3>/gi, '');
        cleaned = cleaned.replace(/<p>\s*<\/p>/gi, '');
        cleaned = cleaned.replace(/&nbsp;/g, ' ');
        return cleaned.trim();
    }

    const handleSave = async () => {
        setSaving(true)
        try {
            const cleanedSettings = {
                ...settings,
                body: cleanEmailBody(settings.body)
            };

            // base64 이미지 포함 여부 확인
            if (cleanedSettings.body.includes('data:image/')) {
                alert("본문에 직접 복사하여 넣은 이미지가 포함되어 있습니다.\n이미지 버튼을 사용하여 업로드해 주세요.\n(용량이 커서 전송이 불가능할 수 있습니다.)");
                setSaving(false);
                return;
            }

            const res = await fetch("/api/admin/email-settings", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(cleanedSettings),
            })
            if (res.ok) {
                alert("이메일 설정이 저장되었습니다.")
            } else {
                throw new Error("Failed to save")
            }
        } catch (err) {
            alert("저장에 실패했습니다.")
        } finally {
            setSaving(false)
        }
    }



    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            </div>
        )
    }

    return (
        <div className="max-w-6xl mx-auto space-y-10 p-6 md:p-12 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="relative group">
                <div className="absolute -inset-4 bg-gradient-to-r from-primary/10 to-transparent rounded-[3rem] blur-2xl opacity-0 group-hover:opacity-100 transition duration-1000"></div>
                <div className="relative">
                    <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4 flex items-center gap-4 text-slate-900">
                        <div className="p-3 bg-primary rounded-2xl shadow-xl shadow-primary/20 text-white">
                            <Mail className="h-8 w-8" />
                        </div>
                        이메일 마케팅 설정
                    </h2>
                    <p className="text-lg font-medium text-slate-500 max-w-2xl leading-relaxed">
                        고객의 마음을 움직이는 자동 발송 메시지. <br className="hidden md:block" />
                        템플릿과 필수 법적 정보를 한 곳에서 세밀하게 관리하세요.
                    </p>
                </div>
            </div>

            {/* 메일 템플릿 카드 */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.04)] overflow-hidden transition-all hover:shadow-[0_30px_60px_rgba(0,0,0,0.06)]">
                <div className="flex items-center gap-4 p-8 bg-gradient-to-r from-slate-50 to-white border-b border-slate-100">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-sm border border-primary/10">
                        <Mail className="h-6 w-6" />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-slate-900">메일 템플릿 마스터</h3>
                        <p className="text-sm font-semibold text-slate-400 mt-0.5">브랜드 아이덴티티를 담은 멋진 본문을 작성해 보세요.</p>
                    </div>
                </div>

                <div className="p-8 md:p-10 space-y-8">
                    {/* 광고 체크박스 */}
                    <label htmlFor="isAd" className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl cursor-pointer hover:bg-amber-100 transition-colors">
                        <input
                            type="checkbox"
                            id="isAd"
                            checked={settings.isAd}
                            onChange={(e) => setSettings({ ...settings, isAd: e.target.checked })}
                            className="w-5 h-5 accent-primary cursor-pointer"
                        />
                        <div>
                            <p className="text-sm font-bold text-amber-900">제목 앞에 (광고) 접두사 자동 추가</p>
                            <p className="text-xs text-amber-700 mt-0.5">정보통신망법에 따라 광고성 메일에는 (광고) 표시가 권장됩니다.</p>
                        </div>
                    </label>

                    {/* 제목 */}
                    <div className="space-y-4">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] flex justify-between items-center px-1">
                            <span>이메일 제목</span>
                            {settings.isAd && (
                                <span className="text-primary font-black bg-primary/10 px-3 py-1 rounded-full text-[10px] normal-case">
                                    (광고) 태그 자동 추가됨
                                </span>
                            )}
                        </label>
                        <div className="relative group">
                            {settings.isAd && (
                                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-primary font-black text-lg pointer-events-none z-10">
                                    (광고)
                                </div>
                            )}
                            <Input
                                value={settings.subject}
                                onChange={(e) => setSettings({ ...settings, subject: e.target.value })}
                                className={`h-16 rounded-2xl font-bold text-lg border-slate-200 transition-all focus:ring-4 focus:ring-primary/5 bg-slate-50/30 ${settings.isAd ? "pl-20" : "pl-6"}`}
                                placeholder="고객의 궁금증을 자아내는 제목을 입력하세요."
                            />
                        </div>
                    </div>

                    {/* 치환 코드 안내 */}
                    <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-100 rounded-2xl">
                        <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <div className="text-xs text-blue-700 space-y-1">
                            <p className="font-bold">치환 코드 안내</p>
                            <p>본문에 <code className="bg-blue-100 px-1 rounded font-mono">{"{name}"}</code> → 업체명, <code className="bg-blue-100 px-1 rounded font-mono">{"{email}"}</code> → 이메일 주소로 자동 변환됩니다.</p>
                        </div>
                    </div>

                    {/* 본문 에디터 */}
                    <div className="space-y-4">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] flex justify-between items-center px-1">
                            <div className="flex items-center gap-2">
                                <span className="w-1 h-3 bg-primary/40 rounded-full" />
                                메일 본문 콘텐츠
                            </div>
                            <span className="text-emerald-500 normal-case font-black text-[10px] bg-emerald-50 px-3 py-1 rounded-full">
                                프리미엄 에디터 모드
                            </span>
                        </label>
                        <div className="rounded-[2rem] border border-slate-200 overflow-hidden shadow-inner">
                            <RichTextEditor
                                value={settings.body}
                                onChange={(content) => setSettings({ ...settings, body: content })}
                                placeholder="<p>안녕하세요, {name}님. 그린뉴메틱의 최신 소식을 전해드립니다.</p>"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* 발송자 정보 카드 */}
            <div className="bg-white rounded-[2.5rem] border border-emerald-100 shadow-[0_20px_50px_rgba(0,0,0,0.04)] overflow-hidden transition-all hover:shadow-[0_30px_60px_rgba(0,0,0,0.06)]">
                <div className="flex items-center gap-4 p-8 bg-gradient-to-r from-emerald-50/50 to-white border-b border-emerald-100">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-200">
                        <Info className="h-6 w-6" />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-slate-900">발송자 정보 및 규제 준수</h3>
                        <p className="text-sm font-semibold text-slate-400 mt-0.5">법적 필수 정보는 브랜드의 신뢰도를 높여줍니다.</p>
                    </div>
                </div>

                <div className="p-8 md:p-10 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">회사 주소</label>
                            <Input
                                value={settings.senderAddress}
                                onChange={(e) => setSettings({ ...settings, senderAddress: e.target.value })}
                                className="h-12 rounded-xl"
                                placeholder="예: 경기도 양평군 다래길 27"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">대표 연락처</label>
                            <Input
                                value={settings.senderPhone}
                                onChange={(e) => setSettings({ ...settings, senderPhone: e.target.value })}
                                className="h-12 rounded-xl"
                                placeholder="예: 010-7392-9809"
                            />
                        </div>
                    </div>

                    {/* 푸터 미리보기 */}
                    <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200 pb-2 mb-3">Email Footer Preview</div>
                        <p className="text-xs text-slate-500 leading-relaxed">
                            본 메일은 정보통신망법 등 관련 규정에 의거하여 수신 동의를 하신 고객님께 발송되었습니다.
                        </p>
                        <p className="text-xs text-slate-600 font-medium">
                            <strong>발송자</strong>: 그린뉴메틱 | {settings.senderAddress || "(주소 미입력)"} | {settings.senderPhone || "(연락처 미입력)"}
                        </p>
                        <p className="text-xs text-slate-500">
                            <strong>수신거부</strong>: 본 메일의 수신을 원하지 않으시면 [수신거부]를 클릭해 주세요.
                        </p>
                    </div>

                    {/* 발송 정책 */}
                    <div className="flex items-start gap-3 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl">
                        <div className="text-xs text-emerald-700 space-y-1">
                            <p className="font-bold text-emerald-800">발송 정책</p>
                            <ul className="list-disc pl-4 space-y-0.5">
                                <li>하루 최대 15~20건 Batch 발송</li>
                                <li>동일 고객 6개월(180일) 주기 순환</li>
                                <li>이메일 주소 중복 자동 제거</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-end pt-4">
                <Button
                    className="w-full md:w-64 h-14 text-lg font-bold rounded-2xl shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                    disabled={saving}
                    onClick={handleSave}
                >
                    {saving ? (
                        <>
                            <Loader2 className="h-6 w-6 animate-spin mr-2" />
                            저장 중...
                        </>
                    ) : (
                        <>
                            <Save className="h-6 w-6 mr-2" />
                            설정 저장하기
                        </>
                    )}
                </Button>
            </div>
        </div>
    )
}
