
import { NextResponse } from 'next/server';
import { fetchFromGoogleSheet, syncToGoogleSheet } from '@/lib/sheets';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
    try {
        const categories = await fetchFromGoogleSheet('category') as any[];
        // Sort categories by order
        const sortedCategories = [...categories].sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));
        return NextResponse.json(sortedCategories);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, businessUnitId, parentId } = body;

        if (!name || !businessUnitId) {
            return NextResponse.json({ error: 'Name and Business Unit ID are required' }, { status: 400 });
        }

        const categories = await fetchFromGoogleSheet('category') as any[];
        const sameLevelCats = categories.filter(c => c.businessUnitId === businessUnitId && c.parentId === parentId);
        const maxOrder = sameLevelCats.reduce((max, c) => Math.max(max, Number(c.order) || 0), -1);

        const newCategory = {
            id: uuidv4(),
            name,
            businessUnitId,
            parentId: parentId || "",
            order: maxOrder + 1
        };

        await syncToGoogleSheet('category', newCategory, 'create');
        return NextResponse.json(newCategory);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
    }
}
