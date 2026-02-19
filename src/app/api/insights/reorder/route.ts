
import { NextResponse } from 'next/server';
import { fetchFromGoogleSheet, syncToGoogleSheet } from '@/lib/sheets';

export async function POST(request: Request) {
    try {
        const { insightIds } = await request.json(); // Array of IDs in the new order

        if (!Array.isArray(insightIds)) {
            return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
        }

        const insights = await fetchFromGoogleSheet('insight') as any[];

        // Update the order field for each insight
        const updatedInsights = insights.map(insight => {
            const index = insightIds.indexOf(insight.id);
            if (index !== -1) {
                return { ...insight, order: index };
            }
            return insight;
        });

        await syncToGoogleSheet('insight', updatedInsights, 'sync');
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to reorder insights' }, { status: 500 });
    }
}
