// email clients ignore stylesheets and css variables, so colors are inlined by hand
const colors = {
  background: "#f8f5ef",
  foreground: "#1d1a16",
  muted: "#6f675d",
  line: "#e3dcd0",
  surface: "#fffdf8",
  accent: "#b3361b",
};

const serif = "'Instrument Serif', Georgia, 'Times New Roman', serif";
const sans = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif";
const mono = "'SFMono-Regular', Menlo, Consolas, 'Courier New', monospace";

export function otpEmail(otp: string, ttlMinutes: number) {
  const digits = otp
    .split("")
    .map(
      (digit) => `
                <td style="padding:0 4px;">
                    <div style="width:44px;height:56px;line-height:56px;border:1px solid ${colors.line};border-radius:10px;background:${colors.background};font-family:${mono};font-size:26px;font-weight:600;color:${colors.foreground};text-align:center;">${digit}</div>
                </td>`,
    )
    .join("");

  const html = `<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="color-scheme" content="light">
    <meta name="supported-color-schemes" content="light">
    <title>Your PridictX verification code</title>
</head>
<body style="margin:0;padding:0;background:${colors.background};">
    <!-- preview text shown next to the subject in the inbox -->
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">
        Your code is ${otp}. It expires in ${ttlMinutes} minutes.
    </div>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${colors.background};">
        <tr>
            <td align="center" style="padding:48px 16px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;">
                    <tr>
                        <td align="center" style="padding-bottom:28px;font-family:${serif};font-size:30px;color:${colors.foreground};letter-spacing:-0.5px;">
                            PridictX<span style="color:${colors.accent};">.</span>
                        </td>
                    </tr>

                    <tr>
                        <td style="background:${colors.surface};border:1px solid ${colors.line};border-radius:16px;padding:40px 32px;text-align:center;">
                            <div style="display:inline-block;border:1px solid ${colors.line};border-radius:999px;padding:4px 12px;font-family:${sans};font-size:12px;color:${colors.muted};">
                                <span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:${colors.accent};vertical-align:middle;margin-right:6px;"></span>Verification code
                            </div>

                            <h1 style="margin:24px 0 0;font-family:${serif};font-size:34px;font-weight:400;line-height:1.15;color:${colors.foreground};">
                                One small step to <em style="color:${colors.accent};">start predicting</em>
                            </h1>

                            <p style="margin:14px 0 0;font-family:${sans};font-size:15px;line-height:1.6;color:${colors.muted};">
                                Enter this code on PridictX to confirm it's really you.
                            </p>

                            <table role="presentation" cellpadding="0" cellspacing="0" align="center" style="margin:32px auto 0;">
                                <tr>${digits}
                                </tr>
                            </table>

                            <p style="margin:28px 0 0;font-family:${sans};font-size:13px;color:${colors.muted};">
                                This code expires in <strong style="color:${colors.foreground};">${ttlMinutes} minutes</strong>.
                            </p>
                        </td>
                    </tr>

                    <tr>
                        <td style="padding:24px 8px 0;text-align:center;font-family:${sans};font-size:12px;line-height:1.6;color:${colors.muted};">
                            Didn't ask for this? You can safely ignore this email.<br>
                            Nobody can get into your account without the code.
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:20px 8px 0;text-align:center;font-family:${serif};font-size:15px;font-style:italic;color:${colors.muted};">
                            Predict what happens next.
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;

  const text = [
    "PridictX.",
    "",
    `Your verification code is ${otp}.`,
    `It expires in ${ttlMinutes} minutes.`,
    "",
    "Didn't ask for this? You can safely ignore this email.",
  ].join("\n");

  return { subject: `${otp} is your PridictX verification code`, html, text };
}
