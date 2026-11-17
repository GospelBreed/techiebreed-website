/** Which commit the live site was built from. Used by the website connector to tell when a change is live. */
export function GET() {
  return Response.json(
    {
      commit: process.env.VERCEL_GIT_COMMIT_SHA ?? null,
      branch: process.env.VERCEL_GIT_COMMIT_REF ?? null,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
