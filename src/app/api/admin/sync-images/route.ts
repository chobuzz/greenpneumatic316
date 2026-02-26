
import { NextResponse } from 'next/server';
import { fetchFromGoogleSheet, syncToGoogleSheet } from '@/lib/sheets';
import { downloadExternalImage } from '@/lib/image-sync';

export async function POST() {
    try {
        console.log('🚀 [SyncImages] Starting full image backup sync...');

        // 1. 모든 상품 데이터 가져오기
        const products = await fetchFromGoogleSheet('product') as any[];
        console.log(`[SyncImages] Found ${products.length} products to check.`);

        let updatedCount = 0;
        let imageCount = 0;
        const syncCache = new Map<string, string>(); // 중복 다운로드 방지용 캐시

        const processImageArray = async (raw: any) => {
            let list: string[] = [];
            try {
                if (typeof raw === 'string') list = JSON.parse(raw || '[]');
                else if (Array.isArray(raw)) list = raw;
            } catch (e) { return { list: [], changed: false }; }

            let changed = false;
            const newList: string[] = [];
            for (const imgUrl of list) {
                if (typeof imgUrl === 'string' && imgUrl.startsWith('http')) {
                    const localPath = await downloadExternalImage(imgUrl, syncCache);
                    if (localPath) {
                        newList.push(localPath);
                        changed = true;
                        imageCount++;
                    } else newList.push(imgUrl);
                } else newList.push(imgUrl);
            }
            return { list: newList, changed };
        };

        const processMediaItems = async (raw: any) => {
            let list: any[] = [];
            try {
                if (typeof raw === 'string') list = JSON.parse(raw || '[]');
                else if (Array.isArray(raw)) list = raw;
            } catch (e) { return { list: [], changed: false }; }

            let changed = false;
            const newList: any[] = [];
            for (const item of list) {
                if (item?.type === 'image' && typeof item.url === 'string' && item.url.startsWith('http')) {
                    const localPath = await downloadExternalImage(item.url, syncCache);
                    if (localPath) {
                        newList.push({ ...item, url: localPath });
                        changed = true;
                        imageCount++;
                    } else newList.push(item);
                } else {
                    newList.push(item);
                }
            }
            return { list: newList, changed };
        };

        // 2. 상품 이미지 백업 (대표, 상세사양, 미디어)
        for (const product of products) {
            // 대표 이미지
            const mainImgs = await processImageArray(product.images);
            // 상세 사양 이미지
            const specImgs = await processImageArray(product.specImages);
            // 미디어 아이템 이미지
            const mediaItems = await processMediaItems(product.mediaItems);

            if (mainImgs.changed || specImgs.changed || mediaItems.changed) {
                const updatedProduct = {
                    ...product,
                    images: JSON.stringify(mainImgs.list),
                    specImages: JSON.stringify(specImgs.list),
                    mediaItems: JSON.stringify(mediaItems.list)
                };
                await syncToGoogleSheet('product', updatedProduct, 'update');
                updatedCount++;
            }
        }

        // 3. 카테고리/사업부/인사이트 이미지 백업
        const otherTypes: ('category' | 'businessUnit' | 'insight')[] = ['category', 'businessUnit', 'insight'];
        for (const type of otherTypes) {
            const items = await fetchFromGoogleSheet(type) as any[];
            for (const item of items) {
                let changed = false;
                const newItem = { ...item };

                // 체크할 필드들
                const fields = ['image', 'bannerImage'];
                for (const field of fields) {
                    const url = item[field];
                    if (typeof url === 'string' && url.startsWith('http')) {
                        const localPath = await downloadExternalImage(url, syncCache);
                        if (localPath) {
                            newItem[field] = localPath;
                            changed = true;
                            imageCount++;
                        }
                    }
                }

                if (changed) {
                    await syncToGoogleSheet(type, newItem, 'update');
                    updatedCount++;
                }
            }
        }

        return NextResponse.json({
            success: true,
            message: `백업 완료: 총 ${imageCount}개의 이미지를 저장하고 ${updatedCount}개의 항목을 업데이트했습니다.`,
            updatedCount,
            totalImages: imageCount
        });

    } catch (error: any) {
        console.error('❌ [SyncImages] Sync failed:', error);
        return NextResponse.json({
            success: false,
            error: error?.message || 'Unknown error during sync'
        }, { status: 500 });
    }
}
