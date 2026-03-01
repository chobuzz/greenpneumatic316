
"use client"

import { useState } from "react"
import { Plus, Trash2, Youtube, Globe, Link as LinkIcon, Image as ImageIcon } from "lucide-react"
import { Input } from "./input"
import { ImageSelector } from "./image-selector"

export type MediaItemType = 'youtube' | 'embed' | 'link' | 'image'

export interface MediaItem {
    type: MediaItemType
    url: string
    title?: string
    thumbnail?: string
}

interface MediaEditorProps {
    value: MediaItem[]
    onChange: (items: MediaItem[]) => void
}

function detectType(url: string): MediaItemType {
    if (!url) return 'link'
    try {
        const parsed = new URL(url)
        const hostname = parsed.hostname.replace('www.', '')
        if (hostname === 'youtube.com' || hostname === 'youtu.be') return 'youtube'
    } catch { }
    return 'link'
}

const typeConfig = {
    youtube: { label: 'YouTube', icon: <Youtube className="h-4 w-4" />, color: 'bg-red-50 border-red-200 text-red-700' },
    embed: { label: '웹 Embed', icon: <Globe className="h-4 w-4" />, color: 'bg-blue-50 border-blue-200 text-blue-700' },
    link: { label: '링크 카드', icon: <LinkIcon className="h-4 w-4" />, color: 'bg-slate-50 border-slate-200 text-slate-700' },
    image: { label: '상세 이미지', icon: <ImageIcon className="h-4 w-4" />, color: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
}

export function MediaEditor({ value = [], onChange }: MediaEditorProps) {
    const [newUrl, setNewUrl] = useState("")
    const [newTitle, setNewTitle] = useState("")

    const addItem = (item?: MediaItem) => {
        if (item) {
            onChange([...value, item])
            return
        }
        if (!newUrl.trim()) return
        const type = detectType(newUrl.trim())
        const newItem: MediaItem = {
            type,
            url: newUrl.trim(),
            title: newTitle.trim() || undefined,
        }
        onChange([...value, newItem])
        setNewUrl("")
        setNewTitle("")
    }

    const removeItem = (index: number) => {
        onChange(value.filter((_, i) => i !== index))
    }

    const moveItem = (index: number, direction: 'up' | 'down') => {
        if (direction === 'up' && index === 0) return
        if (direction === 'down' && index === value.length - 1) return

        const newItems = [...value]
        const targetIdx = direction === 'up' ? index - 1 : index + 1
            ;[newItems[index], newItems[targetIdx]] = [newItems[targetIdx], newItems[index]]
        onChange(newItems)
    }

    const updateItem = (index: number, patch: Partial<MediaItem>) => {
        const updated = value.map((item, i) => i === index ? { ...item, ...patch } : item)
        onChange(updated)
    }

    return (
        <div className="space-y-4">
            {/* 기존 아이템 목록 */}
            {value && value.length > 0 && (
                <div className="space-y-3">
                    {value.map((item, idx) => {
                        const cfg = typeConfig[item.type]
                        return (
                            <div key={idx} className="bg-white rounded-xl border border-slate-200 p-4 space-y-3 shadow-sm hover:border-slate-300 transition-all">
                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                        <div className="flex flex-col gap-1 mr-2">
                                            <button
                                                type="button"
                                                onClick={() => moveItem(idx, 'up')}
                                                disabled={idx === 0}
                                                className="p-1 rounded text-slate-300 hover:text-primary hover:bg-slate-50 disabled:opacity-30"
                                            >
                                                <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20"><path d="M10 3l-7 7h14l-7-7z" /></svg>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => moveItem(idx, 'down')}
                                                disabled={idx === value.length - 1}
                                                className="p-1 rounded text-slate-300 hover:text-primary hover:bg-slate-50 disabled:opacity-30"
                                            >
                                                <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20"><path d="M10 17l7-7H3l7 7z" /></svg>
                                            </button>
                                        </div>
                                        <span className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-tighter px-2.5 py-1 rounded-full border flex-shrink-0 ${cfg.color}`}>
                                            {cfg.icon} {cfg.label}
                                        </span>
                                        <span className="text-xs text-slate-400 truncate font-mono">{item.url.slice(0, 30)}...</span>
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        <select
                                            value={item.type}
                                            onChange={(e) => updateItem(idx, { type: e.target.value as MediaItemType })}
                                            className="text-[11px] font-bold border border-slate-200 rounded-lg px-2 py-1 bg-white focus:outline-none cursor-pointer"
                                        >
                                            <option value="youtube">YouTube</option>
                                            <option value="embed">웹 Embed</option>
                                            <option value="link">링크 카드</option>
                                            <option value="image">상세 이미지</option>
                                        </select>
                                        <button
                                            type="button"
                                            onClick={() => removeItem(idx)}
                                            className="p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>

                                {/* Image 미리보기 */}
                                {item.type === 'image' && item.url && item.url.trim() !== "" && (
                                    <div className="relative rounded-lg overflow-hidden border border-slate-200 bg-slate-50 mb-2">
                                        <img src={item.url} alt="Preview" className="w-full h-auto block" />
                                    </div>
                                )}

                                {/* YouTube 미리보기 */}
                                {item.type === 'youtube' && (
                                    <div className="relative aspect-video rounded-lg overflow-hidden border border-slate-200 bg-slate-100 mb-2">
                                        <iframe
                                            src={`https://www.youtube.com/embed/${item.url.includes('v=') ? item.url.split('v=')[1].split('&')[0] : item.url.split('/').pop()}`}
                                            className="w-full h-full"
                                            title="YouTube preview"
                                        />
                                    </div>
                                )}

                                {/* 제목 */}
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">표시 제목 (선택)</label>
                                    <Input
                                        value={item.title || ""}
                                        onChange={(e) => updateItem(idx, { title: e.target.value })}
                                        placeholder="제목을 입력하면 카드나 이미지 하단에 표시됩니다"
                                        className="h-9 text-sm rounded-xl border-slate-100"
                                    />
                                </div>

                                {/* 링크/embed 전용: 썸네일 이미지 */}
                                {(item.type === 'link' || item.type === 'embed') && (
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block flex items-center gap-1">
                                            <ImageIcon className="h-3 w-3" /> 썸네일/커버 이미지 (선택)
                                        </label>
                                        {item.thumbnail && item.thumbnail.trim() !== "" && (
                                            <div className="relative w-32 h-20 rounded-lg overflow-hidden border border-slate-200 mb-2">
                                                <img src={item.thumbnail} alt="thumbnail" className="w-full h-full object-cover" />
                                                <button
                                                    type="button"
                                                    onClick={() => updateItem(idx, { thumbnail: undefined })}
                                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600 shadow-lg"
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </button>
                                            </div>
                                        )}
                                        <ImageSelector
                                            label=""
                                            value={item.thumbnail || ""}
                                            onChange={(url) => url && updateItem(idx, { thumbnail: url })}
                                        />
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            )}

            {/* 새 미디어 추가 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 p-5 space-y-4 hover:border-slate-300 transition-all">
                    <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">URL 기반 추가</p>
                    <div className="space-y-3">
                        <Input
                            value={newUrl}
                            onChange={(e) => setNewUrl(e.target.value)}
                            placeholder="주소 입력 (YouTube, 블로그 등)"
                            className="bg-white rounded-xl border-slate-200"
                        />
                        <Input
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            placeholder="표시할 제목 (선택)"
                            className="bg-white rounded-xl border-slate-200"
                        />
                    </div>
                    <button
                        type="button"
                        onClick={() => addItem()}
                        disabled={!newUrl.trim()}
                        className="w-full flex items-center justify-center gap-2 h-11 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md"
                    >
                        <Plus className="h-4 w-4" /> 항목 추가하기
                    </button>
                </div>

                <div className="bg-emerald-50/50 rounded-2xl border-2 border-dashed border-emerald-200 p-5 flex flex-col justify-center items-center text-center group hover:border-emerald-300 transition-all">
                    <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <ImageIcon className="h-6 w-6" />
                    </div>
                    <h4 className="text-sm font-bold text-emerald-900 mb-1">상세 이미지 삽입</h4>
                    <p className="text-xs text-emerald-600/70 mb-4 font-medium">유튜브나 링크 사이사이에 배치할 이미지를 추가하세요.</p>
                    <ImageSelector
                        label="이미지 선택"
                        value=""
                        onChange={(url) => url && addItem({ type: 'image', url })}
                    />
                </div>
            </div>
        </div>
    )
}
