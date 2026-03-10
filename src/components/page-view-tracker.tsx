"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function PageViewTracker() {
    const pathname = usePathname();

    useEffect(() => {
        if (!pathname) return;

        // /admin 경로는 추적하지 않음
        if (pathname.startsWith('/admin')) return;

        // 방문 기록 남기기 (에러가 나도 사용자 경험 방해 않도록 catch)
        fetch('/api/pageviews', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ path: pathname }),
        }).catch(err => console.error('Failed to log page view:', err));

    }, [pathname]);

    return null; // 화면에 아무것도 그리지 않는 Background 역할 컴포넌트
}
