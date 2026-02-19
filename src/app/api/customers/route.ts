
import { NextResponse } from "next/server"
import { fetchFromGoogleSheet } from "@/lib/sheets"

export interface Customer {
    id: string
    source: string
    name: string        // 거래처명
    businessNo: string  // 사업번호
    ceo: string         // 대표자
    address: string     // 사업주소
    category: string    // 종목
    manager: string     // 담당자
    phone: string       // 핸드폰
    email: string       // 이메일
}

export async function GET() {
    try {
        const customers = await fetchFromGoogleSheet('customers') as Customer[]
        return NextResponse.json(customers)
    } catch (error) {
        console.error("Customer fetch error:", error)
        return NextResponse.json({ error: "Failed to fetch customers" }, { status: 500 })
    }
}
