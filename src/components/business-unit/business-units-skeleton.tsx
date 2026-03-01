
import { Skeleton } from "@/components/ui/skeleton"

export function BusinessUnitsPageSkeleton() {
    return (
        <div className="flex flex-col min-h-screen pt-20">
            {/* Tab Navigation Skeleton */}
            <div className="bg-white border-b border-slate-100 sticky top-[68px] z-30">
                <div className="container px-4 md:px-8">
                    <div className="flex items-center justify-center -mb-px overflow-x-auto no-scrollbar py-2">
                        <div className="flex gap-2 p-1 bg-slate-100/50 rounded-2xl">
                            {[1, 2, 3, 4].map((i) => (
                                <Skeleton key={i} className="h-11 w-32 rounded-xl" />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Hero Skeleton */}
            <section className="relative pt-16 pb-10 overflow-hidden bg-slate-50">
                <div className="container relative z-10 px-4 md:px-8">
                    <div className="flex items-center gap-2 mb-6">
                        <Skeleton className="h-3 w-12" />
                        <Skeleton className="h-3 w-3 rounded-full" />
                        <Skeleton className="h-3 w-16" />
                    </div>
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <Skeleton className="h-12 md:h-16 w-64 md:w-96 mb-4" />
                            <Skeleton className="h-1 w-16 rounded-full" />
                        </div>
                        <Skeleton className="h-7 w-24 rounded-full" />
                    </div>
                </div>
            </section>

            {/* Content Skeleton */}
            <section className="py-8 border-t border-slate-100">
                <div className="container px-4 md:px-8">
                    <div className="max-w-6xl mx-auto">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                            <div className="lg:col-span-3">
                                <Skeleton className="aspect-square w-full max-w-[200px] rounded-xl mx-auto lg:ml-0" />
                            </div>
                            <div className="lg:col-span-9">
                                <Skeleton className="h-8 w-32 mb-4" />
                                <Skeleton className="h-20 w-full" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Category Selector & Grid Skeleton */}
            <section className="py-12 bg-slate-50/50 relative border-t border-slate-100/50">
                <div className="container px-4 md:px-8">
                    <div className="py-16">
                        <div className="text-center mb-10">
                            <Skeleton className="h-9 w-48 mx-auto mb-2" />
                            <Skeleton className="h-4 w-64 mx-auto" />
                            <div className="flex items-center justify-center gap-4 mt-6">
                                <Skeleton className="h-5 w-16 rounded-full" />
                                <Skeleton className="h-5 w-16 rounded-full" />
                                <Skeleton className="h-5 w-16 rounded-full" />
                            </div>
                        </div>
                        <div className="mb-8">
                            <Skeleton className="h-16 w-full rounded-2xl mb-4" />
                            <Skeleton className="h-14 w-full rounded-full" />
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                            {[1, 2, 3, 4, 5, 1, 2, 3, 4, 5].map((i, idx) => (
                                <div key={idx} className="bg-white rounded-[1.5rem] p-4 border border-slate-100">
                                    <Skeleton className="aspect-square w-full rounded-xl mb-4" />
                                    <Skeleton className="h-4 w-3/4 mb-2" />
                                    <Skeleton className="h-3 w-1/2" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}
