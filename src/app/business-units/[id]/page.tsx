import { Metadata } from "next"
import { redirect } from "next/navigation"
import { fetchFromGoogleSheet } from "@/lib/sheets"

interface Props {
    params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const id = (await params).id
    const units = await fetchFromGoogleSheet('businessUnit') as any[]
    const unit = units.find(u => u.id === id)

    if (!unit) return { title: "사업부를 찾을 수 없습니다" }

    const title = `${unit.name} | 그린뉴메틱`
    const description = unit.description || `그린뉴메틱의 ${unit.name} 솔루션`

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            images: [unit.image || '/favicon.ico'],
        },
    }
}

export default async function BusinessUnitPage({ params }: Props) {
    const id = (await params).id
    // 308 permanent redirect is better for SEO than 307
    redirect(`/business-units?tab=${id}`)
}
