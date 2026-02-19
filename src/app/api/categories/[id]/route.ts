
import { NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const id = (await params).id;
    const db = await readDb();

    const index = db.categories.findIndex(c => c.id === id);
    if (index === -1) {
        return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    db.categories.splice(index, 1);
    await writeDb(db);

    return NextResponse.json({ success: true });
}
