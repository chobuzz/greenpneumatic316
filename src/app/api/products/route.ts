
import { NextResponse } from 'next/server';
import { fetchFromGoogleSheet, syncToGoogleSheet } from '@/lib/sheets';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
    try {
        const units = await fetchFromGoogleSheet('businessUnit') as any[];
        const rawProducts = await fetchFromGoogleSheet('product') as any[];

        const allProducts = rawProducts.map((p) => {
            // Robust parsing: check both plural (if user added them) and singular columns
            const parseField = (field: any) => {
                if (typeof field === 'string' && (field.startsWith('[') || field.startsWith('{'))) {
                    try { return JSON.parse(field); } catch (e) { return [field]; }
                }
                return Array.isArray(field) ? field : (field ? [field] : []);
            };

            const businessUnitIds = parseField(p.businessUnitIds || p.businessUnitId);
            const categoryIds = parseField(p.categoryIds || p.categoryId);

            // For existing UI compatibility, still provide a single ID (first one)
            const businessUnitId = businessUnitIds[0] || "";
            const unit = units.find((u: any) => u.id === businessUnitId);

            return {
                ...p,
                businessUnitId,
                businessUnitIds,
                categoryIds,
                businessUnitName: unit ? unit.name : 'Unknown',
                images: typeof p.images === 'string' ? JSON.parse(p.images) : p.images || [],
                models: typeof p.models === 'string' ? JSON.parse(p.models) : p.models || [],
                specImages: typeof p.specImages === 'string' ? JSON.parse(p.specImages) : p.specImages || [],
                mediaItems: typeof p.mediaItems === 'string' ? JSON.parse(p.mediaItems) : p.mediaItems || [],
                mediaPosition: p.mediaPosition || 'bottom'
            };
        });
        return NextResponse.json(allProducts);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { businessUnitIds, categoryIds, ...productData } = body;

        // Support both old and new field names for robustness
        const finalBUIds = Array.isArray(businessUnitIds) ? businessUnitIds : (body.businessUnitId ? [body.businessUnitId] : []);
        const finalCatIds = Array.isArray(categoryIds) ? categoryIds : (body.categoryId ? [body.categoryId] : []);

        if (finalBUIds.length === 0) {
            return NextResponse.json({ error: 'At least one Business Unit is required' }, { status: 400 });
        }

        const newProduct = {
            id: uuidv4(),
            ...productData,
            // Save JSON string to BOTH singular and plural to be safe
            // Plural if user ever adds headers, Singular for current sheet compatibility
            businessUnitId: JSON.stringify(finalBUIds),
            categoryId: JSON.stringify(finalCatIds),
            businessUnitIds: JSON.stringify(finalBUIds),
            categoryIds: JSON.stringify(finalCatIds),
            images: JSON.stringify(productData.images || []),
            models: JSON.stringify(productData.models || []),
            specImages: JSON.stringify(productData.specImages || []),
            mediaItems: JSON.stringify(productData.mediaItems || []),
            mediaPosition: productData.mediaPosition || 'bottom'
        };

        await syncToGoogleSheet('product', newProduct, 'create');
        return NextResponse.json(newProduct);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
    }
}
