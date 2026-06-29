import nodemailer from 'nodemailer';

const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
const smtpPort = Number(process.env.SMTP_PORT || 465);
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;
const smtpFrom = process.env.SMTP_FROM || `IPL Store <${smtpUser}>`;

if (!smtpUser || !smtpPass) {
  console.warn('SMTP credentials are not configured. Email sending will be skipped.');
}

const transporter =
  smtpUser && smtpPass
    ? nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      })
    : null;

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailOptions) {
  if (!transporter) {
    console.warn('No SMTP transporter configured. Skipping email send.');
    return;
  }

  await transporter.sendMail({
    from: smtpFrom,
    to,
    subject,
    html,
  });
}

interface SendBulkEmailOptions {
  bcc: string[];
  subject: string;
  html: string;
}

export async function sendBulkEmail({ bcc, subject, html }: SendBulkEmailOptions) {
  if (!transporter) {
    console.warn('No SMTP transporter configured. Skipping bulk email send.');
    return;
  }

  // Send in batches of 50 to avoid SMTP limits
  const BATCH_SIZE = 50;
  for (let i = 0; i < bcc.length; i += BATCH_SIZE) {
    const batch = bcc.slice(i, i + BATCH_SIZE);
    try {
      await transporter.sendMail({
        from: smtpFrom,
        bcc: batch,
        subject,
        html,
      });
      console.log(`Sent bulk email batch ${i / BATCH_SIZE + 1}`);
    } catch (error) {
      console.error(`Failed to send bulk email batch ${i / BATCH_SIZE + 1}:`, error);
    }
  }
}

export function buildPromoEmail(title: string, message: string, callToActionUrl?: string, callToActionText?: string) {
  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; max-w-2xl mx-auto p-4">
      <h2 style="color: #6B21A8; text-transform: uppercase;">${title}</h2>
      <p style="font-size: 16px; color: #333;">${message}</p>
      ${
        callToActionUrl && callToActionText
          ? `
        <div style="margin-top: 30px;">
          <a href="${callToActionUrl}" style="background-color: #9333EA; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">
            ${callToActionText}
          </a>
        </div>
      `
          : ''
      }
      <hr style="margin-top: 40px; border: none; border-top: 1px solid #eee;" />
      <p style="font-size: 12px; color: #999;">
        You are receiving this email because you are a registered user of Step & Style.
      </p>
    </div>
  `;
}
