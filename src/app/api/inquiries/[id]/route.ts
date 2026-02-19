
import { NextResponse } from "next/server"
import { readDb, writeDb } from "@/lib/db"

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const db = await readDb()

        if (!db.inquiries) return NextResponse.json({ error: "Not found" }, { status: 404 })

        db.inquiries = db.inquiries.filter(i => i.id !== id)
        await writeDb(db)

        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete inquiry" }, { status: 500 })
    }
}
