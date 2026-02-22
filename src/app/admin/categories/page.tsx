
"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { Category, BusinessUnit } from "@/lib/db"

import { Trash2, Plus, Tag, Building2, LayoutGrid, ChevronUp, ChevronDown, Layers, ChevronRight } from "lucide-react"
import { Loading } from "@/components/ui/loading"

interface CategoryWithUnit extends Category {
    businessUnitName: string
}

// 재귀적으로 카테고리 계층 구조 빌드
interface CategoryNode extends CategoryWithUnit {
    children: CategoryNode[]
}

function buildTree(categories: CategoryWithUnit[], parentId: string | undefined | null): CategoryNode[] {
    return categories
        .filter(c => (c.parentId || "") === (parentId || ""))
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        .map(c => ({
            ...c,
            children: buildTree(categories, c.id)
        }))
}

// 모든 카테고리를 flat list로 (들여쓰기 레벨 포함)
function getFlatList(categories: CategoryWithUnit[], unitId: string): { cat: CategoryWithUnit; depth: number }[] {
    const result: { cat: CategoryWithUnit; depth: number }[] = []

    function traverse(parentId: string, depth: number) {
        const items = categories
            .filter(c => c.businessUnitId === unitId && (c.parentId || "") === parentId)
            .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        for (const item of items) {
            result.push({ cat: item, depth })
            traverse(item.id, depth + 1)
        }
    }

    traverse("", 0)
    return result
}

export default function CategoryManager() {
    const [categories, setCategories] = useState<CategoryWithUnit[]>([])
    const [units, setUnits] = useState<BusinessUnit[]>([])
    const [newCatName, setNewCatName] = useState("")
    const [bulkNames, setBulkNames] = useState("")
    const [isBulkMode, setIsBulkMode] = useState(false)
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
        if (isBulkMode && (!bulkNames || !selectedUnit)) return;
        if (!isBulkMode && (!newCatName || !selectedUnit)) return;

        try {
            if (isBulkMode) {
                const names = bulkNames.split("\n").map(n => n.trim()).filter(n => n !== "");
                if (names.length === 0) return;
                const res = await fetch("/api/categories/bulk", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ names, businessUnitId: selectedUnit, parentId: selectedParent })
                });
                if (res.ok) { setBulkNames(""); setSelectedParent(""); fetchData(); }
            } else {
                const res = await fetch("/api/categories", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name: newCatName, businessUnitId: selectedUnit, parentId: selectedParent })
                });
                if (res.ok) { setNewCatName(""); setSelectedParent(""); fetchData(); }
            }
        } catch (err) {
            alert("추가 실패");
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("삭제하시겠습니까? 하위 카테고리가 있으면 함께 삭제될 수 있습니다.")) return;
        try {
            await fetch(`/api/categories/${id}`, { method: "DELETE" });
            fetchData();
        } catch (err) {
            alert("삭제 실패");
        }
    }

    const handleMove = async (unitId: string, parentId: string | undefined, catId: string, direction: 'up' | 'down') => {
        const peerCats = categories.filter(c => c.businessUnitId === unitId && (c.parentId || "") === (parentId || ""));
        const sorted = [...peerCats].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        const index = sorted.findIndex(c => c.id === catId);
        if (index === -1) return;
        if (direction === 'up' && index === 0) return;
        if (direction === 'down' && index === sorted.length - 1) return;

        const newSorted = [...sorted];
        const swapIndex = direction === 'up' ? index - 1 : index + 1;
        [newSorted[index], newSorted[swapIndex]] = [newSorted[swapIndex], newSorted[index]];

        let peerCursor = 0;
        const finalOrderedIds = categories.map(c => {
            if (c.businessUnitId === unitId && (c.parentId || "") === (parentId || "")) {
                return newSorted[peerCursor++].id;
            }
            return c.id;
        });

        try {
            const res = await fetch("/api/categories/reorder", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orderedIds: finalOrderedIds })
            });
            if (res.ok) { fetchData(); }
        } catch (err) {
            alert("순서 변경 실패");
        }
    }

    if (loading) return <Loading />

    // 레벨 label helper
    const levelLabel = (depth: number) => {
        if (depth === 0) return { text: "대분류", color: "bg-violet-100 text-violet-700", dot: "bg-violet-400" }
        if (depth === 1) return { text: "중분류", color: "bg-blue-100 text-blue-700", dot: "bg-blue-400" }
        return { text: "소분류", color: "bg-emerald-100 text-emerald-700", dot: "bg-emerald-400" }
    }

    return (
        <div className="space-y-10 max-w-6xl">
            {/* 헤더 */}
            <div>
                <h1 className="text-3xl font-bold text-slate-900">카테고리 관리</h1>
                <p className="text-slate-500 mt-1">3단계 계층 구조(대분류 → 중분류 → 소분류)로 카테고리를 분류합니다.</p>
                <div className="flex items-center gap-3 mt-4">
                    {[
                        { label: "대분류", color: "bg-violet-100 text-violet-700 border-violet-200" },
                        { label: "중분류", color: "bg-blue-100 text-blue-700 border-blue-200" },
                        { label: "소분류", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
                    ].map((item, i) => (
                        <div key={i} className="flex items-center gap-1.5">
                            {i > 0 && <ChevronRight className="h-3 w-3 text-slate-300" />}
                            <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${item.color}`}>{item.label}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* 추가 폼 */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                            <Plus className="h-5 w-5" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900">새 카테고리 추가</h3>
                    </div>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className={`rounded-lg font-bold ${isBulkMode ? 'bg-primary/10 text-primary' : 'text-slate-400'}`}
                        onClick={() => setIsBulkMode(!isBulkMode)}
                    >
                        {isBulkMode ? '단일 등록으로 전환' : '대량 등록 모드'}
                    </Button>
                </div>

                <form onSubmit={handleAdd} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* 사업 분야 */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                <Building2 className="h-4 w-4 text-slate-400" /> 사업 분야
                            </label>
                            <select
                                className="flex h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                                value={selectedUnit}
                                onChange={(e) => { setSelectedUnit(e.target.value); setSelectedParent(""); }}
                                required
                            >
                                <option value="">사업 분야 선택</option>
                                {units.map(u => (
                                    <option key={u.id} value={u.id}>{u.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* 상위 카테고리 - 대분류/중분류 모두 선택 가능 */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                <Layers className="h-4 w-4 text-slate-400" /> 상위 카테고리
                            </label>
                            <select
                                className="flex h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                                value={selectedParent}
                                onChange={(e) => setSelectedParent(e.target.value)}
                                disabled={!selectedUnit}
                            >
                                <option value="">없음 (대분류 생성)</option>
                                {selectedUnit && getFlatList(categories, selectedUnit).map(({ cat, depth }) => (
                                    <option key={cat.id} value={cat.id}>
                                        {depth === 0 ? "" : depth === 1 ? "  └ " : "    └ "}{cat.name} {depth === 0 ? "(대분류)" : depth === 1 ? "(중분류)" : "(소분류)"}
                                    </option>
                                ))}
                            </select>
                            {selectedParent && (
                                <p className="text-xs text-slate-400 pl-1">
                                    선택된 상위 항목 하위에 카테고리가 생성됩니다.
                                </p>
                            )}
                        </div>
                    </div>

                    {/* 카테고리명 */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                            <Tag className="h-4 w-4 text-slate-400" /> {isBulkMode ? '카테고리 리스트 (줄바꿈으로 구분)' : '카테고리명'}
                        </label>
                        {isBulkMode ? (
                            <textarea
                                value={bulkNames}
                                onChange={(e) => setBulkNames(e.target.value)}
                                placeholder={"예:\n카테고리 1\n카테고리 2\n카테고리 3"}
                                required
                                className="flex min-h-[120px] w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none resize-none"
                            />
                        ) : (
                            <Input
                                value={newCatName}
                                onChange={(e) => setNewCatName(e.target.value)}
                                placeholder="명칭 입력"
                                required={!isBulkMode}
                                className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white transition-all"
                            />
                        )}
                    </div>

                    <div className="flex justify-end">
                        <Button type="submit" className="h-12 px-8 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold shadow-lg shadow-slate-200 transition-all active:scale-95">
                            <Plus className="h-4 w-4 mr-2" /> {isBulkMode ? '대량 생성' : '생성'}
                        </Button>
                    </div>
                </form>
            </div>

            {/* 카테고리 목록 - 3단계 트리 */}
            <div className="grid grid-cols-1 gap-12">
                {units.map(unit => {
                    const tree = buildTree(categories.filter(c => c.businessUnitId === unit.id), undefined)
                    if (tree.length === 0) return null;

                    return (
                        <div key={unit.id} className="space-y-6">
                            {/* 사업 분야 헤더 */}
                            <div className="flex items-center gap-3 pb-3 border-b-2 border-slate-100">
                                <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white">
                                    <Building2 className="h-5 w-5" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-slate-900">{unit.name}</h2>
                                    <p className="text-xs text-slate-400">{tree.length}개 대분류</p>
                                </div>
                            </div>

                            {/* 대분류 카드들 */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {tree.map((parent, pIdx) => {
                                    const allParentPeers = tree;
                                    return (
                                        <div key={parent.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all">
                                            {/* 대분류 헤더 */}
                                            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-violet-50 to-white">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 border border-violet-200">대분류</span>
                                                    <span className="font-black text-slate-900">{parent.name}</span>
                                                    {parent.children.length > 0 && (
                                                        <span className="text-xs text-slate-400">({parent.children.length}개 중분류)</span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <button
                                                        className="p-1.5 rounded-lg text-slate-400 hover:text-violet-600 hover:bg-violet-50 transition-all disabled:opacity-30"
                                                        onClick={() => handleMove(unit.id, undefined, parent.id, 'up')}
                                                        disabled={pIdx === 0}
                                                    ><ChevronUp className="h-3.5 w-3.5" /></button>
                                                    <button
                                                        className="p-1.5 rounded-lg text-slate-400 hover:text-violet-600 hover:bg-violet-50 transition-all disabled:opacity-30"
                                                        onClick={() => handleMove(unit.id, undefined, parent.id, 'down')}
                                                        disabled={pIdx === allParentPeers.length - 1}
                                                    ><ChevronDown className="h-3.5 w-3.5" /></button>
                                                    <button
                                                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
                                                        onClick={() => handleDelete(parent.id)}
                                                    ><Trash2 className="h-3.5 w-3.5" /></button>
                                                </div>
                                            </div>

                                            {/* 중분류 목록 */}
                                            <div className="p-4 space-y-3">
                                                {parent.children.length > 0 ? (
                                                    parent.children.map((mid, mIdx) => (
                                                        <div key={mid.id} className="rounded-xl border border-slate-100 bg-slate-50/50 overflow-hidden">
                                                            {/* 중분류 행 */}
                                                            <div className="px-3 py-2.5 flex items-center justify-between bg-gradient-to-r from-blue-50 to-slate-50 border-b border-slate-100">
                                                                <div className="flex items-center gap-2">
                                                                    <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
                                                                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200">중분류</span>
                                                                    <span className="text-sm font-bold text-slate-800">{mid.name}</span>
                                                                    {mid.children.length > 0 && (
                                                                        <span className="text-xs text-slate-400">({mid.children.length}개 소분류)</span>
                                                                    )}
                                                                </div>
                                                                <div className="flex items-center gap-1">
                                                                    <button
                                                                        className="p-1 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all disabled:opacity-30"
                                                                        onClick={() => handleMove(unit.id, parent.id, mid.id, 'up')}
                                                                        disabled={mIdx === 0}
                                                                    ><ChevronUp className="h-3 w-3" /></button>
                                                                    <button
                                                                        className="p-1 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all disabled:opacity-30"
                                                                        onClick={() => handleMove(unit.id, parent.id, mid.id, 'down')}
                                                                        disabled={mIdx === parent.children.length - 1}
                                                                    ><ChevronDown className="h-3 w-3" /></button>
                                                                    <button
                                                                        className="p-1 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
                                                                        onClick={() => handleDelete(mid.id)}
                                                                    ><Trash2 className="h-3 w-3" /></button>
                                                                </div>
                                                            </div>

                                                            {/* 소분류 목록 */}
                                                            {mid.children.length > 0 ? (
                                                                <div className="p-2 flex flex-wrap gap-1.5">
                                                                    {mid.children.map((leaf, lIdx) => (
                                                                        <div key={leaf.id} className="group/leaf flex items-center gap-1 bg-white border border-emerald-100 rounded-full px-3 py-1 hover:border-emerald-300 hover:bg-emerald-50 transition-all">
                                                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                                                                            <span className="text-xs font-semibold text-slate-700">{leaf.name}</span>
                                                                            <div className="flex items-center gap-0.5 opacity-0 group-hover/leaf:opacity-100 transition-all ml-1">
                                                                                <button
                                                                                    className="text-slate-300 hover:text-emerald-600 disabled:opacity-20 transition-all"
                                                                                    onClick={() => handleMove(unit.id, mid.id, leaf.id, 'up')}
                                                                                    disabled={lIdx === 0}
                                                                                ><ChevronUp className="h-3 w-3" /></button>
                                                                                <button
                                                                                    className="text-slate-300 hover:text-emerald-600 disabled:opacity-20 transition-all"
                                                                                    onClick={() => handleMove(unit.id, mid.id, leaf.id, 'down')}
                                                                                    disabled={lIdx === mid.children.length - 1}
                                                                                ><ChevronDown className="h-3 w-3" /></button>
                                                                                <button
                                                                                    className="text-slate-300 hover:text-red-500 transition-all"
                                                                                    onClick={() => handleDelete(leaf.id)}
                                                                                ><Trash2 className="h-3 w-3" /></button>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            ) : (
                                                                <p className="text-[11px] text-slate-400 italic text-center py-3">소분류가 없습니다.</p>
                                                            )}
                                                        </div>
                                                    ))
                                                ) : (
                                                    <p className="text-[11px] text-slate-400 italic text-center py-4">중분류가 없습니다.</p>
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
