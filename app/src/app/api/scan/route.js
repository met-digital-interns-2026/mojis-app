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

  // Parse the incoming multipart form data
  const incomingForm = await request.formData();
  const imageFile = incomingForm.get("image");
  const embeddingModel = incomingForm.get("embeddingModel");
  const onView = incomingForm.get("onView");

  if (!imageFile) {
    return Response.json({ error: "No image provided" }, { status: 400 });
  }

  // Build a fresh FormData with the raw file bytes for the upstream request.
  // Re-using the incoming FormData directly can fail in Node.js because the
  // parsed File objects may not re-serialize correctly into a new multipart stream.
  const imageBytes = Buffer.from(await imageFile.arrayBuffer());
  const upstreamForm = new FormData();
  upstreamForm.append("image", new Blob([imageBytes], { type: imageFile.type }), imageFile.name || "scan.jpg");
  if (embeddingModel) {
    upstreamForm.append("embeddingModel", embeddingModel);
  }
  if (onView === "true") {
    upstreamForm.append("onView", "true");
  }

  const headers = {};
  if (bypassSecret) {
    headers["x-vercel-protection-bypass"] = bypassSecret;
  }

  try {
    const upstreamRes = await fetch(UPSTREAM_URL, {
      method: "POST",
      body: upstreamForm,
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
  } catch (err) {
    console.error("Image search proxy error:", err);
    return Response.json(
      { error: "Failed to reach image search API" },
      { status: 502 },
    );
  }
}
