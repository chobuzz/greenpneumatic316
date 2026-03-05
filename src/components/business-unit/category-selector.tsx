
"use client"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Category, MediaItem, Product } from "@/lib/db"
import { ChevronRight, MessageSquare, ExternalLink, BookOpen } from "lucide-react"

interface CategorySelectorProps {
    categories: Category[]
    unitProducts: Product[]
}

// YouTube 영상 ID 추출
function getYoutubeId(url: string): string | null {
    try {
        const parsed = new URL(url)
        if (parsed.hostname.includes('youtube.com')) return parsed.searchParams.get('v')
        if (parsed.hostname === 'youtu.be') return parsed.pathname.slice(1)
    } catch { }
    return null
}

// 미디어 렌더 컴포넌트
function MediaSection({ items }: { items: MediaItem[] }) {
    if (!items || items.length === 0) return null

    return (
        <div className="space-y-6">
            {items.map((item, idx) => {
                if (item.type === 'youtube') {
                    const videoId = getYoutubeId(item.url)
                    if (!videoId) return null
                    return (
                        <div key={idx} className="rounded-2xl overflow-hidden border border-slate-100 bg-white shadow-sm">
                            <div className="aspect-video w-full">
                                <iframe
                                    src={`https://www.youtube.com/embed/${videoId}`}
                                    className="w-full h-full"
                                    title={item.title || 'YouTube 영상'}
                                    allowFullScreen
                                />
                            </div>
                            {item.title && (
                                <div className="px-5 py-3 border-t border-slate-100">
                                    <p className="font-semibold text-slate-800 text-sm">{item.title}</p>
                                </div>
                            )}
                        </div>
                    )
                }

                if (item.type === 'image') {
                    return (
                        <div key={idx} className="rounded-2xl overflow-hidden border border-slate-100 bg-white shadow-sm">
                            <img src={item.url} alt={item.title || ''} className="w-full h-auto block" />
                            {item.title && (
                                <div className="px-5 py-3 border-t border-slate-100">
                                    <p className="font-semibold text-slate-700 text-sm">{item.title}</p>
                                </div>
                            )}
                        </div>
                    )
                }

                if (item.type === 'link' || item.type === 'embed') {
                    return (
                        <a
                            key={idx}
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-4 p-5 rounded-2xl border border-slate-200 bg-white hover:border-green-400 hover:shadow-md transition-all group"
                        >
                            {item.thumbnail ? (
                                <div className="w-20 h-16 rounded-xl overflow-hidden flex-shrink-0 border border-slate-100">
                                    <img src={item.thumbnail} alt="" className="w-full h-full object-cover" />
                                </div>
                            ) : (
                                <div className="w-16 h-16 rounded-xl bg-slate-100 flex-shrink-0 flex items-center justify-center">
                                    <ExternalLink className="h-6 w-6 text-slate-400" />
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-slate-800 text-sm group-hover:text-green-700 transition-colors truncate">
                                    {item.title || item.url}
                                </p>
                                <p className="text-xs text-slate-400 truncate mt-0.5">{item.url}</p>
                            </div>
                            <ExternalLink className="h-4 w-4 text-slate-300 group-hover:text-green-500 flex-shrink-0 transition-colors" />
                        </a>
                    )
                }

                return null
            })}
        </div>
    )
}

export default function CategorySelector({ categories, unitProducts }: CategorySelectorProps) {
    const sortedAll = [...categories].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

    // 레벨별
    const level1 = sortedAll.filter(c => !c.parentId);

    const [activeL1, setActiveL1] = useState<string>("")
    const [activeL2, setActiveL2] = useState<string>("")   // "" = 전체
    const [activeL3, setActiveL3] = useState<string>("")   // "" = 전체
    const [isExpanded, setIsExpanded] = useState(false)
    const gridRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!activeL1 && level1.length > 0) {
            setActiveL1(level1[0].id)
        }
    }, [level1, activeL1])

    // 대분류 선택 시 중분류 목록
    const level2 = sortedAll.filter(c => c.parentId === activeL1)
    // 중분류 선택 시 소분류 목록
    const level3 = sortedAll.filter(c => c.parentId === activeL2)

    // 제품 필터링
    const activeProducts = unitProducts.filter(p => {
        if (!activeL1) return false;
        const pCatIds = Array.isArray(p.categoryIds) ? p.categoryIds : [];
        const pCatId = (p as any).categoryId;

        const has = (id: string) => pCatIds.includes(id) || pCatId === id;

        if (activeL3) {
            return has(activeL3);
        }

        if (activeL2) {
            // 중분류 선택: 중분류 + 그 하위 소분류들까지
            const sub3Ids = sortedAll.filter(c => c.parentId === activeL2).map(c => c.id);
            return has(activeL2) || sub3Ids.some(id => has(id));
        }

        // 대분류 선택: 대분류 + 모든 중분류 + 모든 소분류
        const sub2Ids = sortedAll.filter(c => c.parentId === activeL1).map(c => c.id);
        const sub3Ids = sortedAll.filter(c => sub2Ids.includes(c.parentId ?? "")).map(c => c.id);
        const allIds = [activeL1, ...sub2Ids, ...sub3Ids];
        return pCatIds.some(id => allIds.includes(id)) || allIds.includes(pCatId);
    })

    // 현재 선택된(가장 구체적인) 카테고리의 mediaItems
    const getActiveMediaItems = (): MediaItem[] => {
        const tryId = activeL3 || activeL2 || activeL1
        if (!tryId) return []
        const cat = sortedAll.find(c => c.id === tryId)
        return cat?.mediaItems || []
    }

    const activeMediaItems = getActiveMediaItems()
    const hasMedia = activeMediaItems.length > 0

    if (level1.length === 0) return null

    return (
        <div className="py-16">
            <style jsx>{`
                /* ─── 대분류 탭 바 ─── */
                .cs-l1-bar {
                    position: relative;
                    background: #ffffff;
                    border-bottom: 1px solid #f1f5f9;
                    padding: 12px 0;
                    margin-bottom: 0;
                }
                .cs-l1-inner {
                    max-width: 80rem;
                    margin: 0 auto;
                    padding: 0 12px;
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
                    gap: 8px;
                }
                .cs-l1-tab {
                    background: #fff;
                    border: 1.5px solid #e5e7eb;
                    border-radius: 12px;
                    padding: 10px 8px;
                    text-align: center;
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(.4,0,.2,1);
                    font-size: 12px;
                    font-weight: 700;
                    color: #64748b;
                    word-break: keep-all;
                    line-height: 1.4;
                }
                .cs-l1-tab:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 16px rgba(0,0,0,0.06);
                    border-color: #059669;
                    color: #047857;
                }
                .cs-l1-tab.active {
                    border-color: #059669;
                    background: linear-gradient(135deg, #059669, #047857);
                    color: #fff;
                    box-shadow: 0 8px 24px rgba(5,150,105,0.28);
                    transform: translateY(-1px);
                }

                /* ─── 중분류 필 바 ─── */
                .cs-l2-bar {
                    background: linear-gradient(to bottom, #f0fdf4, #fff);
                    border-bottom: 1px solid #bbf7d0;
                    padding: 12px 0;
                    margin-bottom: 0;
                }
                .cs-l2-inner {
                    max-width: 80rem;
                    margin: 0 auto;
                    padding: 0 12px;
                    display: flex;
                    flex-wrap: wrap;
                    gap: 8px;
                    align-items: center;
                }
                .cs-l2-label {
                    font-size: 11px;
                    font-weight: 800;
                    color: #6b7280;
                    letter-spacing: 0.06em;
                    text-transform: uppercase;
                    padding-right: 4px;
                    flex-shrink: 0;
                }
                .cs-pill {
                    padding: 7px 14px;
                    border-radius: 99px;
                    font-size: 13px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.22s cubic-bezier(.4,0,.2,1);
                    border: 1.5px solid #e2e8f0;
                    background: #fff;
                    color: #475569;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.04);
                    word-break: keep-all;
                }
                .cs-pill:hover {
                    background: #f0fdf4;
                    color: #166534;
                    border-color: #86efac;
                    box-shadow: 0 3px 10px rgba(22,163,74,0.10);
                }
                .cs-pill.l2-active {
                    background: #16a34a;
                    color: #fff;
                    border-color: #16a34a;
                    box-shadow: 0 6px 18px rgba(22,163,74,0.30);
                    transform: translateY(-1px);
                }

                /* ─── 소분류 필 바 ─── */
                .cs-l3-bar {
                    padding: 10px 0 14px;
                    background: #fff;
                    border-bottom: 2px solid #f0fdf4;
                    margin-bottom: 0;
                }
                .cs-l3-inner {
                    max-width: 80rem;
                    margin: 0 auto;
                    padding: 0 12px;
                    display: flex;
                    flex-wrap: wrap;
                    gap: 6px;
                    align-items: center;
                }
                .cs-l3-label {
                    font-size: 11px;
                    font-weight: 800;
                    color: #6b7280;
                    letter-spacing: 0.06em;
                    text-transform: uppercase;
                    padding-right: 4px;
                    flex-shrink: 0;
                }
                .cs-pill.l3-active {
                    background: #0d9488;
                    color: #fff;
                    border-color: #0d9488;
                    box-shadow: 0 6px 16px rgba(13,148,136,0.28);
                    transform: translateY(-1px);
                }

                /* ─── 크럼 표시 ─── */
                .cs-breadcrumb {
                    max-width: 80rem;
                    margin: 10px auto 0;
                    padding: 0 12px;
                    display: flex;
                    align-items: center;
                    gap: 5px;
                    font-size: 11px;
                    color: #94a3b8;
                    flex-wrap: wrap;
                }
                .cs-breadcrumb .crumb { font-weight: 600; color: #64748b; }
                .cs-breadcrumb .crumb.active { color: #059669; font-weight: 700; }

                /* ─── 제품 그리드 ─── */
                .cs-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 14px;
                    transition: max-height 0.6s ease;
                }
                @media (min-width: 480px) {
                    .cs-grid {
                        grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
                        gap: 20px;
                    }
                }
                @media (min-width: 768px) {
                    .cs-grid {
                        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
                        gap: 24px;
                    }
                    .cs-l1-inner {
                        padding: 0 24px;
                        grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
                        gap: 10px;
                    }
                    .cs-l1-tab {
                        font-size: 13px;
                        padding: 14px 10px;
                        border-radius: 14px;
                    }
                    .cs-l2-inner, .cs-l3-inner {
                        padding: 0 24px;
                        gap: 10px;
                    }
                    .cs-l2-bar { padding: 18px 0; }
                    .cs-l3-bar { padding: 14px 0 18px; }
                    .cs-pill { padding: 10px 22px; font-size: 14px; }
                    .cs-breadcrumb { padding: 0 16px; font-size: 12px; }
                }
                .cs-card {
                    background: #fff;
                    border-radius: 16px;
                    padding: 14px;
                    text-align: center;
                    border: 1.5px solid #f1f5f9;
                    transition: all 0.35s ease;
                    text-decoration: none;
                }
                @media (min-width: 768px) {
                    .cs-card {
                        border-radius: 20px;
                        padding: 20px;
                    }
                }
                .cs-card:hover {
                    box-shadow: 0 20px 48px rgba(0,0,0,0.07);
                    transform: translateY(-6px);
                    border-color: #22c55e;
                }
                .cs-img-wrap {
                    width: 100%;
                    aspect-ratio: 1;
                    margin-bottom: 12px;
                    position: relative;
                    background: #f8fafc;
                    border-radius: 12px;
                    overflow: hidden;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                @media (min-width: 768px) {
                    .cs-img-wrap { margin-bottom: 16px; border-radius: 14px; }
                }
                .cs-nav-wrap {
                    position: relative;
                }
            `}</style>

            {/* 제목 */}
            <div className="text-center mb-10">
                <h2 className="text-3xl font-bold text-slate-900 mb-2">제품 카테고리</h2>
                <p className="text-slate-500 text-sm">카테고리를 선택하여 관련 제품을 확인하세요</p>
                <div className="flex items-center justify-center gap-2 mt-4">
                    {[
                        { label: "대분류", color: "bg-emerald-700/10 text-emerald-800 border-emerald-200" },
                        { label: "중분류", color: "bg-green-600/10 text-green-700 border-green-200" },
                        { label: "소분류", color: "bg-teal-500/10 text-teal-700 border-teal-200" },
                    ].map((item, i) => (
                        <div key={i} className="flex items-center gap-1.5">
                            {i > 0 && <ChevronRight className="h-3 w-3 text-slate-300" />}
                            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${item.color}`}>{item.label}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* 네비게이션 전체를 sticky로 묶음 */}
            <div className="cs-nav-wrap">
                {/* 대분류 탭 */}
                <div className="cs-l1-bar">
                    <div className="cs-l1-inner">
                        {level1.map(cat => (
                            <div
                                key={cat.id}
                                className={`cs-l1-tab ${activeL1 === cat.id ? 'active' : ''}`}
                                onClick={() => {
                                    setActiveL1(cat.id)
                                    setActiveL2("")
                                    setActiveL3("")
                                    setIsExpanded(false)
                                }}
                            >
                                {cat.name}
                            </div>
                        ))}
                    </div>
                </div>

                {/* 중분류 필 바 */}
                {level2.length > 0 && (
                    <div className="cs-l2-bar">
                        <div className="cs-l2-inner">
                            <span className="cs-l2-label">중분류</span>
                            <button
                                className={`cs-pill ${activeL2 === "" ? 'l2-active' : ''}`}
                                onClick={() => { setActiveL2(""); setActiveL3(""); setIsExpanded(false); }}
                            >전체</button>
                            {level2.map(cat => (
                                <button
                                    key={cat.id}
                                    className={`cs-pill ${activeL2 === cat.id ? 'l2-active' : ''}`}
                                    onClick={() => {
                                        setActiveL2(cat.id)
                                        setActiveL3("")
                                        setIsExpanded(false)
                                    }}
                                >
                                    {cat.name}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* 소분류 필 바 - 중분류 선택 시에만 표시 */}
                {activeL2 && level3.length > 0 && (
                    <div className="cs-l3-bar">
                        <div className="cs-l3-inner">
                            <span className="cs-l3-label">소분류</span>
                            <button
                                className={`cs-pill l3 ${activeL3 === "" ? 'l3-active' : ''}`}
                                onClick={() => { setActiveL3(""); setIsExpanded(false); }}
                            >전체</button>
                            {level3.map(cat => (
                                <button
                                    key={cat.id}
                                    className={`cs-pill l3 ${activeL3 === cat.id ? 'l3-active' : ''}`}
                                    onClick={() => {
                                        setActiveL3(cat.id)
                                        setIsExpanded(false)
                                    }}
                                >
                                    {cat.name}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* 브레드크럼 */}
                {(activeL1) && (
                    <div className="cs-breadcrumb bg-white pb-3">
                        <span className={`crumb ${!activeL2 && !activeL3 ? 'active' : ''}`}>
                            {level1.find(c => c.id === activeL1)?.name}
                        </span>
                        {activeL2 && (
                            <>
                                <ChevronRight className="h-3 w-3 text-slate-300 flex-shrink-0" />
                                <span className={`crumb ${!activeL3 ? 'active' : ''}`}>
                                    {level2.find(c => c.id === activeL2)?.name}
                                </span>
                            </>
                        )}
                        {activeL3 && (
                            <>
                                <ChevronRight className="h-3 w-3 text-slate-300 flex-shrink-0" />
                                <span className="crumb active">
                                    {level3.find(c => c.id === activeL3)?.name}
                                </span>
                            </>
                        )}
                        <span className="ml-auto text-slate-400 font-normal">
                            {activeProducts.length}개 제품
                        </span>
                    </div>
                )}
            </div>

            {/* 제품 그리드 */}
            <div className="max-w-7xl mx-auto px-4 pt-8">
                <div ref={gridRef} className="cs-grid">
                    {activeProducts.map((product) => (
                        <Link href={`/products/${product.id}`} key={product.id} className="cs-card group">
                            <div className="cs-img-wrap">
                                {product.images[0] ? (
                                    <Image
                                        src={product.images[0]}
                                        alt={product.name}
                                        fill
                                        className="object-contain p-4 group-hover:scale-110 transition-transform duration-500"
                                        unoptimized
                                    />
                                ) : (
                                    <div className="text-slate-300 text-xs">No Image</div>
                                )}
                            </div>
                            <h3 className="font-bold text-slate-800 mb-1 text-sm group-hover:text-green-600 transition-colors">
                                {product.name}
                            </h3>
                            <p className="text-[10px] text-slate-400 line-clamp-1">
                                {product.description}
                            </p>
                        </Link>
                    ))}

                    {activeProducts.length === 0 && (
                        <div className="col-span-full py-20 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                            <MessageSquare className="h-10 w-10 text-slate-200 mx-auto mb-3" />
                            <p className="text-slate-400 text-sm">선택한 카테고리에 등록된 제품이 없습니다.</p>
                        </div>
                    )}
                </div>

                {/* 카테고리 미디어 컨텐츠 섹션 */}
                {hasMedia && (
                    <div className="mt-12">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="flex-1 h-px bg-slate-100" />
                            <span className="flex items-center gap-2 px-5 py-1.5 rounded-full bg-green-50 border border-green-200 text-green-700 font-bold text-xs">
                                <BookOpen className="h-3.5 w-3.5" />
                                카테고리 컨텐츠
                            </span>
                            <div className="flex-1 h-px bg-slate-100" />
                        </div>
                        <div className="max-w-3xl mx-auto pb-8">
                            <MediaSection items={activeMediaItems} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
