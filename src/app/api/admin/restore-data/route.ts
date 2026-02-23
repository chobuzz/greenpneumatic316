
import { NextResponse } from 'next/server';
import { syncToGoogleSheet } from '@/lib/sheets';
import { generateSlug } from '@/lib/slug';
import fs from 'fs/promises';
import path from 'path';

export async function POST() {
    try {
        console.log("🛠️ 긴급 데이터 복구 및 마이그레이션 시작...");

        // 1. 로컬 db.json 읽기
        const dbPath = path.join(process.cwd(), 'src/data/db.json');
        const dbData = JSON.parse(await fs.readFile(dbPath, 'utf-8'));

        const rawCategories = dbData.categories || [];
        const units = dbData.businessUnits || [];

        // 모든 상품 추출
        const rawProducts: any[] = [];
        units.forEach((unit: any) => {
            if (unit.products) {
                unit.products.forEach((p: any) => {
                    // 상품이 속한 사업부 ID를 명시적으로 추가 (기존 데이터 구조 대응)
                    if (!p.businessUnitIds) p.businessUnitIds = [unit.id];
                    rawProducts.push(p);
                });
            }
        });

        console.log(`📂 백업 데이터 로드 완료: 카테고리 ${rawCategories.length}개, 상품 ${rawProducts.length}개`);

        // 2. 카테고리 ID 맵 생성 (oldId -> newSlug)
        const categoryMap: Record<string, string> = {};
        const usedCatIds = new Set<string>();

        const migratedCategories = rawCategories.map((cat: any) => {
            let baseId = generateSlug(cat.name);
            let newId = baseId;
            let counter = 1;
            while (usedCatIds.has(newId)) {
                newId = `${baseId}-${counter++}`;
            }
            usedCatIds.add(newId);
            categoryMap[cat.id] = newId;
            return { ...cat, oldId: cat.id, id: newId };
        });

        // 3. 카테고리 부모 참조 업데이트
        migratedCategories.forEach((cat: any) => {
            if (cat.parentId && categoryMap[cat.parentId]) {
                cat.parentId = categoryMap[cat.parentId];
            } else if (cat.parentId && !categoryMap[cat.parentId]) {
                // 부모 ID가 맵에 없으면 (이미 옮겨졌거나 잘못된 경우) 그대로 두거나 빈값
                // 여기서는 db.json 기반이므로 맵에 반드시 있어야 함
            }
        });

        // 4. 상품 ID 맵 생성 및 참조 업데이트
        const usedProdIds = new Set<string>();
        const migratedProducts = rawProducts.map((prod: any) => {
            let baseId = generateSlug(prod.name);
            let newId = baseId;
            let counter = 1;
            while (usedProdIds.has(newId)) {
                newId = `${baseId}-${counter++}`;
            }
            usedProdIds.add(newId);

            // 카테고리 참조 업데이트
            const parseIds = (val: any) => {
                if (!val) return [];
                if (typeof val === 'string' && (val.startsWith('[') || val.startsWith('{'))) {
                    try { return JSON.parse(val); } catch (e) { return [val]; }
                }
                return Array.isArray(val) ? val : [val];
            };

            const oldCatIds = parseIds(prod.categoryIds || prod.categoryId);
            const newCatIds = oldCatIds.map((id: string) => categoryMap[id] || id);

            return {
                ...prod,
                id: newId,
                categoryId: JSON.stringify(newCatIds),
                categoryIds: JSON.stringify(newCatIds),
                businessUnitId: JSON.stringify(prod.businessUnitIds || []),
                businessUnitIds: JSON.stringify(prod.businessUnitIds || []),
                images: JSON.stringify(prod.images || []),
                models: JSON.stringify(prod.models || []),
                specImages: JSON.stringify(prod.specImages || []),
                mediaItems: JSON.stringify(prod.mediaItems || [])
            };
        });

        console.log("💾 스프레드시트 동기화 중...");

        // 5. 스프레드시트 업데이트 (전체 덮어쓰기)
        const catResult = await syncToGoogleSheet('category', migratedCategories.map(({ oldId, ...rest }: { oldId: string, [key: string]: any }) => rest), 'sync');
        const prodResult = await syncToGoogleSheet('product', migratedProducts, 'sync');

        if (!catResult.success || !prodResult.success) {
            throw new Error(`동기화 실패: Cat(${catResult.error}), Prod(${prodResult.error})`);
        }

        return NextResponse.json({
            success: true,
            message: "데이터 복구 및 ID 마이그레이션이 완료되었습니다.",
            stats: {
                categories: migratedCategories.length,
                products: migratedProducts.length
            }
        });

    } catch (error: any) {
        console.error("❌ 복구 오류:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
