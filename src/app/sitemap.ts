import { MetadataRoute } from 'next';
import { fetchFromGoogleSheet } from '@/lib/sheets';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const [businessUnits, products] = await Promise.all([
        fetchFromGoogleSheet('businessUnit'),
        fetchFromGoogleSheet('product')
    ]) as [any[], any[]];

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
    const businessUnitRoutes: MetadataRoute.Sitemap = businessUnits.map((unit) => ({
        url: `${baseUrl}/business-units/${unit.id}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
    }));

    // Dynamic Product routes
    const productRoutes: MetadataRoute.Sitemap = products.map((product) => ({
        url: `${baseUrl}/products/${product.id}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.9,
    }));

    return [...staticRoutes, ...businessUnitRoutes, ...productRoutes];
}
