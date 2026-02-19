
"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Upload, Link as LinkIcon, X } from "lucide-react"

interface ImageSelectorProps {
    value: string;
    onChange: (url: string) => void;
    label?: string;
}

export function ImageSelector({ value, onChange, label }: ImageSelectorProps) {
    const [mode, setMode] = useState<'upload' | 'link'>(value?.startsWith('http') ? 'link' : 'upload')
    const [uploading, setUploading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            if (!res.ok) throw new Error("Upload failed");
            const data = await res.json();
            onChange(data.url);
        } catch (err) {
            alert("이미지 업로드에 실패했습니다.");
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    return (
        <div className="space-y-3 p-4 border rounded-lg bg-gray-50/50">
            {label && <label className="block text-sm font-semibold mb-2">{label}</label>}

            <div className="flex gap-2 mb-2">
                <Button
                    type="button"
                    variant={mode === 'upload' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setMode('upload')}
                    className="flex-1"
                >
                    <Upload className="h-4 w-4 mr-2" /> 직접 업로드
                </Button>
                <Button
                    type="button"
                    variant={mode === 'link' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setMode('link')}
                    className="flex-1"
                >
                    <LinkIcon className="h-4 w-4 mr-2" /> 외부 링크
                </Button>
            </div>

            {mode === 'upload' ? (
                <div className="flex flex-col items-center gap-3">
                    {value && !value.startsWith('http') ? (
                        <div className="relative w-full aspect-video rounded-md overflow-hidden border bg-white">
                            <img src={value} alt="Preview" className="w-full h-full object-contain" />
                            <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="absolute top-2 right-2 h-8 w-8"
                                onClick={() => onChange("")}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    ) : (
                        <div
                            className="w-full h-32 border-2 border-dashed rounded-md flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <Upload className="h-8 w-8 text-gray-400 mb-2" />
                            <span className="text-sm text-gray-500">{uploading ? "업로드 중..." : "파일을 선택하거나 드래그하세요"}</span>
                        </div>
                    )}
                    <input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        onChange={handleUpload}
                        accept="image/*"
                    />
                </div>
            ) : (
                <div className="space-y-3">
                    <Input
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder="https://example.com/image.jpg"
                    />
                    {value && value.startsWith('http') && (
                        <div className="relative w-full aspect-video rounded-md overflow-hidden border bg-white">
                            <img src={value} alt="External Preview" className="w-full h-full object-contain" />
                            <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="absolute top-2 right-2 h-8 w-8"
                                onClick={() => onChange("")}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
