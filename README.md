# TechieBreed website

Marketing site for TechieBreed, an Intelligent Business Systems Company.
Built with Next.js 16 (App Router), TypeScript, Tailwind CSS 4 and MDX. Pages are static, and the contact
form is a small server route that sends email through Resend.

The look follows smedan.gov.ng: forest-green header, sprout-green pill buttons, Fraunces headings with
italic accents, Geist body text, pastel cards and gentle scroll animations.

---

## Run it on your computer

You need **Node.js 20 or newer**.

```bash
npm install
cp .env.example .env.local   # then fill in the values you have (all optional for local work)
npm run dev                  # http://localhost:3000
```

Before you deploy, check that everything passes:

```bash
npm run typecheck && npm run lint && npm run build
npm start                    # serve the production build on http://localhost:3000
```

On your own computer, if the email settings are empty, the forms still say "sent". The message is printed
in the terminal instead of being emailed, so you can test the forms without a Resend account.

---

## Add a case study

1. Copy a file in `content/our-work/`, for example `sportconn.mdx`, to `content/our-work/my-client.mdx`.
   The file name becomes the address: `/our-work/my-client`.
2. Edit the details between the `---` lines at the top:

   | Field      | What it is |
   |------------|------------|
   | `title`    | Headline of the case study |
   | `client`   | Client name (shown above the title) |
   | `summary`  | One or two sentences for cards and search results |
   | `order`    | Position in lists (1 comes first) |
   | `industry` | Shown in the "At a glance" box |
   | `services` | Any of: `automation`, `agents`, `sales`, `integrations`, `data`, `software` |
   | `art`      | Cover illustration: `pipeline`, `operations` or `enrolment` |
   | `flow`     | The steps shown in "How the system works", one per line |
   | `results`  | **Verified figures only.** Leave as `[]` to show "Results being measured". |

   To add results:

   ```yaml
   results:
     - label: Hours of manual research saved each week
       value: "12"
   ```

3. Write the sections under the headings. Keep `<FlowDiagram />` and `<Results />` where you want the
   diagram and the results to appear.
4. Rebuild (or redeploy). The case study appears on `/our-work` (and on the homepage if it is in the first
   three by `order`), in the sitemap, and gets its own share image.

## Add an article

1. Create `content/insights/my-article.mdx`. The file name becomes `/insights/my-article`.
2. Start it with:

   ```yaml
   ---
   title: Your article title
   summary: One or two sentences for cards, search results and social shares.
   date: 2026-12-01
   author: TechieBreed team
   tags: [Automation, Small business]
   ---
   ```

3. Write the article in Markdown: `##` for headings, `-` for bullet lists, `> ` for a pull quote,
   `[text](/contact#audit)` for links.
4. Reading time, topic pages (`/insights/topic/automation`), related articles, the sitemap entry and
   the share image are all created automatically.

To hide a file without deleting it, start its name with an underscore: `_draft.mdx`.

## Change other copy

| What | Where |
|------|-------|
| Services, packages | `src/content-data/services.ts` |
| Industries | `src/content-data/industries.ts` |
| Academy programmes and format | `src/content-data/academy.ts` |
| 7-step process | `src/content-data/process.ts` |
| Contact details, social links, nav | `src/lib/site.ts` |
| Colours, fonts, animation timing | `src/app/globals.css` (the `@theme` block) |

---

## Deploy to Vercel

1. Push this folder to a GitHub repository.
2. In Vercel, choose **Add New → Project**, import the repository and keep the detected **Next.js** settings.
3. Under **Environment Variables**, add the values from `.env.example`:
   - `NEXT_PUBLIC_SITE_URL`: your live address, for example `https://techiebreed.com`
   - `NEXT_PUBLIC_BOOKING_URL`: your Cal.com event link
   - `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL`
4. Click **Deploy**. Every push to the main branch redeploys automatically.
5. Add your domain under **Settings → Domains** and follow the DNS instructions.

**Resend setup:** create an account at resend.com, add and verify your domain (it gives you DNS records
to add), create an API key, and use an address on that domain as `CONTACT_FROM_EMAIL`.

**Cal.com setup:** create a free account, add an event type such as "AI Operations Audit", and copy
its public link, for example `https://cal.com/techiebreed/ai-operations-audit`.

**After launch:** run the live site through https://pagespeed.web.dev and submit
`https://your-domain/sitemap.xml` in Google Search Console.

---

## How it fits together

```
content/            MDX case studies and articles
src/app/            pages, API route (api/contact), sitemap, robots, share images, icons
src/components/     layout, cards, sections, forms, illustrations (SVG), MDX renderers
src/content-data/   services, packages, industries, programmes, process steps
src/lib/            site settings, content loader, form schemas, email, metadata helper
assets/fonts/       Fraunces files for share images (SIL Open Font License)
```

- **Forms** are checked in the browser and again on the server (`src/lib/schemas.ts`). They include a
  hidden spam trap and allow at most 5 messages per visitor every 10 minutes.
- **Animations** respect "reduce motion" settings, and the hero has a pause button.
- **Unknown addresses** return a real 404 page.
