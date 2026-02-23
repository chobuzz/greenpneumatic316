
"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { Category, BusinessUnit } from "@/lib/db"
import { Reorder, AnimatePresence, motion } from "framer-motion"

import {
    Trash2, Plus, Tag, Building2, Layers,
    ChevronRight, GripVertical, Save, RefreshCw
} from "lucide-react"
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
    const [hasChanges, setHasChanges] = useState(false)
    const [isSaving, setIsSaving] = useState(false)

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
        setHasChanges(false);
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

    // 드래그 앤 드롭 후 로컬 상태 업데이트
    const handleReorder = (parentId: string | null, unitId: string, newOrderItems: CategoryWithUnit[]) => {
        setCategories(prev => {
            // 다른 카테고리들은 유지하고, 현재 부모와 사업부에 속한 카테고리들만 교체
            const others = prev.filter(c => c.businessUnitId !== unitId || (c.parentId || "") !== (parentId || ""));

            // 새로운 순서에 따라 order 값 업데이트
            const updated = newOrderItems.map((item, idx) => ({
                ...item,
                order: idx
            }));

            setHasChanges(true);
            return [...others, ...updated].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        });
    }

    // 변경된 순서 서버에 일괄 저장
    const handleSaveOrder = async () => {
        setIsSaving(true);
        try {
            const orderedIds = categories.map(c => c.id);
            const res = await fetch("/api/categories/reorder", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orderedIds })
            });

            if (res.ok) {
                setHasChanges(false);
                alert("순서가 저장되었습니다.");
            } else {
                alert("저장 실패");
            }
        } catch (err) {
            alert("저장 실패");
        } finally {
            setIsSaving(false);
        }
    }

    if (loading) return <Loading />

    return (
        <div className="space-y-10 max-w-6xl relative pb-32">
            {/* 헤더 */}
            <div>
                <h1 className="text-3xl font-bold text-slate-900">카테고리 관리</h1>
                <p className="text-slate-500 mt-1">3단계 계층 구조를 드래그 앤 드롭으로 간편하게 관리하세요.</p>
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

                        {/* 상위 카테고리 */}
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
                        </div>
                    </div>

                    {/* 카테고리명 */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                            <Tag className="h-4 w-4 text-slate-400" /> {isBulkMode ? '카테고리 리스트' : '카테고리명'}
                        </label>
                        {isBulkMode ? (
                            <textarea
                                value={bulkNames}
                                onChange={(e) => setBulkNames(e.target.value)}
                                placeholder={"예:\n카테고리 1\n카테고리 2"}
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
                        <Button type="submit" className="h-12 px-8 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold shadow-lg">
                            <Plus className="h-4 w-4 mr-2" /> {isBulkMode ? '대량 생성' : '생성'}
                        </Button>
                    </div>
                </form>
            </div>

            {/* 카테고리 목록 - 트리 */}
            <div className="grid grid-cols-1 gap-12">
                {units.map(unit => {
                    const tree = buildTree(categories.filter(c => c.businessUnitId === unit.id), undefined)
                    if (tree.length === 0) return null;

                    return (
                        <div key={unit.id} className="space-y-6">
                            <div className="flex items-center gap-3 pb-3 border-b-2 border-slate-100">
                                <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white">
                                    <Building2 className="h-5 w-5" />
                                </div>
                                <h2 className="text-xl font-black text-slate-900">{unit.name}</h2>
                            </div>

                            <Reorder.Group
                                axis="y"
                                values={tree}
                                onReorder={(newTree) => handleReorder(null, unit.id, newTree)}
                                className="grid grid-cols-1 lg:grid-cols-2 gap-6"
                            >
                                {tree.map((parent) => (
                                    <Reorder.Item
                                        key={parent.id}
                                        value={parent}
                                        className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                                    >
                                        {/* 대분류 헤더 */}
                                        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-violet-50 to-white">
                                            <div className="flex items-center gap-3">
                                                <GripVertical className="h-4 w-4 text-slate-300 cursor-grab active:cursor-grabbing" />
                                                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 border border-violet-200">대분류</span>
                                                <span className="font-black text-slate-900">{parent.name}</span>
                                            </div>
                                            <button
                                                className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
                                                onClick={() => handleDelete(parent.id)}
                                            ><Trash2 className="h-4 w-4" /></button>
                                        </div>

                                        {/* 중분류 목록 */}
                                        <div className="p-4 space-y-3">
                                            {parent.children.length > 0 ? (
                                                <Reorder.Group
                                                    axis="y"
                                                    values={parent.children}
                                                    onReorder={(newMids) => handleReorder(parent.id, unit.id, newMids)}
                                                    className="space-y-3"
                                                >
                                                    {parent.children.map((mid) => (
                                                        <Reorder.Item
                                                            key={mid.id}
                                                            value={mid}
                                                            className="rounded-xl border border-slate-100 bg-slate-50/50 overflow-hidden"
                                                        >
                                                            <div className="px-3 py-2.5 flex items-center justify-between bg-gradient-to-r from-blue-50 to-slate-50 border-b border-slate-100">
                                                                <div className="flex items-center gap-2">
                                                                    <GripVertical className="h-3 w-3 text-slate-300 cursor-grab active:cursor-grabbing" />
                                                                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200">중분류</span>
                                                                    <span className="text-sm font-bold text-slate-800">{mid.name}</span>
                                                                </div>
                                                                <button
                                                                    className="p-1 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
                                                                    onClick={() => handleDelete(mid.id)}
                                                                ><Trash2 className="h-3 w-3" /></button>
                                                            </div>

                                                            {/* 소분류 목록 */}
                                                            <div className="p-2">
                                                                {mid.children.length > 0 ? (
                                                                    <Reorder.Group
                                                                        axis="x"
                                                                        values={mid.children}
                                                                        onReorder={(newLeafs) => handleReorder(mid.id, unit.id, newLeafs)}
                                                                        className="flex flex-wrap gap-1.5"
                                                                    >
                                                                        {mid.children.map((leaf) => (
                                                                            <Reorder.Item
                                                                                key={leaf.id}
                                                                                value={leaf}
                                                                                className="group/leaf flex items-center gap-1 bg-white border border-emerald-100 rounded-full px-3 py-1 hover:border-emerald-300 hover:bg-emerald-50 transition-all cursor-grab active:cursor-grabbing"
                                                                            >
                                                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                                                                                <span className="text-xs font-semibold text-slate-700">{leaf.name}</span>
                                                                                <button
                                                                                    className="text-slate-300 hover:text-red-500 transition-all ml-1 opacity-0 group-hover/leaf:opacity-100"
                                                                                    onClick={(e) => { e.stopPropagation(); handleDelete(leaf.id); }}
                                                                                ><Trash2 className="h-3 w-3" /></button>
                                                                            </Reorder.Item>
                                                                        ))}
                                                                    </Reorder.Group>
                                                                ) : (
                                                                    <p className="text-[11px] text-slate-400 italic text-center py-2">소분류가 없습니다.</p>
                                                                )}
                                                            </div>
                                                        </Reorder.Item>
                                                    ))}
                                                </Reorder.Group>
                                            ) : (
                                                <p className="text-[11px] text-slate-400 italic text-center py-4">중분류가 없습니다.</p>
                                            )}
                                        </div>
                                    </Reorder.Item>
                                ))}
                            </Reorder.Group>
                        </div>
                    )
                })}
            </div>

            {/* 하단 플로팅 저장 버튼 */}
            <AnimatePresence>
                {hasChanges && (
                    <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 px-6 py-4 bg-slate-900 text-white rounded-2xl shadow-2xl border border-white/10 backdrop-blur-md"
                    >
                        <div className="flex items-center gap-2 pr-4 border-r border-white/20">
                            <RefreshCw className="h-4 w-4 text-emerald-400 animate-spin-slow" />
                            <span className="text-sm font-bold">순서가 변경됨</span>
                        </div>
                        <Button
                            onClick={fetchData}
                            variant="ghost"
                            className="text-slate-400 hover:text-white"
                            disabled={isSaving}
                        >
                            취소
                        </Button>
                        <Button
                            onClick={handleSaveOrder}
                            disabled={isSaving}
                            className="bg-emerald-500 hover:bg-emerald-600 text-white font-black px-8"
                        >
                            {isSaving ? "저장 중..." : "변경 사항 저장"}
                            <Save className="h-4 w-4 ml-2" />
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
