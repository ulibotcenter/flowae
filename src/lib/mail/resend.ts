/**
 * Lightweight Resend client via fetch (no extra package).
 * Without RESEND_API_KEY → simulated mode for demos.
 */

export type MailPayload = {
  to: string;
  subject: string;
  text: string;
  replyTo?: string;
};

export type MailSendOutcome =
  | { mode: "resend"; id: string }
  | { mode: "simulated"; reason: string };

function env(key: string): string | undefined {
  if (typeof process === "undefined") return undefined;
  const v = process.env[key]?.trim();
  return v || undefined;
}

export function getResendApiKey(): string | undefined {
  return env("RESEND_API_KEY");
}

export function getMailFrom(): string {
  return (
    env("RESEND_FROM_EMAIL") ||
    env("EMAIL_FROM") ||
    "FacturaFlow <onboarding@resend.dev>"
  );
}

export function isRealMailConfigured(): boolean {
  return Boolean(getResendApiKey());
}

export function getMailProviderStatus(): {
  mode: "resend" | "simulated";
  from: string;
  configured: boolean;
} {
  const configured = isRealMailConfigured();
  return {
    mode: configured ? "resend" : "simulated",
    from: getMailFrom(),
    configured,
  };
}

/**
 * Send email via Resend HTTP API, or return simulated when no API key.
 */
export async function sendMail(payload: MailPayload): Promise<MailSendOutcome> {
  const apiKey = getResendApiKey();
  if (!apiKey) {
    return {
      mode: "simulated",
      reason:
        "RESEND_API_KEY no configurada — modo prueba (no se envía correo real)",
    };
  }

  const from = getMailFrom();
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [payload.to],
      subject: payload.subject,
      text: payload.text,
      ...(payload.replyTo ? { reply_to: payload.replyTo } : {}),
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(
      `Error Resend (${res.status}): ${body.slice(0, 240) || res.statusText}`,
    );
  }

  const data = (await res.json()) as { id?: string };
  return { mode: "resend", id: data.id ?? "ok" };
}
