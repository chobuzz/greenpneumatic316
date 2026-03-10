import { NextResponse } from 'next/server';
import { fetchFromGoogleSheet, syncToGoogleSheet } from '@/lib/sheets';

export async function GET() {
    try {
        const pageViews = await fetchFromGoogleSheet('pageView', true);
        return NextResponse.json(pageViews);
    } catch (error: any) {
        console.error('Error fetching pageviews:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { path } = body;

        if (!path || typeof path !== 'string') {
            return NextResponse.json({ error: 'Valid path is required' }, { status: 400 });
        }

        // 날짜 없이 경로를 그대로 고유 ID로 사용
        const viewId = path;

        // 캐싱 없이 최신 pageView 데이터 가져오기
        const pageViews = await fetchFromGoogleSheet('pageView', true) || [];

        // 동일한 경로의 기록 찾기
        const existingView = pageViews.find((v: any) => v.id === viewId || v.path === path);

        if (existingView) {
            // 기록이 이미 있으면 조회수 +1 업데이트
            const updatedView = {
                id: viewId,
                path,
                views: (Number(existingView.views) || 0) + 1
            };

            const syncResult = await syncToGoogleSheet('pageView', updatedView, 'update');
            if (!syncResult?.success) throw new Error(syncResult?.error || 'Failed to update page view');

            return NextResponse.json({ success: true, mode: 'updated', views: updatedView.views });
        } else {
            // 처음 방문하는 경로일 경우 새로 생성
            const newView = {
                id: viewId,
                path,
                views: 1
            };

            const syncResult = await syncToGoogleSheet('pageView', newView, 'create');
            if (!syncResult?.success) throw new Error(syncResult?.error || 'Failed to create page view');

            return NextResponse.json({ success: true, mode: 'created', views: 1 });
        }

    } catch (error: any) {
        console.error('Error tracking page view:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
