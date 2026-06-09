"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export const sendPasswordResetEmail = action({
  args: { to: v.string(), code: v.string() },
  handler: async (_ctx, { to, code }) => {
    await transporter.sendMail({
      from: `"DrugScan" <${process.env.GMAIL_USER}>`,
      to,
      subject: "Your DrugScan password reset code",
      html: `
        <!DOCTYPE html>
        <html>
          <body style="margin:0;padding:0;background:#f0f4f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4f8;padding:40px 16px;">
              <tr>
                <td align="center">
                  <table width="100%" style="max-width:480px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

                    <!-- Header -->
                    <tr>
                      <td style="background:#1a56db;padding:32px;text-align:center;">
                        <p style="margin:0;font-size:22px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">💊 DrugScan</p>
                        <p style="margin:8px 0 0;font-size:13px;color:rgba(255,255,255,0.75);">Password Reset Request</p>
                      </td>
                    </tr>

                    <!-- Body -->
                    <tr>
                      <td style="padding:36px 32px 24px;">
                        <h2 style="margin:0 0 12px;font-size:20px;font-weight:700;color:#111827;">Reset your password</h2>
                        <p style="margin:0 0 24px;font-size:15px;color:#6b7280;line-height:1.6;">
                          Use the code below to reset your DrugScan password. This code expires in <strong style="color:#111827;">1 hour</strong>.
                        </p>

                        <!-- Code box -->
                        <div style="background:#f8fafc;border:1.5px solid #e2e8f0;border-radius:12px;padding:20px 24px;margin-bottom:24px;text-align:center;">
                          <p style="margin:0 0 6px;font-size:11px;font-weight:600;color:#9ca3af;letter-spacing:1px;text-transform:uppercase;">Your reset code</p>
                          <p style="margin:0;font-size:15px;font-weight:600;color:#1a56db;font-family:'Courier New',Courier,monospace;word-break:break-all;letter-spacing:1px;line-height:1.6;">${code}</p>
                        </div>

                        <p style="margin:0;font-size:13px;color:#9ca3af;line-height:1.6;">
                          Copy this code and paste it into the reset screen in the app. If you didn't request a password reset, you can safely ignore this email.
                        </p>
                      </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                      <td style="padding:20px 32px 32px;border-top:1px solid #f1f5f9;">
                        <p style="margin:0;font-size:12px;color:#cbd5e1;text-align:center;">© 2026 DrugScan · You're receiving this because a reset was requested for your account.</p>
                      </td>
                    </tr>

                  </table>
                </td>
              </tr>
            </table>
          </body>
        </html>
      `,
    });
  },
});
