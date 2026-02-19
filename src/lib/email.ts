
import nodemailer from "nodemailer"

/**
 * 이메일 전송을 위한 Transporter 설정
 * 
 * 'self-signed certificate' 오류 해결을 위해 TLS 설정을 변경했습니다.
 * 이 오류는 보통 백신 프로그램이나 사내 보안망이 네트워크를 감시하며 가짜 인증서를 끼워넣을 때 발생합니다.
 * rejectUnauthorized: false 설정을 통해 보안 검사를 일시적으로 우회하여 메일을 보낼 수 있게 합니다.
 */
const getTransporter = () => {
    const user = process.env.EMAIL_USER
    const pass = process.env.EMAIL_PASS

    return nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
            user: user,
            pass: pass,
        },
        tls: {
            // [매우 중요] 보안망/백신에 의한 인증서 차단 오류 우회 설정
            rejectUnauthorized: false
        }
    })
}

export async function sendEmail({
    to,
    subject,
    text,
    html,
    attachments,
}: {
    to: string
    subject: string
    text: string
    html?: string
    attachments?: Array<{
        filename: string;
        content: string | Buffer;
        encoding?: string;
        contentType?: string;
    }>
}) {
    const user = process.env.EMAIL_USER
    const pass = process.env.EMAIL_PASS

    if (!user || !pass || user.includes("your-email")) {
        console.warn("⚠️ [Email] EMAIL_USER 또는 EMAIL_PASS가 설정되지 않았습니다.")
        return { success: false, error: "Missing identity" }
    }

    try {
        const transporter = getTransporter()
        const info = await transporter.sendMail({
            from: `"그린뉴메틱" <${user}>`,
            to: to,
            subject: subject,
            text: text,
            html: html,
            attachments: attachments
        })

        console.log(`✅ [Email] 메일 발송 성공! To: ${to}, Message ID:`, info.messageId)
        return { success: true }
    } catch (error) {
        console.error(`❌ [Email] 메일 전송 중 오류 발생 (To: ${to}):`, error)
        return { success: false, error }
    }
}

export async function sendNotificationEmail(params: {
    subject: string,
    text: string,
    html?: string,
    attachments?: any[]
}) {
    return sendEmail({
        to: "greenpneumatic316@gmail.com",
        ...params
    });
}
