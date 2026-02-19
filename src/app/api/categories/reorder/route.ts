
import { NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { orderedIds } = body as { orderedIds: string[] };

        if (!orderedIds || !Array.isArray(orderedIds)) {
            return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
        }

        const db = await readDb();

        // Update order for each category in the list
        db.categories = db.categories.map(cat => {
            const index = orderedIds.indexOf(cat.id);
            if (index !== -1) {
                return { ...cat, order: index };
            }
            return cat;
        });

        await writeDb(db);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to reorder' }, { status: 500 });
    }
}
