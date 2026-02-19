
import { NextResponse } from 'next/server';
import { fetchFromGoogleSheet, syncToGoogleSheet } from '@/lib/sheets';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
    try {
        const [units, products] = await Promise.all([
            fetchFromGoogleSheet('businessUnit'),
            fetchFromGoogleSheet('product')
        ]) as [any[], any[]];

        const allProducts = products.map((p) => {
            const unit = units.find(u => u.id === p.businessUnitId);
            return {
                ...p,
                businessUnitName: unit ? unit.name : 'Unknown',
                // Parse JSON strings back to arrays
                images: typeof p.images === 'string' ? JSON.parse(p.images) : p.images || [],
                models: typeof p.models === 'string' ? JSON.parse(p.models) : p.models || [],
                specImages: typeof p.specImages === 'string' ? JSON.parse(p.specImages) : p.specImages || []
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
        const { businessUnitId, ...productData } = body;

        if (!businessUnitId) {
            return NextResponse.json({ error: 'Business Unit ID is required' }, { status: 400 });
        }

        const newProduct = {
            id: uuidv4(),
            ...productData,
            businessUnitId,
            // Stringify arrays for Sheet storage
            images: JSON.stringify(productData.images || []),
            models: JSON.stringify(productData.models || []),
            specImages: JSON.stringify(productData.specImages || [])
        };

        await syncToGoogleSheet('product', newProduct, 'create');
        return NextResponse.json(newProduct);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
    }
}
