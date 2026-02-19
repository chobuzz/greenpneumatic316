
import { NextResponse } from 'next/server';
import { fetchFromGoogleSheet, syncToGoogleSheet } from '@/lib/sheets';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
    try {
        const insights = await fetchFromGoogleSheet('insight') as any[];
        const sortedInsights = insights.sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));
        return NextResponse.json(sortedInsights);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch insights' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const insights = await fetchFromGoogleSheet('insight') as any[];

        const maxOrder = insights.length > 0
            ? Math.max(...insights.map(i => Number(i.order) || 0))
            : -1;

        const newInsight = {
            id: uuidv4(),
            title: body.title,
            description: body.description,
            image: body.image,
            externalUrl: body.externalUrl,
            businessUnitId: body.businessUnitId || "",
            createdAt: new Date().toISOString(),
            order: maxOrder + 1,
        }

        await syncToGoogleSheet('insight', newInsight, 'create');
        return NextResponse.json(newInsight);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create insight' }, { status: 500 });
    }
}
