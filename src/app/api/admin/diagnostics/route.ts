import { NextResponse } from "next/server";

export async function GET() {
    const results: any = {
        env: {
            GOOGLE_SCRIPT_URL: process.env.GOOGLE_SCRIPT_URL ? "설정됨 (SENSITIVE)" : "미설정",
            NEXT_PUBLIC_SPREADSHEET_URL: process.env.NEXT_PUBLIC_SPREADSHEET_URL ? "설정됨" : "미설정",
            NODE_ENV: process.env.NODE_ENV,
        },
        connectionTest: null,
        timestamp: new Date().toISOString()
    };

    const scriptUrl = process.env.GOOGLE_SCRIPT_URL;

    if (scriptUrl) {
        try {
            const start = Date.now();
            const response = await fetch(`${scriptUrl}?type=quotation`, {
                method: "GET",
                headers: {
                    "Accept": "application/json",
                    "User-Agent": "Mozilla/5.0 (compatible; GreenPneumaticDiagnostics/1.0)"
                },
                redirect: 'follow',
                cache: 'no-store'
            });
            const duration = Date.now() - start;

            results.connectionTest = {
                status: response.status,
                statusText: response.statusText,
                ok: response.ok,
                durationMs: duration,
                urlUsed: scriptUrl.substring(0, 40) + "...",
            };

            if (response.ok) {
                const text = await response.text();
                try {
                    const json = JSON.parse(text);
                    results.connectionTest.isJson = true;
                    results.connectionTest.dataCount = Array.isArray(json) ? json.length : "Not an array";
                } catch (e) {
                    results.connectionTest.isJson = false;
                    results.connectionTest.preview = text.substring(0, 200);
                }
            }
        } catch (error: any) {
            results.connectionTest = {
                error: error.message || "Unknown fetch error",
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
            };
        }
    }

    return NextResponse.json(results);
}
