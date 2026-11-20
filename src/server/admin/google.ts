import "server-only";
import { createSign } from "node:crypto";

/**
 * Reads Google Search Console and Google Analytics 4 with one service account.
 * The account's JSON key lives in GOOGLE_SERVICE_ACCOUNT_JSON (server only); the
 * account is added as a user on the Search Console property and the GA4 property.
 * No Google library: a signed JWT is exchanged for a short-lived access token.
 */

type ServiceAccount = { client_email: string; private_key: string; token_uri?: string };

export type GoogleConfig = {
  account: ServiceAccount;
  /** Search Console property, e.g. "sc-domain:techiebreed.org" or "https://www.techiebreed.org/". */
  gscSite: string | null;
  /** GA4 property id (numbers only). */
  ga4Property: string | null;
};

const SCOPES = "https://www.googleapis.com/auth/webmasters.readonly https://www.googleapis.com/auth/analytics.readonly";

/** Development only: point every Google call at a local stand-in server (used by the tests). */
function mockBase(): string | null {
  const m = process.env.GOOGLE_API_MOCK?.trim();
  return m && process.env.NODE_ENV !== "production" ? m.replace(/\/$/, "") : null;
}

function parseAccount(raw: string | undefined): ServiceAccount | null {
  const text = raw?.trim();
  if (!text) return null;
  try {
    const json = JSON.parse(text.startsWith("{") ? text : Buffer.from(text, "base64").toString("utf8"));
    if (typeof json.client_email !== "string" || typeof json.private_key !== "string") return null;
    return { client_email: json.client_email, private_key: json.private_key.replace(/\\n/g, "\n"), token_uri: json.token_uri };
  } catch {
    return null;
  }
}

export function googleConfig(): GoogleConfig | null {
  const account = parseAccount(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
  if (!account) return null;
  const gscSite = process.env.GSC_SITE_URL?.trim() || null;
  const ga = process.env.GA4_PROPERTY_ID?.trim().replace(/^properties\//, "") || null;
  return { account, gscSite, ga4Property: ga && /^\d+$/.test(ga) ? ga : null };
}

/** A Google API problem, with a message written for the person looking at the admin. */
export class GoogleError extends Error {}

let cachedToken: { email: string; token: string; until: number } | null = null;

async function accessToken(account: ServiceAccount): Promise<string> {
  if (cachedToken && cachedToken.email === account.client_email && cachedToken.until > Date.now() + 60_000) return cachedToken.token;
  const tokenUrl = mockBase() ? `${mockBase()}/token` : account.token_uri || "https://oauth2.googleapis.com/token";
  const now = Math.floor(Date.now() / 1000);
  const enc = (o: object) => Buffer.from(JSON.stringify(o)).toString("base64url");
  const unsigned = `${enc({ alg: "RS256", typ: "JWT" })}.${enc({ iss: account.client_email, scope: SCOPES, aud: tokenUrl, iat: now, exp: now + 3600 })}`;
  let signature: string;
  try {
    signature = createSign("RSA-SHA256").update(unsigned).sign(account.private_key, "base64url");
  } catch {
    throw new GoogleError("The Google key in GOOGLE_SERVICE_ACCOUNT_JSON can't be read. Paste the whole JSON key file again in Vercel.");
  }
  const res = await fetch(tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: `${unsigned}.${signature}` }),
    cache: "no-store",
  });
  const body = (await res.json().catch(() => ({}))) as { access_token?: string; expires_in?: number; error_description?: string };
  if (!res.ok || !body.access_token) {
    console.error("[google] token refused:", res.status, body.error_description ?? "");
    throw new GoogleError("Google refused the service account key. It may have been deleted; create a new key and update GOOGLE_SERVICE_ACCOUNT_JSON.");
  }
  cachedToken = { email: account.client_email, token: body.access_token, until: Date.now() + (body.expires_in ?? 3600) * 1000 };
  return body.access_token;
}

/** POSTs to a Google API and returns the JSON, turning failures into plain messages. */
export async function googlePost<T>(cfg: GoogleConfig, api: "gsc" | "ga", path: string, payload: unknown): Promise<T> {
  const base = mockBase() ?? (api === "gsc" ? "https://searchconsole.googleapis.com" : "https://analyticsdata.googleapis.com");
  const token = await accessToken(cfg.account);
  let res: Response;
  try {
    res = await fetch(base + path, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    });
  } catch {
    throw new GoogleError("Google didn't answer in time. Try again in a minute.");
  }
  if (res.ok) return (await res.json()) as T;
  const err = (await res.json().catch(() => ({}))) as { error?: { message?: string } };
  console.error(`[google] ${api} ${res.status}:`, err.error?.message ?? "");
  const who = cfg.account.client_email;
  if (res.status === 403 || res.status === 401) {
    if (/has not been used|is disabled/i.test(err.error?.message ?? ""))
      throw new GoogleError(
        api === "gsc"
          ? "The Search Console API isn't switched on in your Google Cloud project yet."
          : "The Google Analytics Data API isn't switched on in your Google Cloud project yet.",
      );
    throw new GoogleError(
      api === "gsc"
        ? `Search Console hasn't given access to ${who}. Add it as a user on the property (Settings → Users and permissions).`
        : `Google Analytics hasn't given access to ${who}. Add it as a Viewer on the GA4 property (Admin → Property access management).`,
    );
  }
  if (res.status === 404 || res.status === 400)
    throw new GoogleError(api === "gsc" ? "Search Console can't find that property. Check GSC_SITE_URL." : "Google Analytics can't find that property. Check GA4_PROPERTY_ID.");
  if (res.status === 429) throw new GoogleError("Google says we've asked too often. The numbers will be back in a few minutes.");
  throw new GoogleError("Google had a problem answering. Try again in a minute.");
}
