import nodemailer from 'nodemailer';

function getTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailOptions) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('⚠️ SMTP not configured — email not sent to', to);
    return { success: false, error: 'SMTP not configured' };
  }

  try {
    const transporter = getTransporter();
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || `Teens Aloud Foundation <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });
    console.log('✉️ Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error('✉️ Email send error:', error.message, error.code);
    return { success: false, error: error.message || 'Unknown email error' };
  }
}

export function buildEmailHtml(subject: string, body: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin:0; padding:0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background:#f0f9fc;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f9fc; padding:40px 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,0.08);">
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #00A0DC, #006090); padding:30px; text-align:center;">
                  <h1 style="color:#ffffff; margin:0; font-size:22px;">Teens Aloud Foundation</h1>
                  <p style="color:rgba(255,255,255,0.8); margin:5px 0 0; font-size:13px;">Eternal interest in teens everywhere</p>
                </td>
              </tr>
              <!-- Body -->
              <tr>
                <td style="padding:30px;">
                  <h2 style="color:#1e293b; font-size:18px; margin:0 0 15px;">${subject}</h2>
                  <div style="color:#475569; font-size:15px; line-height:1.7;">
                    ${body.replace(/\n/g, '<br>')}
                  </div>
                </td>
              </tr>
              <!-- Footer -->
              <tr>
                <td style="background:#f8fafc; padding:20px 30px; text-align:center; border-top:1px solid #e2e8f0;">
                  <p style="color:#94a3b8; font-size:12px; margin:0;">
                    This email was sent by Teens Aloud Foundation.<br>
                    <a href="https://teensaloud.com" style="color:#00A0DC;">Visit our website</a>
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}
