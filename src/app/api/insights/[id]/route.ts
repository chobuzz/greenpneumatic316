
import { NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const db = await readDb();
        const body = await request.json();
        const index = db.insights.findIndex(i => i.id === id);

        if (index === -1) {
            return NextResponse.json({ error: 'Insight not found' }, { status: 404 });
        }

        db.insights[index] = {
            ...db.insights[index],
            ...body,
            id: id, // Ensure ID doesn't change
        };

        await writeDb(db);
        return NextResponse.json(db.insights[index]);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update insight' }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const db = await readDb();
        db.insights = db.insights.filter(i => i.id !== id);
        await writeDb(db);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete insight' }, { status: 500 });
    }
}
