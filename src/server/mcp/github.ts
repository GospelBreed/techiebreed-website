import "server-only";

/**
 * Minimal GitHub REST client for the website connector.
 * Every saved change is a commit on the site's branch; Vercel deploys it automatically.
 *
 * Env: GITHUB_TOKEN (fine-grained token, this repository only, Contents: read and write),
 *      GITHUB_REPO ("owner/name"), GITHUB_BRANCH (default "main").
 */

export class GitHubError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

type Config = { token: string; repo: string; branch: string };

export function githubConfig(): Config | null {
  const token = process.env.GITHUB_TOKEN?.trim();
  const repo = process.env.GITHUB_REPO?.trim();
  if (!token || !repo || !/^[\w.-]+\/[\w.-]+$/.test(repo)) return null;
  return { token, repo, branch: process.env.GITHUB_BRANCH?.trim() || "main" };
}

async function gh(cfg: Config, path: string, init: RequestInit = {}) {
  const res = await fetch(`https://api.github.com/repos/${cfg.repo}${path}`, {
    ...init,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${cfg.token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "techiebreed-website-connector",
      ...(init.body ? { "Content-Type": "application/json" } : {}),
    },
    cache: "no-store",
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) {
    let detail = "";
    try {
      detail = ((await res.json()) as { message?: string }).message ?? "";
    } catch {
      /* ignore */
    }
    throw new GitHubError(res.status, detail || `GitHub responded ${res.status}`);
  }
  return res.status === 204 ? null : res.json();
}

export type RepoFile = { path: string; sha: string; content: string };

/** Reads a text file from the branch. Returns null when it doesn't exist. */
export async function readFile(cfg: Config, path: string): Promise<RepoFile | null> {
  try {
    const data = (await gh(cfg, `/contents/${encodePath(path)}?ref=${encodeURIComponent(cfg.branch)}`)) as {
      type: string;
      sha: string;
      content?: string;
      encoding?: string;
    };
    if (data.type !== "file" || data.content === undefined) return null;
    return { path, sha: data.sha, content: Buffer.from(data.content, "base64").toString("utf8") };
  } catch (e) {
    if (e instanceof GitHubError && e.status === 404) return null;
    throw e;
  }
}

/** Lists file names in a folder on the branch. */
export async function listFolder(cfg: Config, path: string): Promise<{ name: string; sha: string }[]> {
  try {
    const data = (await gh(cfg, `/contents/${encodePath(path)}?ref=${encodeURIComponent(cfg.branch)}`)) as {
      name: string;
      sha: string;
      type: string;
    }[];
    return data.filter((f) => f.type === "file").map((f) => ({ name: f.name, sha: f.sha }));
  } catch (e) {
    if (e instanceof GitHubError && e.status === 404) return [];
    throw e;
  }
}

/**
 * Creates or replaces a file in one commit.
 * Pass `sha` when replacing: GitHub refuses the write if the file changed since it was read.
 */
export type CommitAuthor = { name: string; email?: string };

export async function writeFile(
  cfg: Config,
  path: string,
  content: string,
  message: string,
  sha?: string,
  author?: CommitAuthor,
): Promise<{ commit: string; url: string }> {
  const data = (await gh(cfg, `/contents/${encodePath(path)}`, {
    method: "PUT",
    body: JSON.stringify({
      message,
      content: Buffer.from(content, "utf8").toString("base64"),
      branch: cfg.branch,
      ...(sha ? { sha } : {}),
      committer: author
        ? { name: "TechieBreed Admin", email: "noreply@techiebreed.org" }
        : { name: "Claude (website connector)", email: "noreply@techiebreed.org" },
      ...(author ? { author: { name: author.name, email: author.email ?? "noreply@techiebreed.org" } } : {}),
    }),
  })) as { commit: { sha: string; html_url: string } };
  return { commit: data.commit.sha, url: data.commit.html_url };
}

export type CommitInfo = { sha: string; message: string; author: string; date: string; url: string };

/** A file's content at a given commit (null if it didn't exist then). */
export async function readFileAt(cfg: Config, path: string, ref: string): Promise<string | null> {
  try {
    const data = (await gh(cfg, `/contents/${encodePath(path)}?ref=${encodeURIComponent(ref)}`)) as { content?: string };
    return data.content === undefined ? null : Buffer.from(data.content, "base64").toString("utf8");
  } catch (e) {
    if (e instanceof GitHubError && e.status === 404) return null;
    throw e;
  }
}

/** Files changed by a commit, and its first parent. */
export async function commitDetails(cfg: Config, sha: string): Promise<{ parent: string | null; files: { filename: string; status: string }[]; message: string }> {
  const data = (await gh(cfg, `/commits/${encodeURIComponent(sha)}`)) as {
    parents: { sha: string }[];
    files?: { filename: string; status: string }[];
    commit: { message: string };
  };
  return { parent: data.parents[0]?.sha ?? null, files: data.files ?? [], message: data.commit.message };
}

export async function recentCommits(cfg: Config, limit = 10, path?: string): Promise<CommitInfo[]> {
  const q = new URLSearchParams({ sha: cfg.branch, per_page: String(Math.min(Math.max(limit, 1), 30)) });
  if (path) q.set("path", path);
  const data = (await gh(cfg, `/commits?${q}`)) as {
    sha: string;
    html_url: string;
    commit: { message: string; author: { name: string; date: string } };
  }[];
  return data.map((c) => ({
    sha: c.sha,
    message: c.commit.message.split("\n")[0],
    author: c.commit.author.name,
    date: c.commit.author.date,
    url: c.html_url,
  }));
}

function encodePath(path: string) {
  return path.split("/").map(encodeURIComponent).join("/");
}
