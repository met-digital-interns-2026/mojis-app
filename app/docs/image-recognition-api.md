# Image Recognition API

The scan page uses an image similarity search API to identify artworks from photos. The backend is Elasticsearch with kNN vector search — you upload an image and it returns the most visually similar artworks from The Met's collection.

## Endpoint

```
POST https://staging-and-preview-web-git-semantic-search-the-met.vercel.app/api/search/image-similarity
```

This is a separate backend from the public Met Collection API (`collectionapi.metmuseum.org`). It's hosted on a Vercel preview deployment and requires a bypass header for authentication.

## How we use it

The browser never calls the upstream API directly. Instead:

1. **Browser** captures a photo on the `/scan` page
2. **Browser** sends it to our own `POST /api/scan` route (same origin)
3. **Server** (`src/app/api/scan/route.js`) forwards the image to the upstream API, attaching the `x-vercel-protection-bypass` header with the secret from `IMAGE_SEARCH_BYPASS_SECRET` env var
4. **Server** returns the results to the browser

This keeps the bypass secret server-side only.

## Request

Accepts `multipart/form-data` with these fields:

| Field          | Type   | Required | Description                                                    |
|----------------|--------|----------|----------------------------------------------------------------|
| image          | File   | Yes      | JPEG, PNG, or WebP. Max 8 MB.                                 |
| embeddingModel | string | No       | `"image-jina-clip-v2"` or `"image-gemini-2"` (default).       |
| onView         | string | No       | Set to `"true"` to restrict matches to artworks currently on view. |

**Do not set `Content-Type` manually** — the browser/runtime sets the multipart boundary automatically.

## Response

```json
{
  "fileName": "upload.jpg",
  "results": {
    "hits": [
      {
        "_index": "objects-semantic-...",
        "_id": "...",
        "_score": 0.954588,
        "_source": {
          "accessionNumber": "1989.363.30",
          "artistPrimary": "Zhao Mengfu",
          "title": ["Four anecdotes from the life of Wang Xizhi", "元　趙孟頫　行書右軍四事　卷"],
          "dated": "1310s",
          "departmentName": ["Asian Art"],
          "medium": "Handscroll; ink on paper",
          "culture": "China",
          "crdId": 40509,
          "thumbnailUrl": "https://images.metmuseum.org/CRDImages/as/web-additional/DP-24438-009.jpg",
          "gallery": null,
          "isOnView": false,
          "description": "...",
          "visualDescription": "...",
          "creditLine": "..."
        }
      }
    ],
    "took": 42,
    "total": 40
  }
}
```

Returns up to 40 results. `_score` ranges from 0 to 1, with higher being more similar. The `_source` contains the full object document (minus embeddings).

The app now always sends `onView=true` for scan requests, because visitors are scanning works in the galleries and we want to prefer only objects currently on display.

### Key `_source` fields

| Field              | Type            | Notes                                               |
|--------------------|-----------------|-----------------------------------------------------|
| `crdId`            | number          | Internal ID, used as artwork ID in the app          |
| `accessionNumber`  | string          | Museum accession number                             |
| `title`            | string[]        | Array of titles (English first, then original)      |
| `artistPrimary`    | string          | Primary artist name                                 |
| `dated`            | string          | Date display string                                 |
| `departmentName`   | string[]        | Department(s)                                       |
| `medium`           | string          | Materials/technique                                 |
| `culture`          | string          | Culture/origin                                      |
| `thumbnailUrl`     | string          | URL to a web-sized image                            |
| `gallery`          | string or null  | Gallery location (null if not on view)              |
| `isOnView`         | boolean         | Whether the object is currently displayed            |
| `description`      | string          | Curatorial description                              |
| `visualDescription`| string          | AI-generated visual description of the artwork      |

## Error responses

| Status | When                                               |
|--------|----------------------------------------------------|
| 400    | Missing file, wrong MIME type, or file > 8 MB      |
| 500    | Embedding generation or Elasticsearch query failed  |

## Authentication

The Vercel preview deployment uses [Deployment Protection](https://vercel.com/docs/security/deployment-protection). Access requires the `x-vercel-protection-bypass` header with a secret from:

**Vercel Dashboard → Project Settings → Deployment Protection → Protection Bypass for Automation**

This secret is stored as the `IMAGE_SEARCH_BYPASS_SECRET` environment variable (server-side only, no `NEXT_PUBLIC_` prefix).

## curl examples

```bash
# Basic search
curl -X POST https://staging-and-preview-web-git-semantic-search-the-met.vercel.app/api/search/image-similarity \
  -H "x-vercel-protection-bypass: <BYPASS_SECRET>" \
  -F "image=@./my-painting.jpg" \
  -F "onView=true"

# With a specific embedding model
curl -X POST https://staging-and-preview-web-git-semantic-search-the-met.vercel.app/api/search/image-similarity \
  -H "x-vercel-protection-bypass: <BYPASS_SECRET>" \
  -F "image=@./my-painting.jpg" \
  -F "onView=true" \
  -F "embeddingModel=image-jina-clip-v2"
```

## Score interpretation

In our scan page we filter to results with `_score >= 0.75` and show the top 3. Rough guide:

- **≥ 0.95**: Almost certainly the same artwork
- **0.85–0.95**: Strong match, likely correct
- **0.75–0.85**: Possible match, worth showing
- **< 0.75**: Probably not the right artwork
