import { Metadata } from "next"
import ContactClient from "./contact-client"

export const metadata: Metadata = {
    title: "문의하기 | 견적 요청",
    description: "그린뉴메틱에 제품 및 서비스에 대한 궁금한 점을 남겨주세요. 전문 엔지니어가 최적의 솔루션을 제안해 드립니다.",
    openGraph: {
        title: "문의하기 - 그린뉴메틱",
        description: "전문 엔지니어 상담 및 온라인 견적 문의",
    },
}

export default function ContactPage() {
    return <ContactClient />
}
