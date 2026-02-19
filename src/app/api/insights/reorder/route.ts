
import { NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';

export async function POST(request: Request) {
    try {
        const db = await readDb();
        const { insightIds } = await request.json(); // Array of IDs in the new order

        if (!Array.isArray(insightIds)) {
            return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
        }

        // Update the order field for each insight
        db.insights = db.insights.map(insight => {
            const index = insightIds.indexOf(insight.id);
            if (index !== -1) {
                return { ...insight, order: index };
            }
            return insight;
        });

        await writeDb(db);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to reorder insights' }, { status: 500 });
    }
}
