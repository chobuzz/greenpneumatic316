
import { NextResponse } from 'next/server';
import { fetchFromGoogleSheet, syncToGoogleSheet } from '@/lib/sheets';

export async function GET() {
    try {
        const settings: any = await fetchFromGoogleSheet('emailSettings');
        return NextResponse.json({
            subject: settings?.subject || "그린뉴메틱에서 소식을 전해드립니다",
            body: settings?.body || "안녕하세요, {name} 고객님.\n\n그린뉴메틱의 새로운 솔루션을 확인해보세요.",
            senderAddress: settings?.senderAddress || "경기도 양평군 다래길 27",
            senderPhone: settings?.senderPhone || "010-7392-9809",
            isAd: settings?.isAd ?? true
        });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const settings = await request.json();

        // Google Sheets에 설정 동기화
        await syncToGoogleSheet('emailSettings', settings, 'create'); // emailSettings uses create for overwriting in GAS v4

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
    }
}
