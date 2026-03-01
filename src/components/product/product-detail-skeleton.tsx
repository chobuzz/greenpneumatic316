
import { Skeleton } from "@/components/ui/skeleton"

export function ProductDetailSkeleton() {
    return (
        <div className="min-h-screen pb-20 pt-10">
            <div className="container px-4 md:px-8">
                {/* Back Button Skeleton */}
                <div className="mb-8">
                    <Skeleton className="h-5 w-40" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
                    {/* Image Gallery Skeleton */}
                    <div className="space-y-6">
                        <Skeleton className="aspect-square w-full rounded-3xl" />
                        <div className="flex items-center gap-3">
                            {[1, 2, 3, 4].map((i) => (
                                <Skeleton key={i} className="w-24 h-24 rounded-2xl" />
                            ))}
                        </div>
                    </div>

                    {/* Product Selection & Actions Skeleton */}
                    <div className="flex flex-col">
                        <div className="mb-6">
                            <Skeleton className="h-5 w-24 rounded-full mb-3" />
                            <Skeleton className="h-10 md:h-12 w-3/4 mb-5" />
                            <div className="bg-slate-50 rounded-2xl border border-slate-100 px-6 py-5">
                                <Skeleton className="h-4 w-20 mb-2" />
                                <Skeleton className="h-4 w-full mb-1" />
                                <Skeleton className="h-4 w-full mb-1" />
                                <Skeleton className="h-4 w-2/3" />
                            </div>
                        </div>

                        {/* Model Selection Skeleton */}
                        <div className="mb-8 space-y-4">
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-14 w-full rounded-2xl" />
                        </div>

                        {/* Options Skeleton */}
                        <div className="mb-8 space-y-4">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-14 w-full rounded-2xl" />
                        </div>

                        {/* Quantity & CTA Skeleton */}
                        <div className="mb-8">
                            <Skeleton className="h-16 w-full rounded-xl mb-6" />
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Skeleton className="h-14 w-full rounded-xl" />
                                <Skeleton className="h-14 w-full rounded-xl" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Detail Section Skeleton */}
                <div className="border-t pt-16">
                    <div className="max-w-4xl mx-auto space-y-12">
                        <div className="flex justify-center mb-10">
                            <Skeleton className="h-8 w-48" />
                        </div>
                        <div className="space-y-6">
                            <Skeleton className="h-[400px] w-full rounded-2xl" />
                            <Skeleton className="h-[600px] w-full rounded-2xl" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
