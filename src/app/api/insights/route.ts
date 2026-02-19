
import { NextResponse } from 'next/server';
import { readDb, writeDb, Insight } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
    try {
        const db = await readDb();
        const sortedInsights = (db.insights || []).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        return NextResponse.json(sortedInsights);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch insights' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const db = await readDb();
        const body = await request.json();

        const maxOrder = db.insights && db.insights.length > 0
            ? Math.max(...db.insights.map(i => i.order ?? 0))
            : -1;

        const newInsight: Insight = {
            id: uuidv4(),
            title: body.title,
            description: body.description,
            image: body.image,
            externalUrl: body.externalUrl,
            businessUnitId: body.businessUnitId,
            createdAt: new Date().toISOString(),
            order: maxOrder + 1,
        };

        db.insights = [...(db.insights || []), newInsight];
        await writeDb(db);

        return NextResponse.json(newInsight);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create insight' }, { status: 500 });
    }
}
