
import { NextResponse } from 'next/server';
import { readDb, writeDb, type Category } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
    const db = await readDb();
    // Sort categories by order
    const sortedCategories = [...db.categories].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

    // Join with business unit name for display
    const categoriesWithUnitName = sortedCategories.map(cat => {
        const unit = db.businessUnits.find(u => u.id === cat.businessUnitId);
        return { ...cat, businessUnitName: unit ? unit.name : 'Unknown' };
    });
    return NextResponse.json(categoriesWithUnitName);
}

export async function POST(request: Request) {
    const body = await request.json();
    const { name, businessUnitId, parentId } = body;

    if (!name || !businessUnitId) {
        return NextResponse.json({ error: 'Name and Business Unit ID are required' }, { status: 400 });
    }

    const db = await readDb();

    // Find max order in the same level to place new item at the end
    const sameLevelCats = db.categories.filter(c => c.businessUnitId === businessUnitId && c.parentId === parentId);
    const maxOrder = sameLevelCats.reduce((max, c) => Math.max(max, c.order ?? 0), -1);

    const newCategory: Category = {
        id: uuidv4(),
        name,
        businessUnitId,
        parentId: parentId || undefined,
        order: maxOrder + 1
    };

    db.categories.push(newCategory);
    await writeDb(db);

    return NextResponse.json(newCategory);
}
