import { NextResponse } from "next/server"
import { sendEmail } from "@/lib/email"
import { fetchEmailSettings } from "@/lib/sheets"
import { createModernEmailTemplate } from "@/lib/email-template"

export async function POST(req: Request) {
    try {
        const { recipients, subject, body } = await req.json() as {
            recipients: { email: string, name: string }[],
            subject: string,
            body: string
        };

        const settings = await fetchEmailSettings();

        // Loop through recipients and send individually to support personalization
        let sentCount = 0;
        for (const recipient of recipients) {
            try {
                // Personalization
                const personalizedSubject = subject.replace(/{name}/g, recipient.name).replace(/{email}/g, recipient.email);
                const personalizedBody = body.replace(/{name}/g, recipient.name).replace(/{email}/g, recipient.email);

                // Create modern HTML email
                const htmlEmail = createModernEmailTemplate({
                    body: personalizedBody,
                    recipientName: recipient.name,
                    senderAddress: settings.senderAddress,
                    senderPhone: settings.senderPhone
                });

                // Plain text fallback (strip HTML tags)
                const plainText = personalizedBody.replace(/<[^>]*>/g, '');

                await sendEmail({
                    to: recipient.email,
                    subject: personalizedSubject,
                    text: plainText,
                    html: htmlEmail
                });
                sentCount++;
            } catch (err) {
                console.error(`Failed to send email to ${recipient.email}:`, err);
            }
        }

        return NextResponse.json({ success: true, sentCount });
    } catch (error) {
        console.error("Error sending manual emails:", error);
        return NextResponse.json({ error: "Failed to send emails" }, { status: 500 });
    }
}
