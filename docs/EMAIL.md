# Email

Encounter sends a little email (password reset now; group invites and reminders later). It goes
over HTTPS, because Railway blocks SMTP ports below the Pro plan. `src/lib/email.ts` picks the
provider from Railway variables; with none set, the app falls back to "ask a real person".

## Gmail (recommended: uses the Google Workspace we already have)

Mail is sent through the Gmail API as team@understaffed.tech. No new vendor account. Sent mail
appears in that mailbox's Sent folder, and replies come back to it. Two ways to authorize it:

### Option A: one-time sign-in (recommended, no key files)

Works under Google's "Secure by Default" policy that blocks service account keys
(`iam.managed.disableServiceAccountKeyCreation`). About 10 minutes.

1. **Google Cloud project** `encounter-mail` (console.cloud.google.com). Gmail API enabled
   (APIs & Services → Library → Gmail API → Enable).
2. **Consent screen.** APIs & Services → OAuth consent screen (also called "Google Auth Platform
   → Branding / Audience"). App name `Encounter`, support email team@.
   **Audience: Internal.** This matters: with *External* in testing mode, Google expires the
   sign-in after 7 days and email stops.
3. **Data access / scopes:** add `https://www.googleapis.com/auth/gmail.send` (send only, it
   cannot read mail).
4. **OAuth client.** APIs & Services → Credentials → Create credentials → OAuth client ID →
   Application type **Desktop app** → name `encounter-mailer`. Copy the **Client ID** and
   **Client secret** (they are shown on screen; no file needed).
5. **Sign in once,** on your Mac, in Terminal:

   ```
   cd ~/Projects/encounter
   GMAIL_CLIENT_ID='paste-id' GMAIL_CLIENT_SECRET='paste-secret' npm run gmail:auth
   ```

   A browser tab opens. Sign in as **team@understaffed.tech**, approve "Send email on your
   behalf". The terminal prints `GMAIL_REFRESH_TOKEN`.
6. **Railway** (encounter → web → Variables):
   - `GMAIL_CLIENT_ID`, `GMAIL_CLIENT_SECRET`, `GMAIL_REFRESH_TOKEN`: from steps 4 and 5
   - `GMAIL_SENDER`: `team@understaffed.tech`
   - `EMAIL_FROM`: `Encounter <team@understaffed.tech>`
7. Close the Terminal window (the token was printed there).

Test: `/forgot` on the live site with your own address.

To revoke later: myaccount.google.com → Security → Third-party connections → Encounter → remove
(or delete the OAuth client in the Cloud console). The sign-in stops working if team@'s password
is changed.

### Option B: service account key + domain-wide delegation

Only if the org allows service account keys. Create a service account with a JSON key, add it in
admin.google.com → Security → API controls → Domain Wide Delegation with scope
`https://www.googleapis.com/auth/gmail.send`, and set `GOOGLE_SERVICE_ACCOUNT` (base64 of the key
file) plus `GMAIL_SENDER` and `EMAIL_FROM`. Option A is preferred: no long-lived key file, and the
key here could send as any address in the Workspace.

Limits: Google Workspace allows about 2,000 messages a day per user, far beyond our needs.

## Resend (alternative)

`RESEND_API_KEY` + `EMAIL_FROM`, after verifying a sending domain at resend.com. Only used when
the Gmail variables are absent.
