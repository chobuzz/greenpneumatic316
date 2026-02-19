import { NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"

export async function POST(request: Request) {
    try {
        const formData = await request.formData()
        const file = formData.get("image") as File

        if (!file) {
            return NextResponse.json({ error: "No image provided" }, { status: 400 })
        }

        // 허용 파일 타입 체크
        const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"]
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json({ error: "Invalid file type" }, { status: 400 })
        }

        // 파일 크기 제한 (5MB)
        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json({ error: "File too large (max 5MB)" }, { status: 400 })
        }

        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        // 저장 경로 설정
        const uploadDir = join(process.cwd(), "public", "uploads", "email-images")
        if (!existsSync(uploadDir)) {
            await mkdir(uploadDir, { recursive: true })
        }

        // 고유 파일명 생성
        const ext = file.name.split(".").pop() || "jpg"
        const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
        const filepath = join(uploadDir, filename)

        await writeFile(filepath, buffer)

        // 공개 URL 반환
        const url = `/uploads/email-images/${filename}`
        return NextResponse.json({ url })
    } catch (error) {
        console.error("Image upload error:", error)
        return NextResponse.json({ error: "Upload failed" }, { status: 500 })
    }
}
