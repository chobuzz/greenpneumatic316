import { redirect } from "next/navigation"

export default async function BusinessUnitPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const id = (await params).id
    redirect(`/business-units?tab=${id}`)
}
