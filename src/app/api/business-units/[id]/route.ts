
import { NextResponse } from 'next/server';
import { fetchFromGoogleSheet, syncToGoogleSheet } from '@/lib/sheets';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const id = (await params).id;
    const units = await fetchFromGoogleSheet('businessUnit') as any[];
    const unit = units.find((u) => u.id === id);

    if (!unit) {
        return NextResponse.json({ error: 'Business Unit not found' }, { status: 404 });
    }

    return NextResponse.json(unit);
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const id = (await params).id;
        const body = await request.json();

        await syncToGoogleSheet('businessUnit', { ...body, id }, 'update');
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update business unit' }, { status: 500 });
    }
}
