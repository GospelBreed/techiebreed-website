# TechieBreed Website connector (MCP)

Lets Claude manage **www.techiebreed.org** as a custom connector:
Insights articles, Our Work case studies and site settings.

- **Address:** `https://www.techiebreed.org/api/mcp`
- **Auth:** `Authorization: Bearer <WEBSITE_MCP_TOKEN>`
- **How changes go live:** every change is a commit to GitHub
  (`GospelBreed/techiebreed-website`, branch `main`). Vercel deploys it in about
  2 minutes. Commits are signed "Claude (website connector)", so every change
  is visible in GitHub history and can be undone there.

## Tools

| Tool | What it does |
|---|---|
| `get_site_overview` | Start here: articles, case studies, settings, recent changes, publish status |
| `list_articles` / `get_article` | Read Insights articles (published and hidden) |
| `create_article` / `update_article` | Publish or edit an article (plain Markdown) |
| `set_article_visibility` | Hide or show an article (nothing is deleted) |
| `list_case_studies` / `get_case_study` | Read case studies |
| `create_case_study` / `update_case_study` | Add or edit a case study (videos are kept; new videos need a developer) |
| `set_case_study_visibility` | Hide or show a case study |
| `get_site_settings` / `update_site_settings` | Contact email, phone, social links, Cal.com link, reply time |
| `get_publish_status` | Is the latest change live yet? |
| `list_recent_changes` | Recent commits to the site |
| `check_page` | Fetch a live page: status, title, description, heading, text |

### Safety rules built into the connector

- Content is checked before saving. Bad Markdown, scripts, iframes,
  components (other than `<FlowDiagram />` and `<Results />` in case studies)
  and missing fields are refused, so a bad edit can't break the site.
- Nothing is ever deleted. "Hide" sets `draft: true`.
- Edits use the file's current version, so two people can't overwrite each
  other silently.
- It can only change `content/` (articles, case studies, `settings.json`).
  Page design and code stay with a developer.
- `check_page` only fetches pages on www.techiebreed.org.
- At most 300 requests per 10 minutes per visitor.

## One-time setup

### 1. Create a GitHub token
Sign in to GitHub as **GospelBreed**, then:

1. Go to **Settings → Developer settings → Personal access tokens → Fine-grained tokens → Generate new token**.
2. **Name:** `techiebreed-website-connector` · **Expiration:** 1 year (set a reminder to renew).
3. **Repository access:** *Only select repositories* → `GospelBreed/techiebreed-website`.
4. **Permissions → Repository permissions → Contents:** **Read and write**. Leave everything else at No access.
5. Generate it and copy it (it starts with `github_pat_`).

### 2. Add the environment variables in Vercel
Project → **Settings → Environment Variables**. Type **Secret**, environment **Production**:

| Key | Value |
|---|---|
| `WEBSITE_MCP_TOKEN` | a long random password (at least 24 characters); this is what Claude uses to sign in |
| `GITHUB_TOKEN` | the `github_pat_…` token from step 1 |
| `GITHUB_REPO` | `GospelBreed/techiebreed-website` |

Then **Deployments → ⋯ → Redeploy**.

To make a strong `WEBSITE_MCP_TOKEN`, run this in a terminal:
`node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"`

### 3. Add the connector in Claude
claude.ai → **Settings → Connectors → Add custom connector**:
- **Name:** TechieBreed Website
- **URL:** `https://www.techiebreed.org/api/mcp`
- **Auth:** the `WEBSITE_MCP_TOKEN` value, as a bearer token (same as the
  TechieBreed CRM connector)

Ask Claude to "give me an overview of the website" to check it works.

## Troubleshooting

| Message | Fix |
|---|---|
| `Unauthorized` | The token in Claude doesn't match `WEBSITE_MCP_TOKEN` in Vercel. |
| `Connector not configured` (503) | `WEBSITE_MCP_TOKEN` is missing or shorter than 24 characters; add it and redeploy. |
| `not_configured` | `GITHUB_TOKEN` or `GITHUB_REPO` is missing in Vercel. |
| `github_access` | The GitHub token expired or lacks Contents: Read and write on this repository. |
| Change never goes live | Check Vercel → Deployments for a failed build, then undo the commit in GitHub if needed. |

To revoke access instantly, change `WEBSITE_MCP_TOKEN` in Vercel and redeploy,
or delete the GitHub token.
