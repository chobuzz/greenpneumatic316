
/**
 * Google Spreadsheet Synchronization Utility
 */

export type SheetEntityType = 'businessUnit' | 'category' | 'product' | 'insight' | 'emailSettings' | 'quotation' | 'inquiry' | 'customers' | 'unsubscribe';

export async function syncToGoogleSheet(
    type: SheetEntityType,
    data: any,
    action: 'create' | 'update' | 'delete' | 'sync' | 'bulkCreate' = 'create'
) {
    const scriptUrl = process.env.GOOGLE_SCRIPT_URL

    if (!scriptUrl || scriptUrl === "your-script-url-here") {
        console.warn("⚠️ GOOGLE_SCRIPT_URL이 설정되지 않았습니다. 스프레드시트 작업을 건너뜜.")
        return { success: false, error: "Missing script URL" }
    }

    console.log(`📡 [Sheets] ${type} (${action}) 작업 시작...`)

    // quotation/inquiry는 GAS Legacy 경로(appendRow)를 통해 정확한 컬럼에 저장
    // action을 포함하면 handleCrudAction으로 이동해 헤더 매핑이 꼬이므로 제외
    const isLegacyType = type === 'quotation' || type === 'inquiry'
    const body = isLegacyType
        ? JSON.stringify({ type, data })
        : JSON.stringify({ action, type, data })

    try {
        const response = await fetch(scriptUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "User-Agent": "Mozilla/5.0 (compatible; GreenPneumaticBot/1.0)"
            },
            body,
            redirect: 'follow'
        })

        const responseText = await response.text();
        let result;
        try {
            result = JSON.parse(responseText);
        } catch (e) {
            console.error(`❌ [Sheets] GAS 응답이 JSON이 아님:`, responseText);
            return { success: false, error: `GAS Response is not JSON. Status: ${response.status}` };
        }

        if (result.result === "success") {
            console.log(`✅ [Sheets] ${type} (${action}) 완료!`, result);
            return { success: true, message: result.message || "Success" };
        } else {
            console.error(`❌ [Sheets] GAS 오류:`, result.message || result.error || "Unknown Error");
            return { success: false, error: result.message || result.error || "GAS returned error" };
        }
    } catch (error: any) {
        console.error("❌ [Sheets] 통신 치명적 오류:", error)
        return { success: false, error: error?.message || "Unknown communication error" }
    }
}

/**
 * Google Spreadsheet Data Retrieval Utility
 */

// GAS 스프레드시트는 한글 헤더로 저장되므로, 어드민 UI(영문 키)와 매핑 필요
function mapKoreanToEnglish(type: SheetEntityType, row: any): any {
    if (type === 'quotation') {
        return {
            id: row["ID"] || row["id"] || "",
            createdAt: row["발생일시"] || row["createdAt"] || "",
            customerName: row["고객명"] || row["customerName"] || "",
            company: row["업체명"] || row["company"] || "-",
            phone: row["연락처"] || row["phone"] || "",
            email: row["이메일"] || row["email"] || "",
            productName: row["상품명"] || row["productName"] || "",
            modelName: row["모델명"] || row["modelName"] || "",
            quantity: row["수량"] || row["quantity"] || 0,
            totalPrice: row["총금액"] || row["totalPrice"] || 0,
            unitName: row["사업부"] || row["unitName"] || "",
            marketingConsent: (row["마케팅동의"] || row["marketingConsent"]) === "Y",
        }
    }
    if (type === 'inquiry') {
        return {
            id: row["ID"] || row["id"] || "",
            createdAt: row["발생일시"] || row["createdAt"] || "",
            name: row["성함"] || row["name"] || "",
            company: row["업체명"] || row["company"] || "-",
            phone: row["연락처"] || row["phone"] || "",
            email: row["이메일"] || row["email"] || "",
            subject: row["문의구분"] || row["subject"] || "",
            message: row["상세내용"] || row["message"] || "",
            marketingConsent: (row["마케팅동의"] || row["marketingConsent"]) === "Y",
        }
    }
    return row
}

export async function fetchFromGoogleSheet(type: SheetEntityType) {
    const scriptUrl = process.env.GOOGLE_SCRIPT_URL

    if (!scriptUrl || scriptUrl === "your-script-url-here") {
        console.error("❌ [Sheets] GOOGLE_SCRIPT_URL이 설정되지 않았습니다.")
        return []
    }

    try {
        const response = await fetch(`${scriptUrl}?type=${type}`, {
            method: "GET",
            headers: {
                "Accept": "application/json",
                "User-Agent": "Mozilla/5.0 (compatible; GreenPneumaticBot/1.0)"
            },
            cache: 'no-store',
            redirect: 'follow'
        })

        if (!response.ok) {
            console.error(`❌ [Sheets] HTTP 오류! 상태코드: ${response.status}`)
            return []
        }

        const data = await response.json()

        // 이메일 설정의 경우 단일 객체로 변환하여 반환
        if (type === 'emailSettings' && Array.isArray(data) && data.length > 0) {
            return {
                ...data[0],
                isAd: data[0].isAd === true || data[0].isAd === "TRUE" || data[0].isAd === "true"
            };
        }

        // quotation / inquiry: 한글 헤더 → 영문 키 변환
        if ((type === 'quotation' || type === 'inquiry') && Array.isArray(data)) {
            return data.map(row => mapKoreanToEnglish(type, row))
        }

        return Array.isArray(data) ? data : []
    } catch (error: any) {
        console.error(`❌ [Sheets] 데이터 로드 실패 (${type}):`, error?.message || error)
        return []
    }
}

/**
 * 전용 유틸리티: 이메일 설정 로드 (하위 호환성 유지)
 */
export async function fetchEmailSettings() {
    return await fetchFromGoogleSheet('emailSettings');
}
