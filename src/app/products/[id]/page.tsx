import { Metadata } from "next"
import { notFound } from "next/navigation"
import { readDb } from "@/lib/db"
import { ProductDetailView } from "@/components/product/product-detail-view"
import { JsonLd } from "@/components/seo/json-ld"

interface Props {
    params: Promise<{ id: string }>
}

async function getProductData(id: string) {
    const db = await readDb()
    const allProducts = db.businessUnits.flatMap(bu => bu.products || [])
    const product = allProducts.find(p => p.id === id)

    if (!product) return null

    const targetBUId = product.businessUnitIds?.[0] || (product as any).businessUnitId
    const unit = db.businessUnits.find(u => u.id === targetBUId)

    if (!unit) return null

    return { product, unit }
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
