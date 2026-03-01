import { MetadataRoute } from 'next';
import { readDb } from '@/lib/db';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const db = await readDb();
    const baseUrl = 'https://greenpneumatic.com';

    // Static routes
    const staticRoutes: MetadataRoute.Sitemap = [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
        {
            url: `${baseUrl}/contact`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.5,
        },
        {
            url: `${baseUrl}/insights`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.7,
        },
    ];

    // Dynamic Business Unit routes
    const businessUnitRoutes: MetadataRoute.Sitemap = db.businessUnits.map((unit) => ({
        url: `${baseUrl}/business-units/${unit.id}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
    }));

    // Dynamic Product routes
    // products are nested in business units in the DB structure, but accessed via /products/[id]
    // Let's gather all unique products from all BUs
    const allProducts = db.businessUnits.flatMap(bu => bu.products || []);
    const productRoutes: MetadataRoute.Sitemap = allProducts.map((product) => ({
        url: `${baseUrl}/products/${product.id}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.9,
    }));

    return [...staticRoutes, ...businessUnitRoutes, ...productRoutes];
}
