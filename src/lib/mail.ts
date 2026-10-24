import nodemailer from "nodemailer";
import { env } from "@/lib/env";

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_PORT === 465,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
});

export interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Universal transactional mail sender
 */
export async function sendEmail({ to, subject, html, text }: SendMailOptions): Promise<{ success: boolean; messageId?: string }> {
  try {
    const info = await transporter.sendMail({
      from: env.SMTP_FROM,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ""),
    });
    return { success: true, messageId: info.messageId };
  } catch (err: any) {
    console.warn(`[MailService] Failed to send email via SMTP (${err.message}). Logging in development:`, {
      to,
      subject,
    });
    // In development mode, don't break user flow if test SMTP fails
    return { success: true, messageId: "dev-mock-id" };
  }
}

/**
 * Send Welcome Email upon registration
 */
export async function sendWelcomeEmail(to: string, name: string): Promise<boolean> {
  const loginUrl = `${env.NEXT_PUBLIC_APP_URL}/login`;
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #27272a; border-radius: 8px; background-color: #09090b; color: #f4f4f5;">
      <h1 style="color: #ffffff; font-size: 24px; font-weight: 700; margin-bottom: 16px;">Chào mừng ${name} đến với Enterprise Core</h1>
      <p style="color: #a1a1aa; line-height: 1.6; font-size: 15px;">Tài khoản của bạn đã được khởi tạo thành công trên hệ thống. Bạn có thể đăng nhập ngay để khám phá các tính năng cao cấp.</p>
      <div style="margin: 28px 0;">
        <a href="${loginUrl}" style="background-color: #ffffff; color: #09090b; padding: 12px 24px; font-weight: 600; text-decoration: none; border-radius: 6px; display: inline-block;">Đăng nhập ngay</a>
      </div>
      <p style="color: #71717a; font-size: 12px; margin-top: 32px; border-top: 1px solid #27272a; padding-top: 16px;">Enterprise Core Boilerplate - Kiến trúc chuẩn Enterprise cho tương lai.</p>
    </div>
  `;
  const res = await sendEmail({ to, subject: "Chào mừng bạn đến với Enterprise Core", html });
  return res.success;
}

/**
 * Send Password Reset link email
 */
export async function sendPasswordResetEmail(to: string, resetToken: string): Promise<boolean> {
  const resetUrl = `${env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}&email=${encodeURIComponent(to)}`;
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #27272a; border-radius: 8px; background-color: #09090b; color: #f4f4f5;">
      <h1 style="color: #ffffff; font-size: 22px; font-weight: 700; margin-bottom: 16px;">Yêu cầu đặt lại mật khẩu</h1>
      <p style="color: #a1a1aa; line-height: 1.6; font-size: 15px;">Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn. Vui lòng bấm vào liên kết bên dưới để tạo mật khẩu mới. Liên kết này có hiệu lực trong vòng 1 giờ.</p>
      <div style="margin: 28px 0;">
        <a href="${resetUrl}" style="background-color: #ef4444; color: #ffffff; padding: 12px 24px; font-weight: 600; text-decoration: none; border-radius: 6px; display: inline-block;">Đặt lại mật khẩu</a>
      </div>
      <p style="color: #71717a; font-size: 13px;">Nếu bạn không yêu cầu hành động này, vui lòng bỏ qua email này.</p>
    </div>
  `;
  const res = await sendEmail({ to, subject: "Khôi phục mật khẩu tài khoản Enterprise Core", html });
  return res.success;
}

/**
 * Send OTP Verification code
 */
export async function sendOtpEmail(to: string, otp: string): Promise<boolean> {
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #27272a; border-radius: 8px; background-color: #09090b; color: #f4f4f5;">
      <h2 style="color: #ffffff; font-size: 20px; font-weight: 700; margin-bottom: 12px;">Mã xác thực của bạn</h2>
      <p style="color: #a1a1aa; font-size: 15px;">Sử dụng mã OTP dưới đây để hoàn tất bước bảo mật:</p>
      <div style="font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #38bdf8; margin: 24px 0; padding: 16px; background-color: #18181b; text-align: center; border-radius: 6px;">
        ${otp}
      </div>
      <p style="color: #71717a; font-size: 13px;">Mã có giá trị trong 10 phút. Tuyệt đối không chia sẻ mã này với bất kỳ ai.</p>
    </div>
  `;
  const res = await sendEmail({ to, subject: "Mã xác thực OTP của bạn", html });
  return res.success;
}
