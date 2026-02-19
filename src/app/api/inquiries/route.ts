
import { NextResponse } from "next/server"
import { readDb, writeDb, Inquiry } from "@/lib/db"
import { sendNotificationEmail } from "@/lib/email"
import { syncToGoogleSheet, fetchFromGoogleSheet } from "@/lib/sheets"

export async function GET() {
    try {
        const inquiries = await fetchFromGoogleSheet('inquiry') as Inquiry[]
        const sorted = [...inquiries].sort((a, b) =>
            String(b.createdAt || "").localeCompare(String(a.createdAt || ""))
        )
        return NextResponse.json(sorted)
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch inquiries" }, { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        const data = await req.json()

        const newInquiry: Inquiry = {
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
            ...data
        }

        // 1. Email Notification
        await sendNotificationEmail({
            subject: `[그린뉴메틱] 새로운 온라인 문의 접수: ${newInquiry.name}님`,
            text: `
신규 문의가 접수되었습니다.

- 성함: ${newInquiry.name}
- 업체명: ${newInquiry.company}
- 연락처: ${newInquiry.phone}
- 이메일: ${newInquiry.email}
- 구분: ${newInquiry.subject}
- 내용:
${newInquiry.message}

관리자 페이지에서 자세한 내용을 확인하세요.
            `,
            html: `
                <h3>신규 문의가 접수되었습니다.</h3>
                <p><b>성함:</b> ${newInquiry.name}</p>
                <p><b>업체명:</b> ${newInquiry.company}</p>
                <p><b>연락처:</b> ${newInquiry.phone}</p>
                <p><b>이메일:</b> ${newInquiry.email}</p>
                <p><b>구분:</b> ${newInquiry.subject}</p>
                <p><b>내용:</b></p>
                <div style="background: #f5f5f5; padding: 15px; border-radius: 5px;">
                    ${newInquiry.message.replace(/\n/g, '<br>')}
                </div>
            `
        })

        // 2. Google Sheets Sync
        await syncToGoogleSheet('inquiry', newInquiry)

        return NextResponse.json(newInquiry)
    } catch (error) {
        console.error("Inquiry save error:", error)
        return NextResponse.json({ error: "Failed to save inquiry" }, { status: 500 })
    }
}
