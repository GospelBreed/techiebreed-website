# TechieBreed website admin

A private dashboard at **https://www.techiebreed.org/admin** for running the website.

- **Accounts and sign-in:** Supabase Auth (email + password, optional authenticator-app codes).
- **Staff, roles, activity log, enquiries:** Supabase tables (`site_` prefix). Every table has
  Row Level Security on with no policies, so only the website's server can use them.
- **Content changes:** commits to GitHub, which Vercel publishes in about 2 minutes. This is the
  same engine as the Claude website connector (`src/server/mcp`).

## Roles

| Role | Can |
|---|---|
| **Super Admin** (one person) | Everything: users and roles, settings and ads, the activity log and undo, all content and enquiries |
| **Admin** | Publish, edit and hide all articles and case studies; manage enquiries; edit contact settings |
| **Editor** | Write and edit articles and case studies as drafts and submit them for review |
| **Author** | Write, publish, edit and hide **their own** blog posts |
| **Support** | View and handle enquiries: status, notes and replies |

Permissions live in one place: `src/server/admin/roles.ts`.

## Security

- **Sign-in:** email + password (minimum 10 characters). After 5 wrong attempts the account
  is locked for 15 minutes. The same applies to wrong authenticator codes.
- **Authenticator app:** optional per person. The Super Admin can **require** it for anyone,
  and **reset** it for someone who lost their phone.
- **Sign-up:** there is no public sign-up. Only the Super Admin can invite people. Invite and
  reset links are emailed through Resend, work once, and expire.
- **Suspending:** suspending someone signs them out and blocks them immediately.
- **Search engines:** `/admin` is blocked from indexing (`robots.txt`, `X-Robots-Tag`, `noindex`).

## Writing and publishing

- **Drafts** are saved in Supabase. Saving never changes the website.
- **Publish**, **Hide/Show** and **Undo** commit to GitHub; Vercel updates the site in about 2 minutes.
- **Editors** submit drafts for review. **Admins** approve and publish them, or send them back with a note.
- **Authors** write and publish their own blog posts only.
- If the live version changed while you were editing, Publish asks before replacing it.
- **Activity** lists every live change, from the admin or from Claude. The Super Admin can undo any of them.

## Enquiries

- Every message from the discovery and Academy forms is **saved in the admin** and also emailed to
  the team. The email has an "Open it in the admin" link. If email fails, the enquiry is still saved.
- Bot submissions (the hidden honeypot field) are dropped, not stored.
- **Support, Admins and the Super Admin** can read enquiries, assign them, add team notes, set the status
  (New, Replied, Closed, Spam) and download them as a spreadsheet. Only the **Super Admin** can delete one.
- **Reply by email** opens your own email app (e.g. Zoho) addressed to the person. Then mark it replied.

## Settings

- Contact email, phone, reply time, booking link and social links (Admins and the Super Admin).
- **Ads on/off** for Google AdSense: Super Admin only. Admins see the current state.
- Saving commits `content/settings.json` to GitHub; the site updates in about 2 minutes. It can be undone
  from Activity. If someone else saved first, you're asked to reload instead of overwriting their change.
- The Claude connector can change contact details and links, but not the ads switch.

## Analytics

- **Admin → Analytics** (Super Admin, Admins and Editors) shows two sources side by side, for the
  last 7 days, 28 days or 3 months, each compared with the period before:
  - **Visitors** from Google Analytics 4: visitors, visits, pages viewed, engaged visits, most-read
    pages, how people arrive, sources, countries and devices.
  - **Google Search** from Search Console: clicks, times shown, click rate, average position, the
    search terms people used, and the pages they clicked. Google's last 2–3 days are still filling in.
- **On the website now** counts people in the last 30 minutes and refreshes every 30 seconds.
- The dashboard shows visitors and Google clicks for the last 28 days.
- Answers from Google are kept for 10 minutes (live numbers for 20 seconds).
- Tracking runs on the public pages only, never in the admin.

### Connecting Google (once, by the Super Admin)

1. **Google Analytics 4.** At https://analytics.google.com → **Admin → Create → Property**, name it
   *TechieBreed website*, time zone **Nigeria**, currency **Naira**. Add a **Web** data stream for
   `https://www.techiebreed.org` (leave **Enhanced measurement** on). Copy the **Measurement ID**
   (`G-…`) and, from **Admin → Property details**, the **Property ID** (numbers only).
2. **Google Cloud.** At https://console.cloud.google.com create a project *techiebreed-website*.
   In **APIs & Services → Library** enable **Google Search Console API** and
   **Google Analytics Data API**.
3. **Service account.** **IAM & Admin → Service Accounts → Create**, name *website-analytics*, no roles.
   Open it → **Keys → Add key → JSON**. A file downloads: this is the key. Don't email or paste it
   anywhere except Vercel.
4. **Give it access.** Copy the service account's email (`…@….iam.gserviceaccount.com`).
   - Search Console → **Settings → Users and permissions → Add user**: that email, permission **Restricted**.
   - Google Analytics → **Admin → Property access management → +**: that email, role **Viewer**.
5. **Vercel** → Project → Settings → Environment Variables (Production), then redeploy:
   - `NEXT_PUBLIC_GA_MEASUREMENT_ID` = the `G-…` id (switches on visitor tracking)
   - `GOOGLE_SERVICE_ACCOUNT_JSON` = the whole contents of the JSON key file
   - `GSC_SITE_URL` = `sc-domain:techiebreed.org` for a Domain property, or
     `https://www.techiebreed.org/` for a URL-prefix property (as listed in Search Console)
   - `GA4_PROPERTY_ID` = the Property ID
6. Open **Admin → Analytics**. If something is missing, the page says exactly which step.
   Visitor numbers start from the day tracking is switched on; Search Console already has history.

## One-time setup

### 1. Supabase project
1. At https://supabase.com, create a project named **techiebreed-website** in region
   **West EU (Ireland)**, using your usual account.
2. Go to **SQL Editor → New query**, paste the whole of `supabase/migrations/0001_admin.sql`
   and click **Run**. Do the same with `0002_content.sql` (drafts for articles and case studies).
   Both are safe to run again.
3. Go to **Authentication → Sign In / Providers → Email** and turn **off** "Allow new users to sign up".
4. Go to **Authentication → Multi-Factor**. Make sure **TOTP (App Authenticator)** is **enabled**.
5. Go to **Authentication → URL Configuration**:
   - **Site URL:** `https://www.techiebreed.org`
   - **Redirect URLs:** add `https://www.techiebreed.org/admin/**`

### 2. Vercel environment variables
Project → **Settings → Environment Variables**, environment **Production**:

| Key | Where to find it | Type |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API → Project URL | Config |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → API Keys → **anon / publishable** key | Config |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → API Keys → **service_role / secret** key | **Secret** |
| `SUPER_ADMIN_EMAIL` | the Super Admin's email address | Secret |

`RESEND_API_KEY` and `CONTACT_FROM_EMAIL` are already set; they send the invite and reset emails.
`GITHUB_TOKEN` and `GITHUB_REPO` are already set from the connector; they let the admin publish.

Then go to **Deployments → ⋯ → Redeploy**.

### 3. Create the Super Admin
1. Open **https://www.techiebreed.org/admin/setup** and click **Email me the set-up link**.
2. Open the email, choose your name and password, and you're in.
3. Go to **My account** and turn on the authenticator app.
4. Go to **Users** and invite your team.

The set-up page stops working once a Super Admin exists.

## Local development

```bash
npx supabase start                     # local Supabase on ports 57320–57329 (see supabase/config.toml)
# put the printed API URL, anon key and service_role key in .env.local, plus SUPER_ADMIN_EMAIL
npm run dev
```

Without `RESEND_API_KEY` locally, invite and reset links are printed in the terminal
instead of being emailed.
