
/**
 * Google Spreadsheet Synchronization Utility
 */

export async function syncToGoogleSheet(type: 'quotation' | 'inquiry' | 'customers' | 'emailSettings', data: any) {
    const scriptUrl = process.env.GOOGLE_SCRIPT_URL

    if (!scriptUrl || scriptUrl === "your-script-url-here") {
        console.warn("⚠️ GOOGLE_SCRIPT_URL이 설정되지 않았습니다. 스프레드시트 저장을 건너뜁니다.")
        return { success: false, error: "Missing script URL" }
    }

    console.log(`📡 [Sheets] ${type} 데이터 전송 시작... URL: ${scriptUrl.substring(0, 40)}...`)

    try {
        const response = await fetch(scriptUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "User-Agent": "Mozilla/5.0 (compatible; GreenPneumaticBot/1.0; +https://greenpneumatic.com)"
            },
            body: JSON.stringify({
                type,
                timestamp: new Date().toISOString(),
                ...data
            }),
            redirect: 'follow'
        })

        if (!response.ok) {
            const statusText = response.statusText;
            console.error(`❌ [Sheets] HTTP 오류! 상태: ${response.status} ${statusText}`)
            return { success: false, error: `HTTP ${response.status} ${statusText}` }
        }

        const result = await response.json()

        if (result.result === "success") {
            console.log(`✅ [Sheets] ${type} 저장 성공!`)
            return { success: true }
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
export async function fetchFromGoogleSheet(type: 'quotation' | 'inquiry' | 'customers' | 'emailSettings') {
    const scriptUrl = process.env.GOOGLE_SCRIPT_URL

    if (!scriptUrl || scriptUrl === "your-script-url-here") {
        console.error("❌ [Sheets] GOOGLE_SCRIPT_URL이 설정되지 않았습니다.")
        return []
    }

    console.log(`📡 [Sheets] ${type} 데이터 로드 시작... URL: ${scriptUrl.substring(0, 40)}...`)

    try {
        const response = await fetch(`${scriptUrl}?type=${type}`, {
            method: "GET",
            headers: {
                "Accept": "application/json",
                "User-Agent": "Mozilla/5.0 (compatible; GreenPneumaticBot/1.0; +https://greenpneumatic.com)"
            },
            cache: 'no-store',
            redirect: 'follow'
        })

        if (!response.ok) {
            console.error(`❌ [Sheets] HTTP 오류! 상태코드: ${response.status} (Type: ${type})`)
            return []
        }

        const data = await response.json()
        console.log(`✅ [Sheets] ${type} 로드 완료 (${Array.isArray(data) ? data.length : 0}건)`)
        return Array.isArray(data) ? data : []
    } catch (error: any) {
        console.error(`❌ [Sheets] 데이터 로드 실패 (${type}):`, error?.message || error)
        throw error
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
