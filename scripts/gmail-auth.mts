/**
 * One-time sign-in that lets Encounter send email as a Workspace address, without a service
 * account key. Run it on your own computer, sign in as the sender (team@understaffed.tech),
 * approve "Send email on your behalf", and it prints the refresh token to put in Railway.
 *
 *   GMAIL_CLIENT_ID=... GMAIL_CLIENT_SECRET=... node scripts/gmail-auth.mts
 *
 * The OAuth client must be a "Desktop app" client in the Google Cloud project (docs/EMAIL.md).
 * Nothing is stored: the token is printed once, in this terminal only.
 */
import { createServer } from 'node:http';
import { randomBytes, createHash } from 'node:crypto';
import { execFile } from 'node:child_process';

const id = process.env.GMAIL_CLIENT_ID;
const secret = process.env.GMAIL_CLIENT_SECRET;
if (!id || !secret) {
  console.error('Set GMAIL_CLIENT_ID and GMAIL_CLIENT_SECRET (from the Desktop app OAuth client).');
  process.exit(1);
}

const verifier = randomBytes(48).toString('base64url');
const challenge = createHash('sha256').update(verifier).digest('base64url');
const state = randomBytes(16).toString('hex');

const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? '/', 'http://127.0.0.1');
  if (url.pathname !== '/callback') return void res.writeHead(404).end();
  const code = url.searchParams.get('code');
  if (url.searchParams.get('state') !== state || !code) {
    res.writeHead(400).end('Sign-in failed or was cancelled. Close this tab and run the script again.');
    return void server.close();
  }
  const r = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ code, client_id: id, client_secret: secret, redirect_uri: redirect, grant_type: 'authorization_code', code_verifier: verifier }),
  });
  const j = (await r.json()) as { refresh_token?: string; error?: string; error_description?: string };
  if (!j.refresh_token) {
    res.writeHead(500).end('Google did not return a refresh token. See the terminal.');
    console.error('No refresh token:', j.error, j.error_description);
  } else {
    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' }).end('Done. Go back to the terminal, then close this tab.');
    console.log('\nGMAIL_REFRESH_TOKEN (paste into Railway, then clear this terminal):\n');
    console.log(j.refresh_token + '\n');
  }
  server.close();
});

let redirect = '';
server.listen(0, '127.0.0.1', () => {
  const port = (server.address() as { port: number }).port;
  redirect = `http://127.0.0.1:${port}/callback`;
  const auth = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  auth.search = new URLSearchParams({
    client_id: id,
    redirect_uri: redirect,
    response_type: 'code',
    scope: 'https://www.googleapis.com/auth/gmail.send',
    access_type: 'offline',
    prompt: 'consent',
    code_challenge: challenge,
    code_challenge_method: 'S256',
    state,
  }).toString();
  console.log('Opening Google sign-in. If it does not open, visit:\n' + auth.toString());
  execFile('open', [auth.toString()], () => {});
});
