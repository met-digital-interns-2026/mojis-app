// Image Similarity Search — identifies artworks from photos.
//
// Uses The Met's semantic search API to find visually similar artworks.
// You take a photo of an artwork → send it to this API → get back matches
// ranked by visual similarity (powered by Elasticsearch kNN vector search).
//
// The actual API call goes through our own /api/scan route, which adds
// the bypass secret server-side so it's never exposed to the browser.

/**
 * Search for visually similar artworks by uploading an image.
 *
 * @param {File|Blob} imageFile - JPEG, PNG, or WebP image (max 8 MB)
 * @param {object} [options]
 * @param {string} [options.embeddingModel] - "image-jina-clip-v2" or "image-gemini-2" (default)
 * @param {boolean} [options.onView=true] - Restrict matches to artworks currently on view
 * @returns {Promise<Array>} Top matching artworks, each with score + metadata
 */
export async function searchByImage(imageFile, options = {}) {
  const formData = new FormData();
  formData.append("image", imageFile);

  if (options.embeddingModel) {
    formData.append("embeddingModel", options.embeddingModel);
  }

  if (options.onView !== false) {
    formData.append("onView", "true");
  }

  // Call our own server-side proxy (keeps the bypass secret off the client)
  const res = await fetch("/api/scan", {
    method: "POST",
    body: formData,
    // Do NOT set Content-Type — the browser sets the multipart boundary automatically
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Image search failed (${res.status})`);
  }

  const data = await res.json();
  const hits = data.results?.hits || [];

  // Transform Elasticsearch hits into a simpler format for the app
  return hits.map((hit) => ({
    score: hit._score,
    id: String(hit._source?.crdId || ""),
    accessionNumber: hit._source?.accessionNumber || "",
    title: Array.isArray(hit._source?.title)
      ? hit._source.title[0]
      : hit._source?.title || "Untitled",
    artist: hit._source?.artistPrimary || "Unknown",
    dated: hit._source?.dated || "Date unknown",
    department: hit._source?.departmentName?.[0] || "",
    medium: hit._source?.medium || "",
    culture: hit._source?.culture || "",
    gallery: hit._source?.gallery || null,
    image: hit._source?.thumbnailUrl || null,
    description: hit._source?.description || hit._source?.visualDescription || null,
    isOnView: hit._source?.isOnView || false,
    creditLine: hit._source?.creditLine || "",
  }));
}
