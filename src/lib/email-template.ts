export function createModernEmailTemplate({
    body,
    recipientName,
    senderAddress,
    senderPhone,
}: {
    body: string
    recipientName?: string
    senderAddress?: string
    senderPhone?: string
}): string {
    // 본문에서 {name} 변수 치환
    let processedBody = body.replace(/\{name\}/g, recipientName || '고객')

    // 상대 경로 이미지 URL을 절대 경로로 변환 및 인라인 스타일 주입
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://greenpneumatic.com'

    // 이미지 태그 스타일 보정 (둥근 모서리, 그림자)
    processedBody = processedBody.replace(
        /<img([^>]*)src="([^"]*)"([^>]*)>/gi,
        (match, p1, p2, p3) => {
            let src = p2;
            if (src.startsWith('/uploads/')) {
                src = `${siteUrl}${src}`;
            }
            return `<img${p1}src="${src}"${p3} style="max-width: 100%; height: auto; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); margin: 16px 0; display: block;">`;
        }
    )

    return `
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>그린뉴메틱</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: 'Apple SD Gothic Neo', 'Malgun Gothic', '맑은 고딕', sans-serif; -webkit-font-smoothing: antialiased;">
    <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f1f5f9;">
        <tr>
            <td align="center" style="padding: 40px 10px;">
                <!-- Main Wrapper -->
                <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.05);">
                    
                    <!-- Header with refined gradient -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #059669 0%, #10b981 100%); padding: 50px 40px; text-align: center;">
                            <div style="background-color: rgba(255,255,255,0.15); display: inline-block; padding: 8px 16px; border-radius: 100px; margin-bottom: 20px;">
                                <span style="color: #ffffff; font-size: 11px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase;">Green Pneumatic Solution</span>
                            </div>
                            <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 900; letter-spacing: -1px; line-height: 1.2;">
                                그린뉴메틱
                            </h1>
                            <p style="margin: 10px 0 0 0; color: rgba(255, 255, 255, 0.85); font-size: 15px; font-weight: 500;">
                                혁신적인 유체 제어 및 안전 시스템의 파트너
                            </p>
                        </td>
                    </tr>

                    <!-- Body Content -->
                    <tr>
                        <td style="padding: 50px 40px; background-color: #ffffff;">
                            <div style="color: #1e293b; font-size: 17px; line-height: 1.8; font-weight: 400; letter-spacing: -0.2px;">
                                ${processedBody}
                            </div>
                        </td>
                    </tr>

                    <!-- Call to Action -->
                    <tr>
                        <td style="padding: 0 40px 50px 40px; text-align: center;">
                            <a href="https://greenpneumatic.com" style="background-color: #059669; color: #ffffff; padding: 18px 36px; border-radius: 14px; text-decoration: none; font-weight: 800; font-size: 16px; display: inline-block; shadow: 0 10px 20px rgba(5,150,105,0.2);">
                                공식 웹사이트 방문하기
                            </a>
                        </td>
                    </tr>

                    <!-- Footer Section -->
                    <tr>
                        <td style="padding: 40px; background-color: #f8fafc; border-top: 1px solid #f1f5f9;">
                            <table role="presentation" style="width: 100%;">
                                <tr>
                                    <td style="text-align: left; padding-bottom: 24px;">
                                        <p style="margin: 0; color: #0f172a; font-size: 15px; font-weight: 800; letter-spacing: 0.5px;">
                                            그린뉴메틱 <span style="color: #10b981;">GREEN PNEUMATIC</span>
                                        </p>
                                        <p style="margin: 6px 0 0 0; color: #64748b; font-size: 13px; font-weight: 500;">
                                            주식회사 그린뉴메틱
                                        </p>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 20px 0; border-top: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0;">
                                        <table role="presentation" style="width: 100%;">
                                            <tr>
                                                <td style="color: #94a3b8; font-size: 12px; line-height: 2;">
                                                    <strong style="color: #64748b;">주소:</strong> ${senderAddress || '경기도 양평군 다래길 27'}<br>
                                                    <strong style="color: #64748b;">연락처:</strong> ${senderPhone || '010-7392-9809'}<br>
                                                    <strong style="color: #64748b;">이메일:</strong> greenpneumatic316@gmail.com
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding-top: 30px; text-align: center;">
                                        <p style="margin: 0; color: #94a3b8; font-size: 11px; line-height: 1.6;">
                                            본 메일은 정보통신망법 등 관련 규정에 의거하여 <br>
                                            수신 동의를 하신 고객님께 발송되었습니다.
                                        </p>
                                        <div style="margin-top: 20px;">
                                            <a href="https://greenpneumatic.com/unsubscribe" style="color: #64748b; text-decoration: underline; font-size: 11px; font-weight: 600;">
                                                수신거부 (Unsubscribe)
                                            </a>
                                        </div>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                </table>
                
                <!-- Extra padding for the floor -->
                <div style="height: 40px;"></div>
            </td>
        </tr>
    </table>
</body>
</html>
    `.trim()
}
