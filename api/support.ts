//api/support.ts
declare const process: {
  env: Record<string, string | undefined>;
};

type SupportBody = {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
  turnstileToken?: string;
  website?: string;
};

function readBody(rawBody: unknown): SupportBody {
  if (!rawBody) return {};
  if (typeof rawBody === "string") {
    try {
      return JSON.parse(rawBody) as SupportBody;
    } catch {
      return {};
    }
  }
  if (typeof rawBody === "object") {
    return rawBody as SupportBody;
  }
  return {};
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, message: "Method not allowed." });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL;
  const supportEmail = process.env.SUPPORT_EMAIL || "support@syntaxshot.dev";

  if (!apiKey || !fromEmail) {
    return res.status(500).json({
      ok: false,
      message:
        "Missing Resend configuration: RESEND_API_KEY or RESEND_FROM_EMAIL.",
    });
  }

  const body = readBody(req.body);

  const turnstileToken = body.turnstileToken;
  const website = (body.website || "").trim();

  if (website) {
    return res.status(400).json({
      ok: false,
      message: "Spam detected.",
    });
  }

  const name = (body.name || "").trim();
  const email = (body.email || "").trim();
  const subject = (body.subject || "").trim();
  const message = (body.message || "").trim();

  if (!email || !subject || !message) {
    return res.status(400).json({
      ok: false,
      message: "Email, subject and message are required.",
    });
  }

  const plainText = [
    `Name: ${name || "-"}`,
    `Email: ${email}`,
    "",
    message,
  ].join("\n");

  const verify = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        secret: process.env.TURNSTILE_SECRET_KEY!,
        response: turnstileToken ?? "",
      }),
    },
  );

  const result = await verify.json();

  if (!result.success) {
    return res.status(403).json({
      ok: false,
      message: "Turnstile verification failed.",
    });
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: fromEmail,
      to: supportEmail,
      subject: `[Support] ${subject}`,
      reply_to: email,
      text: plainText,
      html: `
        <div style="font-family: Inter, Arial, sans-serif; line-height: 1.6; color: #111;">
          <p><strong>Name:</strong> ${escapeHtml(name || "-")}</p>
          <p><strong>Email:</strong> ${escapeHtml(email)}</p>
          <p><strong>Subject:</strong> ${escapeHtml(subject)}</p>
          <hr />
          <p>${escapeHtml(message).replace(/\n/g, "<br />")}</p>
        </div>
      `,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "Unknown Resend error");
    console.error("Resend request failed:", errorText);
    return res.status(502).json({
      ok: false,
      message: `Resend request failed: ${errorText}`,
    });
  }

  return res.status(200).json({
    ok: true,
    message: `Message sent to ${supportEmail}.`,
  });
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
