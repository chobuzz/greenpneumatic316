
"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { Category, BusinessUnit } from "@/lib/db"

import { Trash2, Plus, Tag, Building2, LayoutGrid, ChevronUp, ChevronDown } from "lucide-react"

interface CategoryWithUnit extends Category {
    businessUnitName: string
}

export default function CategoryManager() {
    const [categories, setCategories] = useState<CategoryWithUnit[]>([])
    const [units, setUnits] = useState<BusinessUnit[]>([])
    const [newCatName, setNewCatName] = useState("")
    const [selectedUnit, setSelectedUnit] = useState("")
    const [selectedParent, setSelectedParent] = useState("")
    const [loading, setLoading] = useState(true)

    const fetchData = async () => {
        const [catRes, unitRes] = await Promise.all([
            fetch("/api/categories"),
            fetch("/api/business-units")
        ]);
        let catData = await catRes.json() as CategoryWithUnit[];
        const unitData = await unitRes.json();

        // Sorting is now handled by API, but we ensure it here as well for safety
        catData.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

        setCategories(catData);
        setUnits(unitData);
        setLoading(false);
    }

    useEffect(() => {
        fetchData();
    }, [])

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCatName || !selectedUnit) return;

        try {
            const res = await fetch("/api/categories", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: newCatName,
                    businessUnitId: selectedUnit,
                    parentId: selectedParent || null
                })
            });
            if (res.ok) {
                setNewCatName("");
                setSelectedParent("");
                fetchData(); // Refresh
            }
        } catch (err) {
            alert("추가 실패");
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("삭제하시겠습니까? 관련 데이터가 영구적으로 삭제됩니다.")) return;
        try {
            await fetch(`/api/categories/${id}`, { method: "DELETE" });
            fetchData();
        } catch (err) {
            alert("삭제 실패");
        }
    }

    const handleMove = async (unitId: string, parentId: string | undefined, catId: string, direction: 'up' | 'down') => {
        // Filter categories at the same level (same unit AND same parent)
        const peerCats = categories.filter(c => c.businessUnitId === unitId && c.parentId === parentId);
        const index = peerCats.findIndex(c => c.id === catId);
        if (index === -1) return;

        if (direction === 'up' && index === 0) return;
        if (direction === 'down' && index === peerCats.length - 1) return;

        const newPeerCats = [...peerCats];
        const swapIndex = direction === 'up' ? index - 1 : index + 1;
        [newPeerCats[index], newPeerCats[swapIndex]] = [newPeerCats[swapIndex], newPeerCats[index]];

        // We need to maintain the full list order. 
        // Simple approach: reconstruct the list by taking all other categories and appending/inserting these.
        // But the API expects orderedIds. We'll build the final ordered list.
        const otherCats = categories.filter(c => !(c.businessUnitId === unitId && c.parentId === parentId));

        // To keep it simple, we'll just send the moved items, but the API expects FULL list to rebuild all orders.
        // We'll re-map the entire 'categories' state with swapped items.
        let peerCursor = 0;
        const finalOrderedIds = categories.map(c => {
            if (c.businessUnitId === unitId && c.parentId === parentId) {
                return newPeerCats[peerCursor++].id;
            }
            return c.id;
        });

        try {
            const res = await fetch("/api/categories/reorder", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orderedIds: finalOrderedIds })
            });
            if (res.ok) {
                fetchData();
            }
        } catch (err) {
            alert("순서 변경 실패");
        }
    }

    if (loading) return (
        <div className="p-20 text-center">
            <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-slate-500">데이터를 불러오는 중...</p>
        </div>
    )

    return (
        <div className="space-y-10 max-w-6xl">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">카테고리 관리</h1>
                <p className="text-slate-500 mt-1">2단계 계층 구조로 카테고리를 분류하고 상세 순서를 관리합니다.</p>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                        <Plus className="h-5 w-5" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">새 카테고리 추가</h3>
                </div>

                <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-slate-400" /> 사업 분야
                        </label>
                        <select
                            className="flex h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                            value={selectedUnit}
                            onChange={(e) => {
                                setSelectedUnit(e.target.value);
                                setSelectedParent(""); // Reset parent when unit changes
                            }}
                            required
                        >
                            <option value="">사업 분야 선택</option>
                            {units.map(u => (
                                <option key={u.id} value={u.id}>{u.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                            <LayoutGrid className="h-4 w-4 text-slate-400" /> 상위 카테고리
                        </label>
                        <select
                            className="flex h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                            value={selectedParent}
                            onChange={(e) => setSelectedParent(e.target.value)}
                        >
                            <option value="">없음 (대분류 생성)</option>
                            {categories
                                .filter(c => c.businessUnitId === selectedUnit && !c.parentId)
                                .map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))
                            }
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                            <Tag className="h-4 w-4 text-slate-400" /> 카테고리명
                        </label>
                        <Input
                            value={newCatName}
                            onChange={(e) => setNewCatName(e.target.value)}
                            placeholder="명칭 입력"
                            required
                            className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white transition-all"
                        />
                    </div>
                    <Button type="submit" className="h-12 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold shadow-lg shadow-slate-200 transition-all active:scale-95">
                        <Plus className="h-4 w-4 mr-2" /> 생성
                    </Button>
                </form>
            </div>

            <div className="grid grid-cols-1 gap-12">
                {units.map(unit => {
                    const unitTopCategories = categories.filter(c => c.businessUnitId === unit.id && !c.parentId)

                    if (unitTopCategories.length === 0) return null;

                    return (
                        <div key={unit.id} className="space-y-6">
                            <div className="flex items-center gap-3 pb-2 border-b border-slate-200">
                                <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white">
                                    <Building2 className="h-5 w-5" />
                                </div>
                                <h2 className="text-xl font-black text-slate-900">{unit.name}</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {unitTopCategories.map((parent, pIdx) => {
                                    const children = categories.filter(c => c.parentId === parent.id);

                                    return (
                                        <div key={parent.id} className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all group">
                                            {/* Parent Category Header */}
                                            <div className="bg-slate-50/50 p-5 border-b border-slate-100 flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-primary shadow-sm font-bold text-xs">
                                                        {pIdx + 1}
                                                    </div>
                                                    <span className="font-black text-slate-900">{parent.name}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-7 w-7 rounded-lg text-slate-400 hover:bg-white"
                                                        onClick={() => handleMove(unit.id, undefined, parent.id, 'up')}
                                                        disabled={pIdx === 0}
                                                    >
                                                        <ChevronUp className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-7 w-7 rounded-lg text-slate-400 hover:bg-white"
                                                        onClick={() => handleMove(unit.id, undefined, parent.id, 'down')}
                                                        disabled={pIdx === unitTopCategories.length - 1}
                                                    >
                                                        <ChevronDown className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-7 w-7 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50"
                                                        onClick={() => handleDelete(parent.id)}
                                                    >
                                                        <Trash2 className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            </div>

                                            {/* Child Categories */}
                                            <div className="p-4 space-y-2">
                                                {children.length > 0 ? (
                                                    children.map((child, cIdx) => (
                                                        <div key={child.id} className="flex items-center justify-between pl-4 pr-2 py-2 rounded-xl hover:bg-slate-50 transition-all group/child">
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                                                                <span className="text-sm font-bold text-slate-700">{child.name}</span>
                                                            </div>
                                                            <div className="flex items-center gap-1 opacity-0 group-hover/child:opacity-100 transition-all">
                                                                <button
                                                                    onClick={() => handleMove(unit.id, parent.id, child.id, 'up')}
                                                                    disabled={cIdx === 0}
                                                                    className="p-1 hover:text-primary disabled:opacity-30"
                                                                >
                                                                    <ChevronUp className="h-3.5 w-3.5" />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleMove(unit.id, parent.id, child.id, 'down')}
                                                                    disabled={cIdx === children.length - 1}
                                                                    className="p-1 hover:text-primary disabled:opacity-30"
                                                                >
                                                                    <ChevronDown className="h-3.5 w-3.5" />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDelete(child.id)}
                                                                    className="p-1 hover:text-red-500"
                                                                >
                                                                    <Trash2 className="h-3.5 w-3.5" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <p className="text-[11px] text-slate-400 italic text-center py-4">하위 카테고리가 없습니다.</p>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
