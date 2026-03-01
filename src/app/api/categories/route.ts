
import { NextResponse } from 'next/server';
import { fetchFromGoogleSheet, syncToGoogleSheet } from '@/lib/sheets';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
    try {
        const categories = await fetchFromGoogleSheet('category') as any[];

        // Robust parsing for categories
        const processedCategories = (categories || []).map((c: any) => {
            const parseField = (field: any) => {
                if (typeof field === 'string' && (field.startsWith('[') || field.startsWith('{'))) {
                    try { return JSON.parse(field); } catch (e) { return [field]; }
                }
                return Array.isArray(field) ? field : (field ? [field] : "");
            };

            const buId = parseField(c.businessUnitId);
            const pId = parseField(c.parentId);

            return {
                ...c,
                businessUnitId: Array.isArray(buId) ? buId[0] : buId,
                parentId: Array.isArray(pId) ? pId[0] : pId
            };
        });

        // Sort categories by order
        const sortedCategories = [...processedCategories].sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));
        return NextResponse.json(sortedCategories, {
            headers: {
                'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30'
            }
        });
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

        // Generate a meaningful slug based on the name
        const { generateSlug } = await import('@/lib/slug');
        let baseId = generateSlug(name);
        let finalId = baseId;

        // Ensure uniqueness
        let counter = 1;
        while (categories.some(c => c.id === finalId)) {
            finalId = `${baseId}-${counter++}`;
        }

        // Standardize parentId for comparison (treat null/undefined as "")
        const targetParentId = parentId || "";
        const sameLevelCats = categories.filter(c =>
            c.businessUnitId === businessUnitId &&
            (c.parentId || "") === targetParentId
        );
        const maxOrder = sameLevelCats.reduce((max, c) => Math.max(max, Number(c.order) || 0), -1);

        const newCategory = {
            id: finalId,
            name,
            businessUnitId,
            parentId: targetParentId,
            order: maxOrder + 1
        };

        await syncToGoogleSheet('category', newCategory, 'create');
        return NextResponse.json(newCategory);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
    }
}
