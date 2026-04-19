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
const MET_MAP_API_URL = "https://map-api.prod.livingmap.com/v1/maps/the_met";
const MET_MAP_URL = "https://maps.metmuseum.org/poi";
const MET_MAP_LANGUAGE = "en-GB";
const MET_MAP_ZOOM = 19;
const MET_MAP_FALLBACK_BEARING = -61;

let metMapConfigPromise = null;

// Fix Met image URLs: /original/ paths often 404, /web-large/ works reliably.
export function fixMetImageUrl(url) {
  if (!url || typeof url !== "string") return url;
  return url.replace("/original/", "/web-large/");
}

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
      image: data.primaryImageSmall || data.primaryImage || null,
      description: buildDescription(data),
    };
  } catch (error) {
    console.error("Error fetching from Met API:", error);
    return null;
  }
}

export function extractGalleryNumber(gallery) {
  if (!gallery) return null;
  const match = String(gallery).match(/\b(?:Gallery\s*)?([A-Za-z]?\d+[A-Za-z]?)\b/i);
  return match ? match[1].toUpperCase() : null;
}

function getTranslatedText(entries, lang = MET_MAP_LANGUAGE) {
  if (!Array.isArray(entries)) return "";
  const entry = entries.find((item) => item.lang === lang) || entries[0];
  const text = entry?.text;

  if (typeof text === "string") return text;
  if (text && typeof text === "object") return text[lang] || Object.values(text)[0] || "";
  return "";
}

async function fetchMetMapConfig() {
  if (!metMapConfigPromise) {
    metMapConfigPromise = fetch(MET_MAP_API_URL)
      .then((response) => (response.ok ? response.json() : null))
      .catch((error) => {
        console.error("Error fetching Met map config:", error);
        metMapConfigPromise = null;
        return null;
      });
  }

  return metMapConfigPromise;
}

function isExactGalleryFeature(feature, galleryNumber) {
  const label = getTranslatedText(feature?.label?.name).trim().toUpperCase();
  const summary = getTranslatedText(feature?.information?.summary).trim().toUpperCase();
  const subcategory = feature?.categories?.subcategory?.id;

  return (
    subcategory === "gallery" &&
    (label === galleryNumber || summary === `GALLERY ${galleryNumber}`)
  );
}

function buildMetMapFeatureUrl(feature, bearing = MET_MAP_FALLBACK_BEARING) {
  const center = feature?.location?.center;
  const floor = feature?.location?.floor?.short_name;

  if (!feature?.id || !center?.latitude || !center?.longitude || !floor) {
    return null;
  }

  const params = new URLSearchParams({
    feature: feature.id,
    floor,
    lang: MET_MAP_LANGUAGE,
  });

  return `${MET_MAP_URL}?${params.toString()}#${MET_MAP_ZOOM}/${center.latitude}/${center.longitude}/${bearing}`;
}

export async function fetchMetMapUrlForGallery(gallery) {
  const galleryNumber = extractGalleryNumber(gallery);
  if (!galleryNumber) return null;

  const config = await fetchMetMapConfig();
  const floors = config?.floors || [];
  const mapCenter = config?.center;

  if (!floors.length || !mapCenter?.latitude || !mapCenter?.longitude) {
    return null;
  }

  const searches = floors.map(async (floor) => {
    const params = new URLSearchParams({
      query: galleryNumber,
      latitude: String(mapCenter.latitude),
      longitude: String(mapCenter.longitude),
      floor_id: String(floor.id),
      limit: "10",
      lang: MET_MAP_LANGUAGE,
    });

    try {
      const response = await fetch(`${MET_MAP_API_URL}/search?${params.toString()}`);
      if (!response.ok) return [];
      const result = await response.json();
      return result.data || [];
    } catch (error) {
      console.error("Error searching Met map:", error);
      return [];
    }
  });

  const features = (await Promise.all(searches)).flat();
  const galleryFeature =
    features.find((feature) => isExactGalleryFeature(feature, galleryNumber)) ||
    features.find((feature) => feature?.categories?.subcategory?.id === "gallery");

  return buildMetMapFeatureUrl(galleryFeature, config.bearing);
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
