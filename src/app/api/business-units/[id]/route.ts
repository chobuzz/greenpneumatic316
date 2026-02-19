
import { NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const id = (await params).id;
    const db = await readDb();
    const unit = db.businessUnits.find((u) => u.id === id);

    if (!unit) {
        return NextResponse.json({ error: 'Business Unit not found' }, { status: 404 });
    }

    return NextResponse.json(unit);
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const id = (await params).id;
    const body = await request.json();
    const db = await readDb();

    const index = db.businessUnits.findIndex((u) => u.id === id);
    if (index === -1) {
        return NextResponse.json({ error: 'Business Unit not found' }, { status: 404 });
    }

    // Update fields
    db.businessUnits[index] = { ...db.businessUnits[index], ...body };
    await writeDb(db);

    return NextResponse.json(db.businessUnits[index]);
}
