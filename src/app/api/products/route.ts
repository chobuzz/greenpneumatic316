
import { NextResponse } from 'next/server';
import { readDb, writeDb, type Product } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
    const db = await readDb();
    // Flatten products with unitId for convenience
    const allProducts = db.businessUnits.flatMap((unit) =>
        unit.products.map((p) => ({ ...p, businessUnitId: unit.id, businessUnitName: unit.name }))
    );
    return NextResponse.json(allProducts);
}

export async function POST(request: Request) {
    const body = await request.json();
    const { businessUnitId, ...productData } = body;

    if (!businessUnitId) {
        return NextResponse.json({ error: 'Business Unit ID is required' }, { status: 400 });
    }

    const db = await readDb();
    const unitIndex = db.businessUnits.findIndex(u => u.id === businessUnitId);

    if (unitIndex === -1) {
        return NextResponse.json({ error: 'Business Unit not found' }, { status: 404 });
    }

    const newProduct: Product = {
        id: uuidv4(),
        ...productData,
        images: productData.images || []
    };

    db.businessUnits[unitIndex].products.push(newProduct);
    await writeDb(db);

    return NextResponse.json(newProduct);
}
