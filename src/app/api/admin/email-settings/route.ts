
import { NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';
import { syncToGoogleSheet } from '@/lib/sheets';

export async function GET() {
    try {
        const db = await readDb();
        return NextResponse.json({
            subject: db.emailSettings?.subject || "그린뉴메틱에서 소식을 전해드립니다",
            body: db.emailSettings?.body || "안녕하세요, {name} 고객님.\n\n그린뉴메틱의 새로운 솔루션을 확인해보세요.",
            senderAddress: db.emailSettings?.senderAddress || "경기도 양평군 다래길 27",
            senderPhone: db.emailSettings?.senderPhone || "010-7392-9809",
            isAd: db.emailSettings?.isAd ?? true
        });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const settings = await request.json();
        const db = await readDb();

        db.emailSettings = settings;
        await writeDb(db);

        // Google Sheets에 설정 동기화
        await syncToGoogleSheet('emailSettings', settings);

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
    }
}
