// Server-side proxy for the image similarity API.
//
// The Met's semantic search preview deployment requires a bypass secret
// (x-vercel-protection-bypass header). We keep that secret server-side
// so it's never exposed to the browser.
//
// The client sends the image to /api/scan → this route forwards it to
// the upstream API with the secret attached → returns the results.

const UPSTREAM_URL =
  "https://staging-and-preview-web-git-semantic-search-the-met.vercel.app/api/search/image-similarity";

export async function POST(request) {
  const bypassSecret = process.env.IMAGE_SEARCH_BYPASS_SECRET;

  // Forward the multipart form data as-is to the upstream API
  const formData = await request.formData();

  const headers = {};
  if (bypassSecret) {
    headers["x-vercel-protection-bypass"] = bypassSecret;
  }

  const upstreamRes = await fetch(UPSTREAM_URL, {
    method: "POST",
    body: formData,
    headers,
  });

  if (!upstreamRes.ok) {
    const body = await upstreamRes.json().catch(() => ({}));
    return Response.json(
      { error: body.error || `Upstream search failed (${upstreamRes.status})` },
      { status: upstreamRes.status },
    );
  }

  const data = await upstreamRes.json();
  return Response.json(data);
}
