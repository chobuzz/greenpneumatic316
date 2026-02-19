
import { NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const id = (await params).id;
    const db = await readDb();

    for (const unit of db.businessUnits) {
        const product = unit.products.find(p => p.id === id);
        if (product) {
            return NextResponse.json({ ...product, businessUnitId: unit.id });
        }
    }

    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const id = (await params).id;
    const body = await request.json();
    const db = await readDb();

    // Find product and its unit
    let foundUnitIndex = -1;
    let foundProductIndex = -1;

    for (let i = 0; i < db.businessUnits.length; i++) {
        const pIndex = db.businessUnits[i].products.findIndex(p => p.id === id);
        if (pIndex !== -1) {
            foundUnitIndex = i;
            foundProductIndex = pIndex;
            break;
        }
    }

    if (foundUnitIndex === -1) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Check if moving to another unit
    if (body.businessUnitId && body.businessUnitId !== db.businessUnits[foundUnitIndex].id) {
        // Remove from old unit
        const [product] = db.businessUnits[foundUnitIndex].products.splice(foundProductIndex, 1);

        // Add to new unit
        const newUnitIndex = db.businessUnits.findIndex(u => u.id === body.businessUnitId);
        if (newUnitIndex === -1) {
            return NextResponse.json({ error: 'Target Business Unit not found' }, { status: 404 });
        }

        // Update fields
        const updatedProduct = { ...product, ...body };
        delete updatedProduct.businessUnitId; // Don't store this in product object

        db.businessUnits[newUnitIndex].products.push(updatedProduct);
    } else {
        // Update in place
        const updatedProduct = { ...db.businessUnits[foundUnitIndex].products[foundProductIndex], ...body };
        delete updatedProduct.businessUnitId;
        db.businessUnits[foundUnitIndex].products[foundProductIndex] = updatedProduct;
    }

    await writeDb(db);
    return NextResponse.json({ success: true });
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const id = (await params).id;
    const db = await readDb();

    for (let i = 0; i < db.businessUnits.length; i++) {
        const pIndex = db.businessUnits[i].products.findIndex(p => p.id === id);
        if (pIndex !== -1) {
            db.businessUnits[i].products.splice(pIndex, 1);
            await writeDb(db);
            return NextResponse.json({ success: true });
        }
    }

    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
}
