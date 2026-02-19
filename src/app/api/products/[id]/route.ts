
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
        return NextResponse.json({
            ...product,
            images: typeof product.images === 'string' ? JSON.parse(product.images) : product.images || [],
            models: typeof product.models === 'string' ? JSON.parse(product.models) : product.models || [],
            specImages: typeof product.specImages === 'string' ? JSON.parse(product.specImages) : product.specImages || []
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
        images: Array.isArray(body.images) ? JSON.stringify(body.images) : body.images,
        models: Array.isArray(body.models) ? JSON.stringify(body.models) : body.models,
        specImages: Array.isArray(body.specImages) ? JSON.stringify(body.specImages) : body.specImages,
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
