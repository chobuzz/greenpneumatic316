
"use client"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Category, Product } from "@/lib/db"
import { ChevronRight, MessageSquare, ChevronDown } from "lucide-react"

interface CategorySelectorProps {
    categories: Category[]
    unitProducts: Product[]
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
    const [showMoreBtn, setShowMoreBtn] = useState(false)

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

    // useEffect(() => {
    //     if (gridRef.current) {
    //         const grid = gridRef.current
    //         if (grid.scrollHeight > 500) {
    //             setShowMoreBtn(true)
    //         } else {
    //             setShowMoreBtn(false)
    //         }
    //         grid.style.maxHeight = isExpanded ? "5000px" : "500px"
    //     }
    // }, [activeL1, activeL2, activeL3, isExpanded])

    if (level1.length === 0) return null

    return (
        <div className="py-16">
            <style jsx>{`
                /* ─── 대분류 탭 바 ─── */
                .cs-l1-bar {
    position: relative;
    background: #ffffff;
    border-bottom: 1px solid #f1f5f9;
    padding: 16px 0;
    margin-bottom: 0;
                }
                .cs-l1-inner {
                    max-width: 80rem;
                    margin: 0 auto;
                    padding: 0 16px;
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
                    gap: 10px;
                }
                .cs-l1-tab {
                    background: #fff;
                    border: 1.5px solid #e5e7eb;
                    border-radius: 14px;
                    padding: 14px 10px;
                    text-align: center;
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(.4,0,.2,1);
                    font-size: 13px;
                    font-weight: 700;
                    color: #64748b;
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
                    padding: 18px 0;
                    margin-bottom: 0;
                }
                .cs-l2-inner {
                    max-width: 80rem;
                    margin: 0 auto;
                    padding: 0 24px;
                    display: flex;
                    flex-wrap: wrap;
                    gap: 10px;
                    align-items: center;
                }
                .cs-l2-label {
                    font-size: 12px;
                    font-weight: 800;
                    color: #6b7280;
                    letter-spacing: 0.08em;
                    text-transform: uppercase;
                    padding-right: 6px;
                    flex-shrink: 0;
                }
                .cs-pill {
                    padding: 10px 22px;
                    border-radius: 99px;
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.22s cubic-bezier(.4,0,.2,1);
                    border: 1.5px solid #e2e8f0;
                    background: #fff;
                    color: #475569;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.04);
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
                    padding: 14px 0 18px;
                    background: #fff;
                    border-bottom: 2px solid #f0fdf4;
                    margin-bottom: 0;
                }
                .cs-l3-inner {
                    max-width: 80rem;
                    margin: 0 auto;
                    padding: 0 24px;
                    display: flex;
                    flex-wrap: wrap;
                    gap: 8px;
                    align-items: center;
                }
                .cs-l3-label {
                    font-size: 12px;
                    font-weight: 800;
                    color: #6b7280;
                    letter-spacing: 0.08em;
                    text-transform: uppercase;
                    padding-right: 6px;
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
                    margin: 12px auto 0;
                    padding: 0 16px;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 12px;
                    color: #94a3b8;
                }
                .cs-breadcrumb .crumb { font-weight: 600; color: #64748b; }
                .cs-breadcrumb .crumb.active { color: #059669; font-weight: 700; }

                /* ─── 제품 그리드 ─── */
                .cs-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
                    gap: 24px;
                    transition: max-height 0.6s ease;
                }
                .cs-card {
                    background: #fff;
                    border-radius: 20px;
                    padding: 20px;
                    text-align: center;
                    border: 1.5px solid #f1f5f9;
                    transition: all 0.35s ease;
                    text-decoration: none;
                }
                .cs-card:hover {
                    box-shadow: 0 20px 48px rgba(0,0,0,0.07);
                    transform: translateY(-8px);
                    border-color: #22c55e;
                }
                .cs-img-wrap {
                    width: 100%;
                    aspect-ratio: 1;
                    margin-bottom: 16px;
                    position: relative;
                    background: #f8fafc;
                    border-radius: 14px;
                    overflow: hidden;
                    display: flex;
                    align-items: center;
                    justify-content: center;
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

                {/* {showMoreBtn && (
                    <div className="text-center mt-10">
                        <button
                            className="inline-flex items-center gap-2 px-8 py-3 rounded-full border-2 border-slate-200 bg-white text-slate-700 font-bold hover:bg-green-600 hover:text-white hover:border-green-600 transition-all text-sm"
                            onClick={() => setIsExpanded(!isExpanded)}
                        >
                            {isExpanded ? "접기" : "제품 더보기"}
                            <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                        </button>
                    </div>
                )} */}
            </div>
        </div>
    )
}
