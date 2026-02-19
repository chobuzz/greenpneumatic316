
import { NextResponse } from 'next/server';
import { readDb, writeDb, type BusinessUnit } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
    const db = await readDb();
    return NextResponse.json(db.businessUnits);
}

export async function POST(request: Request) {
    const body = await request.json();
    const db = await readDb();

    const newUnit: BusinessUnit = {
        id: uuidv4(),
        name: body.name,
        description: body.description,
        image: body.image || "/placeholder.png",
        color: body.color || "bg-gray-500",
        products: []
    };

    db.businessUnits.push(newUnit);
    await writeDb(db);

    return NextResponse.json(newUnit);
}
