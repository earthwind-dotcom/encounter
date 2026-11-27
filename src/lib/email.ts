import 'server-only';

/**
 * Outgoing email. One function, one provider (Resend's HTTP API, no SDK), switched on by two
 * Railway variables:
 *   RESEND_API_KEY   the API key
 *   EMAIL_FROM       e.g. "Encounter <hello@encounter.understaffed.tech>" (a domain verified in Resend)
 * Without them nothing is sent: in development the message is printed to the server log so
 * flows can be tested, and callers fall back to the no-email path (see `emailEnabled`).
 */
export const emailEnabled = () => !!(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);

export const siteUrl = () =>
  (process.env.SITE_URL ?? (process.env.RAILWAY_PUBLIC_DOMAIN ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}` : 'http://localhost:3000')).replace(/\/$/, '');

export interface Email {
  to: string;
  subject: string;
  /** Plain text is the source of truth; the HTML version is built from it. */
  text: string;
  /** One button in the HTML version, e.g. the reset link. */
  action?: { label: string; href: string };
}

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);

/** A plain, warm, single-column email that renders everywhere. */
export function renderEmailHtml({ subject, text, action }: Email): string {
  const paras = text
    .split(/\n{2,}/)
    .map((p) => `<p style="margin:0 0 16px;font:17px/1.6 Georgia,'Times New Roman',serif;color:#1d1b19">${esc(p).replace(/\n/g, '<br>')}</p>`)
    .join('');
  const button = action
    ? `<p style="margin:24px 0 28px"><a href="${esc(action.href)}" style="display:inline-block;background:#9a4a26;color:#fffaf4;text-decoration:none;font:600 15px/1 -apple-system,'Segoe UI',sans-serif;padding:14px 22px;border-radius:999px">${esc(action.label)}</a></p>`
    : '';
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${esc(subject)}</title></head>
<body style="margin:0;background:#f4eee6;padding:32px 16px">
<div style="max-width:560px;margin:0 auto;background:#fffbf6;border-radius:20px;padding:36px 32px;border:1px solid #eadfd2">
<p style="margin:0 0 24px;font:600 12px/1 -apple-system,'Segoe UI',sans-serif;letter-spacing:.22em;color:#9a4a26">ENCOUNTER</p>
${paras}${button}
<p style="margin:28px 0 0;padding-top:18px;border-top:1px solid #eadfd2;font:13px/1.5 -apple-system,'Segoe UI',sans-serif;color:#675f57">Honest about the evidence. Clear about the invitation. Free to say no.<br>${esc(siteUrl().replace(/^https?:\/\//, ''))}</p>
</div></body></html>`;
}

export async function sendEmail(email: Email): Promise<{ sent: boolean }> {
  if (!emailEnabled()) {
    if (process.env.NODE_ENV !== 'production') {
      console.info(`[email:dev] to=${email.to} subject="${email.subject}"\n${email.text}${email.action ? `\n${email.action.label}: ${email.action.href}` : ''}`);
    }
    return { sent: false };
  }
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM,
        to: [email.to],
        subject: email.subject,
        text: email.action ? `${email.text}\n\n${email.action.label}: ${email.action.href}` : email.text,
        html: renderEmailHtml(email),
      }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) console.error(`[email] provider said ${res.status}`);
    return { sent: res.ok };
  } catch (e) {
    console.error('[email] send failed', e instanceof Error ? e.message : e);
    return { sent: false };
  }
}
