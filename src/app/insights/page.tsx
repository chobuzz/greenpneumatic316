import { Metadata } from "next"
import InsightsClient from "./insights-client"

export const metadata: Metadata = {
    title: "인사이트 | 지식 및 뉴스",
    description: "그린뉴메틱의 최신 산업 기술 정보, 장비 유지보수 팁, 그리고 새로운 소식을 확인해보세요.",
    openGraph: {
        title: "인사이트 - 그린뉴메틱",
        description: "산업 기술 지식 및 최신 뉴스",
    },
}

export default function InsightsPage() {
    return <InsightsClient />
}
