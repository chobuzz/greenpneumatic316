
"use client"

import { useState, useRef } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Upload, X } from "lucide-react"

interface ImageUploadProps {
    value: string;
    onChange: (url: string) => void;
    onRemove: () => void;
}

export function ImageUpload({ value, onChange, onRemove }: ImageUploadProps) {
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

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
            console.error(err);
        } finally {
            setUploading(false);
            // Reset input so same file can be selected again if needed
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-4">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                >
                    <Upload className="h-4 w-4 mr-2" />
                    {uploading ? "업로드 중..." : "이미지 업로드"}
                </Button>
                <Input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={handleUpload}
                    accept="image/*"
                />
                {value && (
                    <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        onClick={onRemove}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                )}
            </div>

            {value && (
                <div className="relative aspect-video w-[200px] overflow-hidden rounded-md border bg-muted">
                    <Image
                        src={value}
                        alt="Upload"
                        fill
                        className="object-cover"
                    />
                </div>
            )}
        </div>
    );
}
