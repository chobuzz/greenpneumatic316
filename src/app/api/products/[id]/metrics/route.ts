import { NextResponse } from 'next/server';
import { fetchFromGoogleSheet, syncToGoogleSheet } from '@/lib/sheets';
import type { Product } from '@/lib/db';

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const id = (await params).id;
        const body = await request.json();
        const { type } = body; // 'view' or 'quoteClick'

        if (type !== 'view' && type !== 'quoteClick') {
            return NextResponse.json({ error: 'Invalid metric type' }, { status: 400 });
        }

        // 구글 시트에서 최신(캐싱 없는) 해당 상품 데이터 가져오기
        const products = await fetchFromGoogleSheet('product', true) as Product[];
        const productIndex = products.findIndex(p => p.id === id);

        if (productIndex === -1) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        const product = products[productIndex];

        // 업데이트 수행
        const updatedProduct = { ...product };

        if (type === 'view') {
            updatedProduct.views = (Number(updatedProduct.views) || 0) + 1;
        } else if (type === 'quoteClick') {
            updatedProduct.quoteClicks = (Number(updatedProduct.quoteClicks) || 0) + 1;
        }

        // 구글 시트 동기화 (업데이트)
        // syncToGoogleSheet 함수는 row 매핑을 위해 ID를 사용합니다.
        const syncResult = await syncToGoogleSheet('product', updatedProduct, 'update');

        if (!syncResult?.success) {
            throw new Error(syncResult?.error || 'Failed to sync with Google Sheet');
        }

        return NextResponse.json({
            success: true,
            message: `Product ${type} metric incremented successfully`,
            views: updatedProduct.views,
            quoteClicks: updatedProduct.quoteClicks
        });

    } catch (error: any) {
        console.error('Error updating product metrics:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
