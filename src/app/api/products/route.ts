
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

            const safeParseJSON = (data: any) => {
                if (!data || typeof data !== 'string') return data || [];
                const trimmed = data.trim();
                if (trimmed === "") return [];

                // Only try to parse if it looks like a JSON array or object
                if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
                    try {
                        return JSON.parse(trimmed);
                    } catch (e) {
                        // Log a concise warning instead of a full stack trace for malformed data
                        console.warn(`[API] JSON parsing failed for: ${trimmed.substring(0, 50)}${trimmed.length > 50 ? '...' : ''}`);
                        return [];
                    }
                }

                // If it's a string but doesn't look like JSON, return it as a single-element array (if that's the expectation)
                // or just wrap it in an array to maintain type consistency
                return [trimmed];
            };

            return {
                ...p,
                businessUnitId,
                businessUnitIds,
                categoryIds,
                businessUnitName: unit ? unit.name : 'Unknown',
                images: safeParseJSON(p.images),
                models: safeParseJSON(p.models),
                specImages: safeParseJSON(p.specImages),
                mediaItems: safeParseJSON(p.mediaItems),
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
