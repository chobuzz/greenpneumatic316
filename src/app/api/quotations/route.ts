
import { NextResponse } from "next/server"
import { readDb, writeDb, Quotation } from "@/lib/db"
import { sendNotificationEmail } from "@/lib/email"
import { syncToGoogleSheet, fetchFromGoogleSheet } from "@/lib/sheets"

export async function GET() {
    try {
        const quotations = await fetchFromGoogleSheet('quotation') as Quotation[]
        const sorted = [...quotations].sort((a, b) =>
            String(b.createdAt || "").localeCompare(String(a.createdAt || ""))
        )
        return NextResponse.json(sorted)
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch quotations" }, { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        const data = await req.json()
        const { type, pdfBase64, ...quotationData } = data

        if (type === "preview_notification") {
            await sendNotificationEmail({
                subject: `[그린뉴메틱] 견적서 미리보기 생성 알림: ${quotationData.customerName}님`,
                text: `고객(${quotationData.customerName})이 ${quotationData.productName} 상품에 대한 견적서 미리보기를 생성했습니다.`,
                html: `
                    <div style="font-family: sans-serif; padding: 20px;">
                        <h2 style="color: #2563eb;">견적서 미리보기 생성 알림</h2>
                        <p><b>고객명:</b> ${quotationData.customerName}</p>
                        <p><b>업체명:</b> ${quotationData.company || "-"}</p>
                        <p><b>상품명:</b> ${quotationData.productName}</p>
                        <p><b>모델명:</b> ${quotationData.modelName}</p>
                        <p><b>이메일:</b> ${quotationData.email}</p>
                        <hr style="border: 1px solid #eee; margin: 20px 0;" />
                        <p style="color: #666; font-size: 14px;">현재 고객이 견적서 내용을 확인 중입니다. 잠시 후 최종 발급이 완료될 수 있습니다.</p>
                    </div>
                `
            })
            return NextResponse.json({ success: true, message: "Preview notification sent" })
        }

        // Proceed with Final Quotation (default or explicit)
        const newQuotation: Quotation = {
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
            ...quotationData
        }

        const attachments = pdfBase64 ? [
            {
                filename: `견적서_${newQuotation.productName}_${newQuotation.customerName}.pdf`,
                content: pdfBase64.split(',')[1],
                encoding: 'base64'
            }
        ] : []

        // 1. Email to Admin
        await sendNotificationEmail({
            subject: `[그린뉴메틱] 최종 온라인 견적 발급: ${newQuotation.customerName}님`,
            text: `신규 견적서가 공식 발급되었습니다.`,
            html: `
                <div style="font-family: sans-serif; padding: 20px; color: #334155;">
                    <h2 style="color: #059669; border-bottom: 2px solid #059669; padding-bottom: 10px;">최종 온라인 견적 발급 완료</h2>
                    <div style="background-color: #f8fafc; padding: 20px; border-radius: 12px; margin: 20px 0;">
                        <h3 style="margin-top: 0; color: #0f172a;">고객 정보</h3>
                        <p><b>고객명:</b> ${newQuotation.customerName}</p>
                        <p><b>업체명:</b> ${newQuotation.company || "-"}</p>
                        <p><b>연락처:</b> ${newQuotation.phone}</p>
                        <p><b>이메일:</b> ${newQuotation.email}</p>
                    </div>
                    <div style="background-color: #f0fdf4; padding: 20px; border-radius: 12px; margin: 20px 0;">
                        <h3 style="margin-top: 0; color: #0f172a;">상품 및 견적 정보</h3>
                        <p><b>상품명:</b> ${newQuotation.productName}</p>
                        <p><b>모델명:</b> ${newQuotation.modelName}</p>
                        ${newQuotation.selectedOptions && newQuotation.selectedOptions.length > 0 ? `
                        <p><b>선택 옵션:</b> ${newQuotation.selectedOptions.map(o => `${o.name}(+${o.price.toLocaleString()}원)`).join(", ")}</p>
                        ` : ""}
                        <p><b>수량:</b> ${newQuotation.quantity}개</p>
                        <p><b>총액 (공급가):</b> <span style="font-size: 18px; color: #059669; font-weight: bold;">${newQuotation.totalPrice.toLocaleString()}원</span></p>
                    </div>
                    <hr style="border: 1px solid #eee; margin: 20px 0;" />
                    <p style="color: #666; font-size: 14px;">본 메일은 시스템에 의해 자동 발송되었습니다. 자세한 정보는 첨부된 PDF를 확인하십시오.</p>
                </div>
            `,
            attachments
        })

        // 2. Email to Customer (Confirmation)
        if (newQuotation.email) {
            const { createModernEmailTemplate } = await import("@/lib/email-template")
            const customerHtml = createModernEmailTemplate({
                recipientName: newQuotation.customerName,
                body: `
                    <p>그린뉴메틱을 이용해 주셔서 진심으로 감사드립니다.</p>
                    <p>요청하신 <b>${newQuotation.productName} (${newQuotation.modelName})</b> 상품에 대한 공식 온라인 견적서가 발급되었습니다.</p>
                    ${newQuotation.selectedOptions && newQuotation.selectedOptions.length > 0 ? `
                    <p>선택 옵션: ${newQuotation.selectedOptions.map(o => o.name).join(", ")}</p>
                    ` : ""}
                    <p>첨부된 PDF 파일을 통해 상세 견적 내용을 확인하실 수 있습니다.</p>
                    <br/>
                    <div style="background-color: #f8fafc; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0;">
                        <p style="margin: 0; font-size: 14px; color: #64748b;">주문 및 상세 상담이 필요하시면 아래 연락처로 문의 부탁드립니다.</p>
                        <p style="margin: 10px 0 0 0; font-weight: bold; color: #0f172a;">대표번호: 010-7392-9809</p>
                    </div>
                `
            })

            const { sendEmail } = await import("@/lib/email")
            await sendEmail({
                to: newQuotation.email,
                subject: `[그린뉴메틱] 요청하신 ${newQuotation.productName} 견적서가 도착했습니다.`,
                text: `${newQuotation.customerName}님, 요청하신 견적서가 발급되었습니다.`,
                html: customerHtml,
                attachments
            })
        }

        // 3. Google Sheets Sync (GAS Legacy 경로: data.customerName, data.phone 등 영문 키로 접근)
        const sheetData = {
            customerName: newQuotation.customerName,
            company: newQuotation.company || "-",
            phone: newQuotation.phone,
            email: newQuotation.email,
            productName: newQuotation.productName,
            modelName: newQuotation.modelName,
            selectedOptions: JSON.stringify(newQuotation.selectedOptions || []), // id는 선택적
            quantity: newQuotation.quantity,
            totalPrice: newQuotation.totalPrice,
            unitName: newQuotation.unitName,
            마케팅동의: newQuotation.marketingConsent ? "Y" : "N",
            id: newQuotation.id
        }
        await syncToGoogleSheet('quotation', sheetData)

        // MasterList 연동 로직은 Apps Script 기반으로 이관됨

        return NextResponse.json(newQuotation)
    } catch (error) {
        console.error("Quotation save error:", error)
        return NextResponse.json({ error: "Failed to save quotation" }, { status: 500 })
    }
}
