
import { NextResponse } from 'next/server';
import { syncToGoogleSheet } from '@/lib/sheets';

export async function POST(request: Request) {
    try {
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        // Google Sheets Unsubscribed 시트에 수신 거부 기록
        const syncResult = await syncToGoogleSheet('unsubscribe', {
            email,
            unsubscribedAt: new Date().toISOString()
        });

        if (syncResult.success) {
            return NextResponse.json({ success: true });
        } else {
            console.error("Failed to sync unsubscribe to sheet:", syncResult.error);
            // 시트 동기화 실패하더라도 사용자 경험 상 성공으로 속행 (로그는 남김)
            return NextResponse.json({ success: true });
        }
    } catch (error) {
        console.error("Unsubscribe API error:", error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
