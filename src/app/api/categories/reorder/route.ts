
import { NextResponse } from 'next/server';
import { fetchFromGoogleSheet, syncToGoogleSheet } from '@/lib/sheets';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { orderedIds } = body as { orderedIds: string[] };

        if (!orderedIds || !Array.isArray(orderedIds)) {
            return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
        }

        const categories = await fetchFromGoogleSheet('category') as any[];

        // Update order for each category in the list
        const updatedCategories = categories.map(cat => {
            const index = orderedIds.indexOf(cat.id);
            if (index !== -1) {
                return { ...cat, order: index };
            }
            return cat;
        });

        await syncToGoogleSheet('category', updatedCategories, 'sync');
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to reorder' }, { status: 500 });
    }
}
