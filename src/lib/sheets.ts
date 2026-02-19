
/**
 * Google Spreadsheet Synchronization Utility
 */

export async function syncToGoogleSheet(type: 'quotation' | 'inquiry' | 'customers' | 'emailSettings', data: any) {
    const scriptUrl = process.env.GOOGLE_SCRIPT_URL

    if (!scriptUrl || scriptUrl === "your-script-url-here") {
        console.warn("⚠️ GOOGLE_SCRIPT_URL이 설정되지 않았습니다. 스프레드시트 저장을 건너뜁니다.")
        return { success: false, error: "Missing script URL" }
    }

    console.log(`📡 [Spreadsheet] ${type} 데이터 전송 시작... URL: ${scriptUrl.substring(0, 30)}...`)

    try {
        const response = await fetch(scriptUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                type,
                timestamp: new Date().toISOString(),
                ...data
            }),
            // Google Apps Script는 리다이렉션을 사용하므로 follow가 필요함 (기본값이지만 명시)
            redirect: 'follow'
        })

        const result = await response.json()

        if (result.result === "success") {
            console.log(`✅ [Spreadsheet] ${type} 저장 성공!`)
            return { success: true }
        } else {
            console.error(`❌ [Spreadsheet] 저장 실패:`, result.message)
            return { success: false, error: result.message }
        }
    } catch (error) {
        console.error("❌ [Spreadsheet] 통신 오류:", error)
        return { success: false, error: error instanceof Error ? error.message : "Network error" }
    }
}

/**
 * Google Spreadsheet Data Retrieval Utility
 */
export async function fetchFromGoogleSheet(type: 'quotation' | 'inquiry' | 'customers' | 'emailSettings') {
    const scriptUrl = process.env.GOOGLE_SCRIPT_URL

    if (!scriptUrl || scriptUrl === "your-script-url-here") {
        console.warn("⚠️ [Spreadsheet] GOOGLE_SCRIPT_URL이 설정되지 않았습니다.")
        return []
    }

    console.log(`📡 [Spreadsheet] ${type} 데이터 로드 시작... URL: ${scriptUrl.substring(0, 30)}...`)

    try {
        const response = await fetch(`${scriptUrl}?type=${type}`, {
            method: "GET",
            headers: {
                "Accept": "application/json",
            },
            cache: 'no-store', // 실시간 데이터 조회를 위해 캐시 비활성화
            redirect: 'follow' // Google Apps Script 리다이렉트 대응
        })

        if (!response.ok) {
            console.error(`❌ [Spreadsheet] HTTP 오류! 상태코드: ${response.status}`)
            return []
        }

        const data = await response.json()
        console.log(`✅ [Spreadsheet] ${type} 로드 완료 (${Array.isArray(data) ? data.length : 0}건)`)
        return Array.isArray(data) ? data : []
    } catch (error) {
        console.error(`❌ [Spreadsheet] 데이터 로드 실패 (${type}):`, error)
        throw error // 에러를 상위로 던져서 API가 500 에러를 반환하게 함
    }
}

/**
 * Fetch email settings specifically
 */
export async function fetchEmailSettings() {
    const scriptUrl = process.env.GOOGLE_SCRIPT_URL
    if (!scriptUrl) return { subject: "", body: "", senderAddress: "", senderPhone: "", isAd: false };

    try {
        const response = await fetch(`${scriptUrl}?type=emailSettings`, { redirect: 'follow' });
        const data = await response.json();
        // GAS may return an array for simple GET of sheet data
        if (Array.isArray(data) && data.length > 0) {
            return {
                subject: data[0].subject || "",
                body: data[0].body || "",
                senderAddress: data[0].senderAddress || "",
                senderPhone: data[0].senderPhone || "",
                isAd: !!data[0].isAd
            };
        }
        return data;
    } catch (error) {
        console.error("❌ [Spreadsheet] Email settings 로드 실패:", error)
        return { subject: "", body: "", senderAddress: "", senderPhone: "", isAd: false };
    }
}
