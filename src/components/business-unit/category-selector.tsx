
"use client"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Category, Product } from "@/lib/db"
import { ChevronRight, MessageSquare } from "lucide-react"

interface CategorySelectorProps {
    categories: Category[]
    unitProducts: Product[]
}

export default function CategorySelector({ categories, unitProducts }: CategorySelectorProps) {
    // Sort all categories by order
    const sortedAllCategories = [...categories].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

    // Top-level categories
    const parentCategories = sortedAllCategories.filter(c => !c.parentId);

    const [activeParentId, setActiveParentId] = useState<string>("")
    const [activeChildId, setActiveChildId] = useState<string>("") // Empty means "All" for that parent
    const [isExpanded, setIsExpanded] = useState(false)
    const gridRef = useRef<HTMLDivElement>(null)
    const [showMoreBtn, setShowMoreBtn] = useState(false)

    useEffect(() => {
        if (!activeParentId && parentCategories.length > 0) {
            setActiveParentId(parentCategories[0].id)
        }
    }, [parentCategories, activeParentId])

    // Categories under the active parent
    const activeChildren = sortedAllCategories.filter(c => c.parentId === activeParentId);

    // Filter products
    const activeProducts = unitProducts.filter(p => {
        if (!activeParentId) return false;

        const pCatIds = Array.isArray(p.categoryIds) ? p.categoryIds : [];
        const pCatId = (p as any).categoryId;

        if (activeChildId) {
            // Match specific child category
            return pCatIds.includes(activeChildId) || pCatId === activeChildId;
        } else {
            // Match any category that belongs to this parent
            const childIds = categories.filter(c => c.parentId === activeParentId).map(c => c.id);
            const targetIds = [activeParentId, ...childIds];

            return pCatIds.some(id => targetIds.includes(id)) || targetIds.includes(pCatId);
        }
    })

    useEffect(() => {
        if (gridRef.current) {
            const grid = gridRef.current
            grid.style.maxHeight = "500px"
            if (grid.scrollHeight > 500) {
                setShowMoreBtn(true)
            } else {
                setShowMoreBtn(false)
            }
            if (isExpanded) {
                grid.style.maxHeight = "5000px"
            } else {
                grid.style.maxHeight = "500px"
            }
        }
    }, [activeParentId, activeChildId, isExpanded])

    if (parentCategories.length === 0) return null

    return (
        <div className="py-16">
            <style jsx>{`
                .gs-tab-bar {
                    position: sticky;
                    top: 60px;
                    z-index: 20;
                    background: rgba(255, 255, 255, 0.95);
                    backdrop-filter: blur(10px);
                    padding: 20px 0;
                    margin-bottom: 20px;
                    border-bottom: 1px solid #f1f5f9;
                }
                .gs-tab-inner {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
                    gap: 12px;
                }
                .gs-tab {
                    background: #fff;
                    border: 1px solid #e5e7eb;
                    border-radius: 12px;
                    padding: 16px 12px;
                    text-align: center;
                    cursor: pointer;
                    transition: all 0.35s ease;
                }
                .gs-tab:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
                }
                .gs-tab.active {
                    border-color: #22c55e;
                    background: linear-gradient(135deg, #22c55e, #16a34a);
                    color: #fff;
                    box-shadow: 0 8px 20px rgba(34, 197, 94, 0.2);
                }
                .gs-sub-tab-bar {
                    max-width: 80rem;
                    margin: 0 auto 40px;
                    padding: 0 16px;
                    display: flex;
                    flex-wrap: wrap;
                    gap: 8px;
                    justify-content: center;
                }
                .gs-sub-tab {
                    padding: 8px 16px;
                    border-radius: 99px;
                    font-size: 13px;
                    font-weight: 600;
                    background: #f8fafc;
                    color: #64748b;
                    border: 1px solid #e2e8f0;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .gs-sub-tab:hover {
                    background: #f1f5f9;
                    color: #334155;
                    border-color: #cbd5e1;
                }
                .gs-sub-tab.active {
                    background: #22c55e;
                    color: #fff;
                    border-color: #22c55e;
                    box-shadow: 0 4px 12px rgba(34, 197, 94, 0.15);
                }
                .gs-category-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
                    gap: 24px;
                    overflow: hidden;
                    transition: max-height 0.6s ease;
                }
                .gs-cat-item {
                    background: #fff;
                    border-radius: 20px;
                    padding: 20px;
                    text-align: center;
                    border: 1px solid #f1f5f9;
                    transition: all 0.35s ease;
                }
                .gs-cat-item:hover {
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.06);
                    transform: translateY(-8px);
                    border-color: #22c55e;
                }
                .gs-cat-img-wrapper {
                   width: 100%;
                   aspect-ratio: 1;
                   margin-bottom: 16px;
                   position: relative;
                   background: #f8fafc;
                   border-radius: 16px;
                   overflow: hidden;
                   display: flex;
                   align-items: center;
                   justify-content: center;
                }
            `}</style>

            <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-slate-900 mb-2">제품 카테고리</h2>
                <p className="text-slate-500">대상을 선택하여 관련 제품을 확인하세요</p>
            </div>

            {/* Parent Tabs Area */}
            <div className="gs-tab-bar px-4">
                <div className="max-w-7xl mx-auto gs-tab-inner">
                    {parentCategories.map((cat) => (
                        <div
                            key={cat.id}
                            className={`gs-tab ${activeParentId === cat.id ? 'active' : ''}`}
                            onClick={() => {
                                setActiveParentId(cat.id)
                                setActiveChildId("") // Reset sub-category
                                setIsExpanded(false)
                            }}
                        >
                            <div className="text-sm font-bold truncate">
                                {cat.name}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Sub-Tabs Area (Pills style) */}
            {activeChildren.length > 0 && (
                <div className="gs-sub-tab-bar">
                    <button
                        className={`gs-sub-tab ${activeChildId === "" ? 'active' : ''}`}
                        onClick={() => {
                            setActiveChildId("")
                            setIsExpanded(false)
                        }}
                    >
                        전체보기
                    </button>
                    {activeChildren.map((child) => (
                        <button
                            key={child.id}
                            className={`gs-sub-tab ${activeChildId === child.id ? 'active' : ''}`}
                            onClick={() => {
                                setActiveChildId(child.id)
                                setIsExpanded(false)
                            }}
                        >
                            {child.name}
                        </button>
                    ))}
                </div>
            )}

            {/* Products Grid */}
            <div className="max-w-7xl mx-auto px-4">
                <div
                    ref={gridRef}
                    className="gs-category-grid"
                >
                    {activeProducts.map((product) => (
                        <Link href={`/products/${product.id}`} key={product.id} className="gs-cat-item group">
                            <div className="gs-cat-img-wrapper">
                                {product.images[0] ? (
                                    <Image
                                        src={product.images[0]}
                                        alt={product.name}
                                        fill
                                        className="object-contain p-4 group-hover:scale-110 transition-transform duration-500"
                                    />
                                ) : (
                                    <div className="text-slate-300">No Image</div>
                                )}
                            </div>
                            <h3 className="font-bold text-slate-800 mb-1 group-hover:text-green-600 transition-colors">
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
                            <p className="text-slate-400">선택한 카테고리에 등록된 제품이 없습니다.</p>
                        </div>
                    )}
                </div>

                {showMoreBtn && (
                    <div className="text-center mt-12">
                        <button
                            className="inline-flex items-center px-8 py-3 rounded-full border-2 border-slate-200 bg-white text-slate-700 font-bold hover:bg-green-600 hover:text-white hover:border-green-600 transition-all"
                            onClick={() => setIsExpanded(!isExpanded)}
                        >
                            {isExpanded ? "접기" : "제품 더보기"}
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
