// Met Museum API helper.
//
// The Metropolitan Museum of Art has a free, public API.
// No sign-up or API key needed — you just make a request and get data back.
//
// What is an API?
//   It's like a waiter at a restaurant. You (the app) give it an order
//   (an artwork ID), it goes to the kitchen (Met's servers), and brings
//   back your food (artwork data as JSON).
//
// What is JSON?
//   It's a way to write data that computers can read. It looks like:
//   { "title": "Water Lilies", "artist": "Claude Monet", "year": 1919 }
//
// API docs: https://metmuseum.github.io/

const BASE_URL = "https://collectionapi.metmuseum.org/public/collection/v1";

// Fetch one artwork by its Met object ID.
// Returns a simplified object with just the fields we need,
// or null if the artwork doesn't exist.
export async function fetchArtwork(objectId) {
  try {
    const response = await fetch(`${BASE_URL}/objects/${objectId}`);

    if (!response.ok) return null;

    const data = await response.json();

    // The API returns a LOT of fields — we only need a few.
    // This is like ordering a full meal but only eating the parts you like.
    return {
      id: String(data.objectID),
      title: data.title || "Untitled",
      artist: data.artistDisplayName || "Unknown",
      year: data.objectDate || "Date unknown",
      medium: data.medium || "",
      dimensions: data.dimensions || "",
      gallery: data.GalleryNumber ? `Gallery ${data.GalleryNumber}` : null,
      department: data.department || "",
      image: data.primaryImage || data.primaryImageSmall || null,
      description: buildDescription(data),
    };
  } catch (error) {
    console.error("Error fetching from Met API:", error);
    return null;
  }
}

// Build a short description from the available metadata.
// The Met API doesn't have a "description" field, so we piece one together.
function buildDescription(data) {
  const parts = [];

  if (data.objectDate) {
    parts.push(`Created ${data.objectDate}.`);
  }
  if (data.medium) {
    parts.push(`${data.medium}.`);
  }
  if (data.creditLine) {
    parts.push(data.creditLine + ".");
  }
  if (data.department) {
    parts.push(`Part of the ${data.department} collection.`);
  }

  return parts.join(" ") || null;
}

// Search for artworks by keyword.
// Returns an array of object IDs (not full artwork data — you need to
// call fetchArtwork() on each ID to get the details).
export async function searchArtworks(query, limit = 10) {
  try {
    const response = await fetch(
      `${BASE_URL}/search?hasImages=true&q=${encodeURIComponent(query)}`
    );

    if (!response.ok) return [];

    const data = await response.json();

    if (!data.objectIDs || data.objectIDs.length === 0) return [];

    // Only return the first `limit` results
    return data.objectIDs.slice(0, limit);
  } catch (error) {
    console.error("Error searching Met API:", error);
    return [];
  }
}

// Fetch multiple artworks at once.
// Fetches them in parallel for speed (instead of one-by-one).
export async function fetchMultipleArtworks(objectIds) {
  const results = await Promise.all(
    objectIds.map(id => fetchArtwork(id))
  );
  // Filter out any that failed (returned null)
  return results.filter(Boolean);
}
