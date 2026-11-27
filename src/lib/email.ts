import 'server-only';
import { createSign } from 'node:crypto';

/**
 * Outgoing email, sent over HTTPS (Railway blocks SMTP ports on the Hobby plan). Two providers,
 * picked by which Railway variables are set:
 *
 *   Gmail (preferred: the Google Workspace you already have, no new account)
 *     GOOGLE_SERVICE_ACCOUNT   the service account's JSON key, base64-encoded
 *     GMAIL_SENDER             the Workspace address it sends as, e.g. team@understaffed.tech
 *     EMAIL_FROM (optional)    display form, e.g. "Encounter <team@understaffed.tech>"
 *   The service account needs domain-wide delegation for the gmail.send scope (docs/EMAIL.md).
 *
 *   Resend
 *     RESEND_API_KEY + EMAIL_FROM
 *
 * With neither, nothing is sent: in development the message is printed to the server log, and
 * callers fall back to the no-email path (see `emailEnabled`).
 */
type Provider = 'gmail' | 'resend' | null;
const provider = (): Provider =>
  process.env.GOOGLE_SERVICE_ACCOUNT && process.env.GMAIL_SENDER ? 'gmail' : process.env.RESEND_API_KEY && process.env.EMAIL_FROM ? 'resend' : null;

export const emailEnabled = () => provider() !== null;

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

const b64url = (b: Buffer | string) => Buffer.from(b).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const plainText = (e: Email) => (e.action ? `${e.text}\n\n${e.action.label}: ${e.action.href}` : e.text);

/** A UTF-8 multipart/alternative message (plain text + HTML), as Gmail's API wants it. */
export function buildMime(e: Email, from: string): string {
  const boundary = `enc_${Date.now().toString(36)}`;
  const header = (s: string) => (/^[\x20-\x7e]*$/.test(s) ? s : `=?UTF-8?B?${Buffer.from(s).toString('base64')}?=`);
  const wrap = (s: string) => Buffer.from(s).toString('base64').replace(/.{76}/g, '$&\r\n');
  return [
    `From: ${from}`,
    `To: ${e.to}`,
    `Subject: ${header(e.subject)}`,
    'MIME-Version: 1.0',
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    '',
    `--${boundary}`,
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: base64',
    '',
    wrap(plainText(e)),
    `--${boundary}`,
    'Content-Type: text/html; charset=UTF-8',
    'Content-Transfer-Encoding: base64',
    '',
    wrap(renderEmailHtml(e)),
    `--${boundary}--`,
    '',
  ].join('\r\n');
}

interface ServiceAccount {
  client_email: string;
  private_key: string;
}

/** A signed JWT asking Google for a gmail.send token on behalf of `sender` (domain-wide delegation). */
export function serviceAccountAssertion(sa: ServiceAccount, sender: string, now = Math.floor(Date.now() / 1000)): string {
  const head = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claims = b64url(
    JSON.stringify({ iss: sa.client_email, sub: sender, scope: 'https://www.googleapis.com/auth/gmail.send', aud: 'https://oauth2.googleapis.com/token', iat: now, exp: now + 3600 }),
  );
  const sig = createSign('RSA-SHA256').update(`${head}.${claims}`).sign(sa.private_key);
  return `${head}.${claims}.${b64url(sig)}`;
}

let token: { value: string; until: number } | null = null;
async function gmailToken(sa: ServiceAccount, sender: string): Promise<string> {
  if (token && token.until > Date.now()) return token.value;
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: serviceAccountAssertion(sa, sender) }),
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) throw new Error(`google token ${res.status}`);
  const j = (await res.json()) as { access_token: string; expires_in: number };
  token = { value: j.access_token, until: Date.now() + (j.expires_in - 120) * 1000 };
  return token.value;
}

async function sendGmail(email: Email): Promise<boolean> {
  const sa = JSON.parse(Buffer.from(process.env.GOOGLE_SERVICE_ACCOUNT!, 'base64').toString('utf8')) as ServiceAccount;
  const sender = process.env.GMAIL_SENDER!;
  const from = process.env.EMAIL_FROM || `Encounter <${sender}>`;
  const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: { Authorization: `Bearer ${await gmailToken(sa, sender)}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ raw: b64url(buildMime(email, from)) }),
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) console.error(`[email] gmail said ${res.status}`);
  return res.ok;
}

async function sendResend(email: Email): Promise<boolean> {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: process.env.EMAIL_FROM, to: [email.to], subject: email.subject, text: plainText(email), html: renderEmailHtml(email) }),
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) console.error(`[email] resend said ${res.status}`);
  return res.ok;
}

export async function sendEmail(email: Email): Promise<{ sent: boolean }> {
  const p = provider();
  if (!p) {
    if (process.env.NODE_ENV !== 'production') {
      console.info(`[email:dev] to=${email.to} subject="${email.subject}"\n${plainText(email)}`);
    }
    return { sent: false };
  }
  try {
    return { sent: p === 'gmail' ? await sendGmail(email) : await sendResend(email) };
  } catch (e) {
    console.error('[email] send failed', e instanceof Error ? e.message : e);
    return { sent: false };
  }
}
