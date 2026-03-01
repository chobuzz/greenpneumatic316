
import { NextResponse } from 'next/server';
import { fetchFromGoogleSheet, syncToGoogleSheet } from '@/lib/sheets';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
    try {
        const units = await fetchFromGoogleSheet('businessUnit');
        return NextResponse.json(units, {
            headers: {
                'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30'
            }
        });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch business units' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const newUnit = {
            id: uuidv4(),
            name: body.name,
            description: body.description,
            image: body.image || "/placeholder.png",
            color: body.color || "bg-gray-500"
        };

        await syncToGoogleSheet('businessUnit', newUnit, 'create');
        return NextResponse.json(newUnit);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create business unit' }, { status: 500 });
    }
}
