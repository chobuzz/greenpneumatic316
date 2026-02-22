
import { NextResponse } from 'next/server';
import { syncToGoogleSheet } from '@/lib/sheets';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { names, businessUnitIds, categoryIds } = body;

        if (!names || !Array.isArray(names) || names.length === 0 || !businessUnitIds || !Array.isArray(businessUnitIds)) {
            return NextResponse.json({ error: 'Names and Business Unit IDs are required' }, { status: 400 });
        }

        const finalCatIds = Array.isArray(categoryIds) ? categoryIds : [];

        const newProducts = names.map((name: string) => ({
            id: uuidv4(),
            name,
            description: "",
            businessUnitId: JSON.stringify(businessUnitIds),
            categoryId: JSON.stringify(finalCatIds),
            businessUnitIds: JSON.stringify(businessUnitIds),
            categoryIds: JSON.stringify(finalCatIds),
            images: JSON.stringify([]),
            models: JSON.stringify([]),
            specImages: JSON.stringify([])
        }));

        const syncResult = await syncToGoogleSheet('product', newProducts, 'bulkCreate');
        if (!syncResult.success) {
            console.error('❌ BULK CREATE GAS ERROR:', syncResult.error);
            return NextResponse.json({ error: syncResult.error }, { status: 500 });
        }

        return NextResponse.json(newProducts);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to bulk create products' }, { status: 500 });
    }
}
