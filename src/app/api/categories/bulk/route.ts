
import { NextResponse } from 'next/server';
import { fetchFromGoogleSheet, syncToGoogleSheet } from '@/lib/sheets';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { names, businessUnitId, parentId } = body;

        if (!names || !Array.isArray(names) || names.length === 0 || !businessUnitId) {
            return NextResponse.json({ error: 'Names array and Business Unit ID are required' }, { status: 400 });
        }

        const categories = await fetchFromGoogleSheet('category') as any[];
        const { generateSlug } = await import('@/lib/slug');

        const targetParentId = parentId || "";
        const sameLevelCats = categories.filter(c =>
            c.businessUnitId === businessUnitId &&
            (c.parentId || "") === targetParentId
        );
        let maxOrder = sameLevelCats.reduce((max, c) => Math.max(max, Number(c.order) || 0), -1);

        const usedIds = new Set(categories.map(c => c.id));
        const newCategories = names.map((name: string) => {
            let baseId = generateSlug(name);
            let finalId = baseId;
            let counter = 1;
            while (usedIds.has(finalId)) {
                finalId = `${baseId}-${counter++}`;
            }
            usedIds.add(finalId);

            return {
                id: finalId,
                name,
                businessUnitId,
                parentId: targetParentId,
                order: ++maxOrder
            };
        });

        const syncResult = await syncToGoogleSheet('category', newCategories, 'bulkCreate');
        if (!syncResult.success) {
            console.error('❌ BULK CREATE GAS ERROR:', syncResult.error);
            return NextResponse.json({ error: syncResult.error }, { status: 500 });
        }

        return NextResponse.json(newCategories);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to bulk create categories' }, { status: 500 });
    }
}
