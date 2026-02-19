import { NextResponse } from "next/server";
import { readDb } from "@/lib/db";
import { syncToGoogleSheet } from "@/lib/sheets";

export async function GET() {
    try {
        const db = await readDb();

        console.log("🚀 [Migration] 데이터 이전 시작...");

        // 1. 사업분야 (Business Units) - Flattening products since they might be in a separate sheet later
        // For now, let's keep the nested structure if sync can handle it, but Sheets prefer flat rows.
        // We'll flatten them into separate sheets.

        const flatBusinessUnits = db.businessUnits.map(({ products, ...rest }) => rest);

        // Extract ALL products from ALL business units
        const allProducts = db.businessUnits.flatMap(bu =>
            bu.products.map(p => ({
                ...p,
                businessUnitId: bu.id,
                businessUnitIds: JSON.stringify([bu.id]),
                categoryIds: JSON.stringify((p as any).categoryId ? [(p as any).categoryId] : (p.categoryIds || [])),
                // Stringify complex arrays for sheet storage
                images: JSON.stringify(p.images),
                models: JSON.stringify(p.models || []),
                specImages: JSON.stringify(p.specImages || [])
            }))
        );

        // Sync entities
        await syncToGoogleSheet('businessUnit', flatBusinessUnits, 'sync');
        await syncToGoogleSheet('category', db.categories, 'sync');
        await syncToGoogleSheet('product', allProducts, 'sync');
        await syncToGoogleSheet('insight', db.insights, 'sync');
        await syncToGoogleSheet('emailSettings', db.emailSettings, 'sync');

        console.log("✅ [Migration] 모든 데이터 이전 완료!");

        return NextResponse.json({
            success: true,
            migrated: {
                businessUnits: flatBusinessUnits.length,
                categories: db.categories.length,
                products: allProducts.length,
                insights: db.insights.length,
                emailSettings: "Synced"
            },
            message: "스프레드시트 v5.0 배포 후 한 번 더 실행해 주세요."
        });
    } catch (error: any) {
        console.error("❌ [Migration] 실패:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
