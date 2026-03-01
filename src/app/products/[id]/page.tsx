import { Metadata } from "next"
import { notFound } from "next/navigation"
import { fetchFromGoogleSheet } from "@/lib/sheets"
import { ProductDetailView } from "@/components/product/product-detail-view"
import { JsonLd } from "@/components/seo/json-ld"

interface Props {
    params: Promise<{ id: string }>
}

async function getProductData(id: string) {
    const [products, units] = await Promise.all([
        fetchFromGoogleSheet('product'),
        fetchFromGoogleSheet('businessUnit')
    ]) as [any[], any[]];

    const product = products.find(p => p.id === id)

    if (!product) return null

    const parseField = (field: any) => {
        if (typeof field === 'string' && (field.startsWith('[') || field.startsWith('{'))) {
            try { return JSON.parse(field); } catch (e) { return [field]; }
        }
        return Array.isArray(field) ? field : (field ? [field] : []);
    };

    const safeParseJSON = (data: any) => {
        if (!data || typeof data !== 'string') return data || [];
        const trimmed = data.trim();
        if (trimmed === "" || (!trimmed.startsWith('[') && !trimmed.startsWith('{'))) {
            return trimmed ? [trimmed] : [];
        }
        try { return JSON.parse(trimmed); } catch (e) { return []; }
    };

    const businessUnitIds = parseField(product.businessUnitIds || product.businessUnitId);
    const targetBUId = businessUnitIds[0] || "";
    const unit = units.find(u => u.id === targetBUId)

    if (!unit) return null

    const enrichedProduct = {
        ...product,
        businessUnitIds,
        categoryIds: parseField(product.categoryIds || product.categoryId),
        images: safeParseJSON(product.images),
        models: safeParseJSON(product.models),
        optionGroups: safeParseJSON(product.optionGroups || product.options),
        specImages: safeParseJSON(product.specImages),
        mediaItems: safeParseJSON(product.mediaItems),
        mediaPosition: product.mediaPosition || 'bottom'
    };

    return { product: enrichedProduct, unit }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const id = (await params).id
    const data = await getProductData(id)

    if (!data) return { title: "상품을 찾을 수 없습니다" }

    const { product, unit } = data
    const title = `${product.name} | ${unit.name} | 그린뉴메틱`
    const description = product.description || `${product.name} 상세 정보 및 견적 안내`
    const ogImage = product.images?.[0] || '/favicon.ico'

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            images: [ogImage],
            type: 'article',
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: [ogImage],
        },
    }
}

export default async function ProductPage({ params }: Props) {
    const id = (await params).id
    const data = await getProductData(id)

    if (!data) {
        notFound()
        return null // unreachable, but satisfies TS
    }

    const { product, unit } = data

    // Structured Data (JSON-LD) for Product
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": product.name,
        "image": product.images,
        "description": product.description,
        "brand": {
            "@type": "Brand",
            "name": "그린뉴메틱"
        },
        "offers": {
            "@type": "Offer",
            "url": `https://greenpneumatic.com/products/${product.id}`,
            "priceCurrency": "KRW",
            "availability": "https://schema.org/InStock",
            "seller": {
                "@type": "Organization",
                "name": "그린뉴메틱"
            }
        }
    }

    return (
        <>
            <JsonLd data={jsonLd} />
            <ProductDetailView product={product} unit={unit} />
        </>
    )
}
