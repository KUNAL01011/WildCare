export interface VerificationOtpTemplateData {
  code: string;
  expiryMinutes: number;
  appName: string;
}

export function verificationOtpTemplate({
  code,
  expiryMinutes,
  appName,
}: VerificationOtpTemplateData): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />

  <title>Verification Code</title>
</head>

<body style="
  margin: 0;
  padding: 0;
  background-color: #f5f7fb;
  font-family: Arial, Helvetica, sans-serif;
">

  <div style="
    max-width: 600px;
    margin: 40px auto;
    padding: 20px;
  ">

    <div style="
      background: #ffffff;
      border-radius: 12px;
      padding: 40px;
      text-align: center;
      box-shadow: 0 4px 20px rgba(0,0,0,0.05);
    ">

      <h1 style="
        margin: 0 0 20px;
        color: #111827;
        font-size: 26px;
      ">
        Verify your ${appName} account
      </h1>

      <p style="
        color: #6b7280;
        font-size: 16px;
        line-height: 1.6;
      ">
        Use the verification code below to continue.
      </p>

      <div style="
        margin: 30px 0;
        padding: 18px;
        background: #f3f4f6;
        border-radius: 10px;
      ">

        <span style="
          font-size: 32px;
          font-weight: bold;
          letter-spacing: 8px;
          color: #111827;
        ">
          ${code}
        </span>

      </div>

      <p style="
        color: #6b7280;
        font-size: 14px;
      ">
        This code will expire in
        <strong>${expiryMinutes} minutes</strong>.
      </p>

      <p style="
        color: #9ca3af;
        font-size: 13px;
        margin-top: 30px;
      ">
        If you did not request this code, you can safely ignore this email.
      </p>

    </div>

    <p style="
      text-align: center;
      color: #9ca3af;
      font-size: 12px;
      margin-top: 20px;
    ">
      © ${new Date().getFullYear()} ${appName}. All rights reserved.
    </p>

  </div>

</body>
</html>
`;
}
