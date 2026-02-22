
"use client"

import { ExternalLink, Globe, Link as LinkIcon, Youtube } from "lucide-react"
import Image from "next/image"
import type { MediaItem } from "@/lib/db"

interface MediaRendererProps {
    items: MediaItem[]
}

function getYoutubeId(url: string): string | null {
    try {
        const parsed = new URL(url)
        if (parsed.hostname === 'youtu.be') return parsed.pathname.slice(1).split('?')[0]
        if (parsed.hostname.includes('youtube.com')) {
            return parsed.searchParams.get('v')
        }
    } catch { }
    return null
}

function YouTubeCard({ item }: { item: MediaItem }) {
    const videoId = getYoutubeId(item.url)
    if (!videoId) return null

    return (
        <div className="rounded-2xl overflow-hidden border border-slate-100 shadow-sm bg-white">
            <div className="relative aspect-video">
                <iframe
                    src={`https://www.youtube.com/embed/${videoId}`}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title={item.title || "YouTube video"}
                    loading="lazy"
                />
            </div>
            {item.title && (
                <div className="px-5 py-3 flex items-center gap-2 border-t border-slate-50">
                    <Youtube className="h-4 w-4 text-red-500 flex-shrink-0" />
                    <span className="text-sm font-semibold text-slate-700">{item.title}</span>
                </div>
            )}
        </div>
    )
}

function EmbedCard({ item }: { item: MediaItem }) {
    return (
        <div className="rounded-2xl overflow-hidden border border-slate-100 shadow-sm bg-white">
            <div className="relative w-full" style={{ height: '500px' }}>
                <iframe
                    src={item.url}
                    className="w-full h-full border-0"
                    title={item.title || "Embedded content"}
                    loading="lazy"
                    sandbox="allow-scripts allow-same-origin allow-popups"
                />
            </div>
            <div className="px-5 py-3 flex items-center justify-between border-t border-slate-50">
                <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-blue-500 flex-shrink-0" />
                    <span className="text-sm font-semibold text-slate-700">{item.title || item.url}</span>
                </div>
                <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-500 hover:underline flex items-center gap-1 flex-shrink-0"
                >
                    새 탭 열기 <ExternalLink className="h-3 w-3" />
                </a>
            </div>
        </div>
    )
}

function LinkCard({ item }: { item: MediaItem }) {
    let hostname = ""
    try { hostname = new URL(item.url).hostname.replace('www.', '') } catch { }

    return (
        <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md hover:border-emerald-200 hover:-translate-y-0.5 transition-all overflow-hidden group"
        >
            {/* 썸네일 */}
            {item.thumbnail ? (
                <div className="relative w-28 h-20 flex-shrink-0 bg-slate-50 overflow-hidden">
                    <Image src={item.thumbnail} alt={item.title || ""} fill className="object-cover" />
                </div>
            ) : (
                <div className="w-20 h-20 flex-shrink-0 bg-slate-50 flex items-center justify-center">
                    <LinkIcon className="h-8 w-8 text-slate-200" />
                </div>
            )}

            {/* 내용 */}
            <div className="flex-1 min-w-0 py-4 pr-4">
                {item.title && (
                    <p className="font-bold text-slate-900 text-sm mb-1 line-clamp-1 group-hover:text-emerald-700 transition-colors">
                        {item.title}
                    </p>
                )}
                <p className="text-xs text-slate-400 truncate flex items-center gap-1">
                    <Globe className="h-3 w-3 flex-shrink-0" />
                    {hostname || item.url}
                </p>
            </div>

            <ExternalLink className="h-4 w-4 text-slate-300 flex-shrink-0 mr-4 group-hover:text-emerald-500 transition-colors" />
        </a>
    )
}

export function MediaRenderer({ items }: MediaRendererProps) {
    if (!items || items.length === 0) return null

    return (
        <div className="space-y-6">
            {items.map((item, idx) => {
                if (item.type === 'youtube') return <YouTubeCard key={idx} item={item} />
                if (item.type === 'embed') return <EmbedCard key={idx} item={item} />
                if (item.type === 'image') return <ImageCard key={idx} item={item} />
                return <LinkCard key={idx} item={item} />
            })}
        </div>
    )
}

function ImageCard({ item }: { item: MediaItem }) {
    return (
        <div className="relative w-full overflow-hidden rounded-2xl bg-gray-50 border border-slate-100/50 group">
            <img
                src={item.url}
                alt={item.title || "Product Detail"}
                className="w-full h-auto object-contain block group-hover:scale-[1.01] transition-transform duration-500"
            />
            {item.title && (
                <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-md p-3 rounded-xl border border-white/20 shadow-lg animate-in fade-in slide-in-from-bottom-2">
                    <p className="text-sm font-bold text-slate-800">{item.title}</p>
                </div>
            )}
        </div>
    )
}
