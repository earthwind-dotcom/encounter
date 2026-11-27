# Email

Encounter sends a little email (password reset now; group invites and reminders later). It goes
over HTTPS, because Railway blocks SMTP ports below the Pro plan. `src/lib/email.ts` picks the
provider from Railway variables; with none set, the app falls back to "ask a real person".

## Gmail (recommended: uses the Google Workspace we already have)

Mail is sent through the Gmail API as a Workspace address (team@understaffed.tech), by a
service account allowed to send as it. No new vendor account. Sent mail appears in that
mailbox's Sent folder, and replies come back to it.

One-time setup, about 15 minutes, signed in as a Workspace admin:

1. **Google Cloud project.** Go to console.cloud.google.com, create a project (e.g. `encounter-mail`).
2. **Turn on the Gmail API.** APIs & Services → Library → "Gmail API" → Enable.
3. **Service account.** IAM & Admin → Service Accounts → Create service account
   (`encounter-mailer`). Give it no roles. Open it, copy its **Unique ID** (a long number).
4. **Key.** In the service account → Keys → Add key → Create new key → JSON. A file downloads.
   If Google refuses ("key creation is disabled"), the org policy
   `iam.disableServiceAccountKeyCreation` is on (default for newer Workspace orgs): IAM & Admin →
   Organization Policies → find it → override for this project → Off, then try again.
5. **Let it send as you.** admin.google.com → Security → Access and data control → API controls →
   Manage Domain Wide Delegation → Add new. Client ID: the Unique ID from step 3. OAuth scope:
   `https://www.googleapis.com/auth/gmail.send` (send only: it cannot read mail).
6. **Railway variables** (encounter → web → Variables):
   - `GOOGLE_SERVICE_ACCOUNT`: the key file, base64. On a Mac: `base64 -i ~/Downloads/<key>.json | pbcopy`, then paste.
   - `GMAIL_SENDER`: `team@understaffed.tech`
   - `EMAIL_FROM`: `Encounter <team@understaffed.tech>`
7. **Delete the downloaded key file.** The only copy should be the Railway variable.

Test: open `/forgot` on the live site with your own address.

Security: the key can send mail as any address in the Workspace (that is how delegation works),
but only send, never read. Keep it only in Railway; if it ever leaks, delete the key in the
Cloud console (step 4) and the delegation entry (step 5).

Limits: Google Workspace allows about 2,000 messages a day per user, far beyond our needs.

## Resend (alternative)

`RESEND_API_KEY` + `EMAIL_FROM`, after verifying a sending domain at resend.com. Only used when
the Gmail variables are absent.
