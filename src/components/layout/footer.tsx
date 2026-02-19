
import Link from "next/link"

export function Footer() {
    return (
        <footer className="bg-primary text-primary-foreground py-12">
            <div className="container grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                    <h3 className="text-xl font-bold mb-4">Green Pneumatic</h3>
                    <p className="text-sm opacity-80">
                        산업 기술의 새로운 기준 (Industry High-Tech Standards)
                        <br />
                        실험장비, 콤프레샤, 진공 및 유체시스템 전문 기업
                    </p>
                </div>

                <div>
                    <h4 className="font-semibold mb-4">고객센터</h4>
                    <ul className="space-y-2 text-sm opacity-80">
                        <li>전화: 010-7392-9809</li>
                        <li>이메일: greenpneumatic316@gmail.com</li>
                        <li>주소: 경기도 양평군 다래길 27</li>
                    </ul>
                </div>

                <div>
                    <h4 className="font-semibold mb-4">바로가기</h4>
                    <div className="flex flex-col space-y-2 text-sm opacity-80">
                        <Link href="/business-units/green-science" className="hover:underline">그린 사이언스</Link>
                        <Link href="/business-units/power-air" className="hover:underline">파워에어 콤프레셔</Link>
                        <Link href="/business-units/vacuum-to-zero" className="hover:underline">베큠투제로</Link>
                        <Link href="/business-units/tank-nara" className="hover:underline">탱크나라</Link>
                    </div>
                </div>
            </div>
            <div className="container mt-8 pt-8 border-t border-primary-foreground/20 text-center text-sm opacity-60">
                &copy; {new Date().getFullYear()} Green Pneumatic. All rights reserved.
            </div>
        </footer>
    )
}
