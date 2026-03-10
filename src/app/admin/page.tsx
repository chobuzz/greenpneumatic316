"use client"

import { useEffect, useState } from "react"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts"
import { Building2, Tags, Box, Eye, Calendar } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

export default function AdminDashboard() {
    const [data, setData] = useState<{ products: any[], pageViews: any[], categories: any[], units: any[] }>({
        products: [], pageViews: [], categories: [], units: []
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchDashboard() {
            try {
                // 여러 지표 데이터를 병렬로 모두 가져옵니다.
                const [prodRes, viewRes, catRes, unitRes] = await Promise.all([
                    fetch('/api/products').then(res => res.json()),
                    fetch('/api/pageviews').then(res => res.json()),
                    fetch('/api/categories').then(res => res.json()),
                    fetch('/api/business-units').then(res => res.json())
                ])
                setData({
                    products: Array.isArray(prodRes) ? prodRes : [],
                    pageViews: Array.isArray(viewRes) ? viewRes : [],
                    categories: Array.isArray(catRes) ? catRes : [],
                    units: Array.isArray(unitRes) ? unitRes : []
                })
            } catch (error) {
                console.error("대시보드 데이터를 가져오는데 실패했습니다.", error)
            } finally {
                setLoading(false)
            }
        }
        fetchDashboard()
    }, [])

    if (loading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-8 w-48 mb-6" />
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Skeleton className="h-32 rounded-2xl" />
                    <Skeleton className="h-32 rounded-2xl" />
                    <Skeleton className="h-32 rounded-2xl" />
                    <Skeleton className="h-32 rounded-2xl" />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
                    <Skeleton className="h-[400px] rounded-2xl" />
                    <Skeleton className="h-[400px] rounded-2xl" />
                </div>
            </div>
        )
    }

    // 기간 필터링 삭제 (전체 누적 데이터 취급)
    const filteredPageViews = data.pageViews;

    // 경로를 예쁜 이름으로 변환 (Mapping)
    const getReadableName = (path: string) => {
        if (!path || path === '/') return '메인 홈페이지';

        if (path.startsWith('/products/')) {
            const id = path.split('/')[2];
            const product = data.products.find(p => p.id === id);
            return product ? `상품: ${product.name}` : decodeURIComponent(path);
        }
        if (path.startsWith('/business-units/')) {
            const id = path.split('/')[2];
            const unit = data.units.find(u => u.id === id);
            return unit ? `사업분야: ${unit.name}` : decodeURIComponent(path);
        }
        if (path === '/contact') return '고객지원/문의';
        if (path === '/insights') return '인사이트 공지';
        if (path === '/business-units') return '사업분야 홈';
        if (path.startsWith('/admin')) return '관리자 시스템';

        return decodeURIComponent(path);
    };

    // 지표 요약 계산
    const totalProducts = data.products.length;
    const totalProductViews = data.products.reduce((acc, p) => acc + (Number(p.views) || 0), 0);
    const totalQuoteClicks = data.products.reduce((acc, p) => acc + (Number(p.quoteClicks) || 0), 0);
    const totalPageViews = filteredPageViews.reduce((acc, v) => acc + (Number(v.views) || 0), 0);

    // 1. 많이 본 상품 순서 (Bar Chart 용 데이터 Top 10으로 늘림)
    const topProducts = [...data.products]
        .sort((a, b) => (Number(b.views) || 0) - (Number(a.views) || 0))
        .slice(0, 10)
        .map(p => ({
            name: p.name.length > 10 ? p.name.substring(0, 10) + '...' : p.name,
            '상세 조회수': Number(p.views) || 0,
            '견적 클릭수': Number(p.quoteClicks) || 0,
        }));

    // 2. 가장 많이 본 페이지 경로 Top 10 (Pie Chart 용)
    const aggregatedViews: Record<string, number> = {};
    filteredPageViews.forEach(v => {
        const path = v.path || '/';
        aggregatedViews[path] = (aggregatedViews[path] || 0) + (Number(v.views) || 0);
    });

    const COLORS = ['#1e40af', '#3b82f6', '#0ea5e9', '#06b6d4', '#14b8a6', '#10b981', '#22c55e', '#84cc16', '#eab308', '#f59e0b'];

    const topPages = Object.entries(aggregatedViews)
        .map(([path, views]) => ({
            name: getReadableName(path),
            originalPath: path,
            value: views
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 10);

    // 테이블 렌더링용 전체 누적 기록
    // 조회 발생 건수(views) 높은 순 정렬
    const allPagesAggregated = Object.entries(aggregatedViews)
        .map(([path, views]) => ({
            name: getReadableName(path),
            originalPath: path,
            views: views
        }))
        .sort((a, b) => b.views - a.views);

    return (
        <div className="space-y-8 max-w-7xl pb-16">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">지표 대시보드</h2>

            </div>

            {/* 상단 요약 카드 그리드 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center justify-between group hover:border-primary/50 transition-colors">
                    <div>
                        <p className="text-sm font-bold text-slate-400 mb-1">총 상품 뷰 (누적)</p>
                        <p className="text-3xl font-black text-slate-900">{totalProductViews.toLocaleString()}회</p>
                    </div>
                    <div className="h-14 w-14 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Eye className="h-6 w-6" />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center justify-between group hover:border-primary/50 transition-colors">
                    <div>
                        <p className="text-sm font-bold text-slate-400 mb-1">견적문의 클릭 (누적)</p>
                        <p className="text-3xl font-black text-emerald-600">{totalQuoteClicks.toLocaleString()}건</p>
                    </div>
                    <div className="h-14 w-14 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Box className="h-6 w-6" />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center justify-between group hover:border-primary/50 transition-colors">
                    <div>
                        <p className="text-sm font-bold text-slate-400 mb-1">전체 사이트 방문 (합계)</p>
                        <p className="text-3xl font-black text-violet-600">{totalPageViews.toLocaleString()}회</p>
                    </div>
                    <div className="h-14 w-14 bg-violet-50 text-violet-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Building2 className="h-6 w-6" />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center justify-between group hover:border-primary/50 transition-colors">
                    <div>
                        <p className="text-sm font-bold text-slate-400 mb-1">등록된 상품 수</p>
                        <p className="text-3xl font-black text-amber-600">{totalProducts}개</p>
                    </div>
                    <div className="h-14 w-14 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Tags className="h-6 w-6" />
                    </div>
                </div>
            </div>

            {/* 하단 차트 영역 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* 1. 상품별 조회수/견적수 바 차트 */}
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                    <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center">
                        <div className="w-2 h-6 bg-primary rounded-full mr-3"></div>
                        인기 상품 조회 및 견적 클릭 Top 10
                    </h3>
                    {topProducts.length > 0 ? (
                        <div className="h-[360px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={topProducts} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} tickMargin={10} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickMargin={10} axisLine={false} tickLine={false} />
                                    <Tooltip
                                        cursor={{ fill: '#f8fafc' }}
                                        contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }} />
                                    <Bar dataKey="상세 조회수" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={20} />
                                    <Bar dataKey="견적 클릭수" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="h-[360px] flex items-center justify-center bg-slate-50 rounded-2xl text-slate-400 font-medium">데이터가 충분하지 않습니다.</div>
                    )}
                </div>

                {/* 2. 가장 많이 방문한 페이지 탑 10 (바 차트) */}
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                    <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center">
                        <div className="w-2 h-6 bg-violet-500 rounded-full mr-3"></div>
                        가장 많이 방문한 페이지 Top 10
                    </h3>
                    {topPages.length > 0 ? (
                        <div className="h-[360px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={topPages} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} tickMargin={10} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickMargin={10} axisLine={false} tickLine={false} />
                                    <Tooltip
                                        cursor={{ fill: '#f8fafc' }}
                                        contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }} />
                                    <Bar dataKey="value" name="방문 건수" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={20} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="h-[360px] flex items-center justify-center bg-slate-50 rounded-2xl text-slate-400 font-medium">데이터가 충분하지 않습니다.</div>
                    )}
                </div>
            </div>

            {/* 하단 상세 통계 데이터베이스(테이블) */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden mt-8">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-slate-800 flex items-center">
                        <Calendar className="w-5 h-5 text-slate-400 mr-2" />
                        기록 데이터베이스 종합표
                    </h3>
                    <p className="text-sm text-slate-500">
                        전체 누적 방문 데이터 ({allPagesAggregated.length}건)
                    </p>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50/50 text-slate-500 border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4 font-semibold">페이지 이름</th>
                                <th className="px-6 py-4 font-semibold">원래 주소 경로</th>
                                <th className="px-6 py-4 font-semibold text-right">조회 발생 건수</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {allPagesAggregated.length > 0 ? (
                                allPagesAggregated.map((record, i) => (
                                    <tr key={record.originalPath || i} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-slate-900">
                                            {record.name}
                                        </td>
                                        <td className="px-6 py-4 text-slate-500 font-mono text-xs">
                                            {record.originalPath}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                {record.views}회
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={3} className="px-6 py-12 text-center text-slate-400">
                                        표시할 데이터가 없습니다.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
