import { timingSafeEqual } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { rateLimited } from "@/lib/rateLimit";
import { GitHubError } from "@/server/mcp/github";
import { callTool, TOOLS } from "@/server/mcp/tools";
import { ToolError } from "@/server/mcp/validate";

/**
 * TechieBreed website connector — a remote MCP server for Claude.
 *
 * Stateless JSON-RPC 2.0 over HTTP POST (Streamable HTTP transport, no sessions).
 * Auth: "Authorization: Bearer <WEBSITE_MCP_TOKEN>" on every request.
 * Writes are commits to GitHub (see src/server/mcp/github.ts); Vercel deploys them.
 * Setup: docs/WEBSITE_CONNECTOR.md
 */

const SUPPORTED_VERSIONS = ["2025-06-18", "2025-03-26", "2024-11-05"];

type RpcBody = { jsonrpc?: string; id?: string | number | null; method?: string; params?: Record<string, unknown> };

const json = (body: unknown, status = 200) =>
  NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });
const rpcResult = (id: RpcBody["id"], result: unknown) => ({ jsonrpc: "2.0", id, result });
const rpcError = (id: RpcBody["id"], code: number, message: string) => ({ jsonrpc: "2.0", id, error: { code, message } });

function authorised(req: NextRequest): boolean | "not_configured" {
  const expected = process.env.WEBSITE_MCP_TOKEN?.trim();
  if (!expected || expected.length < 24) return "not_configured";
  const got = (req.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "").trim();
  const a = Buffer.from(got);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (rateLimited(`mcp:${ip}`, 300, 10 * 60_000)) return json({ error: "Too many requests" }, 429);

  const auth = authorised(req);
  if (auth === "not_configured") return json({ error: "Connector not configured" }, 503);
  if (!auth) return json({ error: "Unauthorized" }, 401);

  let body: RpcBody;
  try {
    body = (await req.json()) as RpcBody;
  } catch {
    return json(rpcError(null, -32700, "Parse error"), 400);
  }
  const { id, method, params } = body;

  // Notifications get no response body.
  if (id === undefined || id === null) {
    if (method?.startsWith("notifications/")) return new NextResponse(null, { status: 202 });
  }

  switch (method) {
    case "initialize": {
      const asked = String(params?.protocolVersion ?? "");
      return json(
        rpcResult(id, {
          protocolVersion: SUPPORTED_VERSIONS.includes(asked) ? asked : SUPPORTED_VERSIONS[0],
          capabilities: { tools: { listChanged: false } },
          serverInfo: { name: "techiebreed-website", title: "TechieBreed Website", version: "1.0.0" },
          instructions:
            "Manages www.techiebreed.org: Insights articles, Our Work case studies and site settings. Call get_site_overview first. Every write is saved to GitHub and goes live in about 2 minutes; confirm with get_publish_status before saying a change is live. Write in plain, benefit-led language and never invent statistics, client names, testimonials or results.",
        }),
      );
    }
    case "ping":
      return json(rpcResult(id, {}));
    case "tools/list":
      return json(rpcResult(id, { tools: TOOLS }));
    case "tools/call": {
      const name = String(params?.name ?? "");
      const args = (params?.arguments as Record<string, unknown>) ?? {};
      try {
        const result = await callTool(name, args);
        return json(rpcResult(id, { content: [{ type: "text", text: JSON.stringify(result, null, 2) }], isError: false }));
      } catch (e) {
        let payload: Record<string, unknown>;
        if (e instanceof ToolError) payload = { error: e.code, message: e.message };
        else if (e instanceof GitHubError) {
          payload =
            e.status === 409
              ? { error: "conflict", message: "Someone changed this file since it was read. Read it again and retry." }
              : e.status === 401 || e.status === 403
                ? { error: "github_access", message: "GitHub refused the change. Check the connector's GITHUB_TOKEN permissions." }
                : { error: "github", message: e.message };
        } else {
          console.error("[mcp] tool failed:", name, e instanceof Error ? e.message : e);
          payload = { error: "internal", message: "Something went wrong running this tool." };
        }
        return json(rpcResult(id, { content: [{ type: "text", text: JSON.stringify(payload) }], isError: true }));
      }
    }
    default:
      return json(rpcError(id ?? null, -32601, `Method not found: ${method}`), 404);
  }
}

/** This server doesn't stream; clients must POST. */
export function GET() {
  return new NextResponse("Method Not Allowed", { status: 405, headers: { Allow: "POST" } });
}

export function DELETE() {
  return new NextResponse(null, { status: 405, headers: { Allow: "POST" } });
}
