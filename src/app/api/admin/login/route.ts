
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { password } = await request.json();
        const adminPassword = process.env.ADMIN_PASSWORD;

        if (!adminPassword) {
            console.error("ADMIN_PASSWORD is not set in environment variables");
            return NextResponse.json({ error: '서버 설정 오류가 발생했습니다.' }, { status: 500 });
        }

        if (password === adminPassword) {
            const response = NextResponse.json({ success: true });

            // 보안을 강화한 쿠키 설정
            response.cookies.set('admin_session', 'true', {
                path: '/',
                httpOnly: false, // 미들웨어에서 접근해야 하므로 false 유지 (더 높은 보안을 위해서는 JWT/Secure 쿠키 권장되나 현재 구조 유지)
                maxAge: 60 * 60 * 24, // 1일
                sameSite: 'lax',
                secure: process.env.NODE_ENV === 'production'
            });

            return response;
        } else {
            return NextResponse.json({ error: '비밀번호가 올바르지 않습니다.' }, { status: 401 });
        }
    } catch (error) {
        return NextResponse.json({ error: '로그인 도중 오류가 발생했습니다.' }, { status: 500 });
    }
}
