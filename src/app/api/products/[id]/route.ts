
import { NextResponse } from 'next/server';
import { fetchFromGoogleSheet, syncToGoogleSheet } from '@/lib/sheets';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const id = (await params).id;
    const products = await fetchFromGoogleSheet('product') as any[];
    const product = products.find(p => p.id === id);

    if (product) {
        // Robust parsing: check both plural (if user added them) and singular columns
        const parseField = (field: any) => {
            if (typeof field === 'string' && (field.startsWith('[') || field.startsWith('{'))) {
                try { return JSON.parse(field); } catch (e) { return [field]; }
            }
            return Array.isArray(field) ? field : (field ? [field] : []);
        };

        const safeParseJSON = (data: any) => {
            if (!data || typeof data !== 'string') return data || [];
            const trimmed = data.trim();
            if (trimmed === "" || (!trimmed.startsWith('[') && !trimmed.startsWith('{'))) {
                return trimmed ? [trimmed] : [];
            }
            try {
                return JSON.parse(trimmed);
            } catch (e) {
                console.warn(`[API] Single Product JSON parsing failed: ${trimmed.substring(0, 50)}`);
                return [];
            }
        };

        const businessUnitIds = parseField(product.businessUnitIds || product.businessUnitId);
        const categoryIds = parseField(product.categoryIds || product.categoryId);

        return NextResponse.json({
            ...product,
            businessUnitId: businessUnitIds[0] || "",
            businessUnitIds,
            categoryIds,
            images: safeParseJSON(product.images),
            models: safeParseJSON(product.models),
            options: safeParseJSON(product.options),
            specImages: safeParseJSON(product.specImages),
            mediaItems: safeParseJSON(product.mediaItems),
            mediaPosition: product.mediaPosition || 'bottom'
        });
    }

    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const id = (await params).id;
    const body = await request.json();

    const productUpdate = {
        ...body,
        id, // Ensure ID is consistent
        // Save JSON string to BOTH singular and plural to be safe
        businessUnitId: Array.isArray(body.businessUnitIds) ? JSON.stringify(body.businessUnitIds) : body.businessUnitIds,
        categoryId: Array.isArray(body.categoryIds) ? JSON.stringify(body.categoryIds) : body.categoryIds,
        businessUnitIds: Array.isArray(body.businessUnitIds) ? JSON.stringify(body.businessUnitIds) : body.businessUnitIds,
        categoryIds: Array.isArray(body.categoryIds) ? JSON.stringify(body.categoryIds) : body.categoryIds,

        images: Array.isArray(body.images) ? JSON.stringify(body.images) : body.images,
        models: Array.isArray(body.models) ? JSON.stringify(body.models) : body.models,
        optionGroups: Array.isArray(body.optionGroups) ? JSON.stringify(body.optionGroups) : body.optionGroups,
        specImages: Array.isArray(body.specImages) ? JSON.stringify(body.specImages) : body.specImages,
        mediaItems: Array.isArray(body.mediaItems) ? JSON.stringify(body.mediaItems) : body.mediaItems,
        mediaPosition: body.mediaPosition || 'bottom'
    };

    await syncToGoogleSheet('product', productUpdate, 'update');
    return NextResponse.json({ success: true });
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const id = (await params).id;
    await syncToGoogleSheet('product', { id }, 'delete');
    return NextResponse.json({ success: true });
}
