
/**
 * Google Spreadsheet Synchronization Utility
 */

export type SheetEntityType = 'businessUnit' | 'category' | 'product' | 'insight' | 'emailSettings' | 'quotation' | 'inquiry' | 'customers';

export async function syncToGoogleSheet(
    type: SheetEntityType,
    data: any,
    action: 'create' | 'update' | 'delete' | 'sync' = 'create'
) {
    const scriptUrl = process.env.GOOGLE_SCRIPT_URL

    if (!scriptUrl || scriptUrl === "your-script-url-here") {
        console.warn("⚠️ GOOGLE_SCRIPT_URL이 설정되지 않았습니다. 스프레드시트 작업을 건너뜜.")
        return { success: false, error: "Missing script URL" }
    }

    console.log(`📡 [Sheets] ${type} (${action}) 작업 시작...`)

    try {
        const response = await fetch(scriptUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "User-Agent": "Mozilla/5.0 (compatible; GreenPneumaticBot/1.0)"
            },
            body: JSON.stringify({
                action,
                type,
                data
            }),
            redirect: 'follow'
        })

        const result = await response.json()

        if (result.result === "success") {
            console.log(`✅ [Sheets] ${type} (${action}) 완료!`)
            return { success: true, message: result.message }
        } else {
            console.error(`❌ [Sheets] GAS 오류:`, result.message)
            return { success: false, error: result.message }
        }
    } catch (error: any) {
        console.error("❌ [Sheets] 통신 치명적 오류:", error)
        return { success: false, error: error?.message || "Unknown communication error" }
    }
}

/**
 * Google Spreadsheet Data Retrieval Utility
 */
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
