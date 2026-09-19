export function verificationEmailTemplate(otp: string): {
  subject: string;
  html: string;
} {
  return {
    subject: "Verify your TransitOps account",
    html: `
      <!DOCTYPE html>
      <html lang="en">
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                     max-width: 480px; margin: 40px auto; color: #1a1a1a; padding: 0 16px;">
          <h2 style="margin-bottom: 8px;">Verify your email</h2>
          <p style="color: #555; margin-bottom: 24px; line-height: 1.6;">
            Enter the code below to confirm your email address.
            It expires in <strong>10 minutes</strong>.
          </p>
          <div style="
            background: #f5f5f5;
            border-radius: 8px;
            padding: 24px;
            text-align: center;
            font-size: 36px;
            font-weight: 700;
            letter-spacing: 10px;
            color: #111;
            font-variant-numeric: tabular-nums;
          ">
            ${otp}
          </div>
          <p style="color: #999; font-size: 13px; margin-top: 24px;">
            If you didn't request this, you can safely ignore this email.
          </p>
        </body>
      </html>
    `,
  };
}