
import { NextResponse } from "next/server"
import { syncToGoogleSheet } from "@/lib/sheets"

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params

        await syncToGoogleSheet('quotation', { id }, 'delete')

        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete quotation" }, { status: 500 })
    }
}
