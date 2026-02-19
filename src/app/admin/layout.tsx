
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex min-h-screen flex-col md:flex-row">
            <aside className="w-full md:w-64 bg-slate-900 text-white p-6 flex flex-col">
                <h1 className="text-xl font-bold mb-8">Green Pneumatic Admin</h1>

                <nav className="flex flex-col space-y-8 flex-1">
                    {/* Dashboard */}
                    <div className="space-y-1">
                        <Link href="/admin" className="p-2 hover:bg-slate-800 rounded block text-sm font-medium">
                            대시보드
                        </Link>
                    </div>

                    {/* Homepage Management */}
                    <div className="space-y-1">
                        <h2 className="px-2 text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">홈페이지 관리</h2>
                        <Link href="/admin/business-units" className="p-2 hover:bg-slate-800 rounded block text-sm">
                            사업 분야 관리
                        </Link>
                        <Link href="/admin/products" className="p-2 hover:bg-slate-800 rounded block text-sm">
                            상품 관리
                        </Link>
                        <Link href="/admin/categories" className="p-2 hover:bg-slate-800 rounded block text-sm">
                            카테고리 관리
                        </Link>
                    </div>

                    {/* Content Management */}
                    <div className="space-y-1">
                        <h2 className="px-2 text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">콘텐츠 관리</h2>
                        <Link href="/admin/insights" className="p-2 hover:bg-slate-800 rounded block text-sm">
                            인사이트 관리
                        </Link>
                    </div>

                    {/* Customer Management */}
                    <div className="space-y-1">
                        <h2 className="px-2 text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">고객 관리</h2>
                        <Link href="/admin/quotations" className="p-2 hover:bg-slate-800 rounded block text-sm">
                            견적 관리
                        </Link>
                        <Link href="/admin/inquiries" className="p-2 hover:bg-slate-800 rounded block text-sm">
                            문의 관리
                        </Link>
                        <Link href="/admin/customers" className="p-2 hover:bg-slate-800 rounded block text-sm">
                            전체 고객 관리
                        </Link>
                        <Link href="/admin/email-settings" className="p-2 hover:bg-slate-800 rounded block text-sm">
                            이메일/자동화 설정
                        </Link>
                    </div>

                    <div className="pt-8 mt-auto">
                        <Link href="/" className="p-2 hover:bg-slate-800 rounded block text-sm opacity-60">
                            ← 웹사이트로 돌아가기
                        </Link>
                    </div>
                </nav>
            </aside>
            <main className="flex-1 p-8 bg-slate-50">
                {children}
            </main>
        </div>
    )
}
