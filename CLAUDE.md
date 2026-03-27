# Moji Museum

An interactive web app for visitors at The Metropolitan Museum of Art. Visitors scan artworks with their phone camera, react with emojis, and discuss art with other visitors.

## Project structure

```
app/                          # Next.js application (all code lives here)
├── src/app/
│   ├── page.js               # Homepage — trending artworks, category cards, comments
│   ├── scan/page.js           # Camera scan — capture photo → identify artwork via image similarity
│   ├── artwork/[id]/page.js   # Artwork detail — full info, emoji intensity reactions, comments
│   ├── rankings/page.js       # Leaderboard — most reacted/saved/commented artworks
│   ├── profile/page.js        # User profile — avatar, bio, favorites
│   ├── api/scan/route.js      # Server-side proxy for image similarity API (keeps secret off client)
│   ├── components/            # Shared UI: BottomNav, AuthModal, BookmarkButton, CommentsSection, SpeechBubble
│   ├── lib/
│   │   ├── image-search.js    # Client helper — sends image to /api/scan, parses results
│   │   ├── met-api.js         # Met Collection API (public, no auth) — fetch/search artworks
│   │   ├── supabase.js        # Supabase client init (database connection)
│   │   ├── db.js              # Database functions (reactions, comments, likes)
│   │   ├── auth.js            # Auth helpers (signUp, signIn, signOut)
│   │   └── guest.js           # Guest identity via localStorage
│   └── data/artworks.js       # Hardcoded artwork data (fallback when DB not connected)
├── supabase/schema.sql        # Database schema (reactions, comments, comment_likes)
├── docs/
│   └── image-recognition-api.md  # Full docs for the image similarity search endpoint
└── .env.local.example         # Environment variable template
prototype/                     # Design docs and overview
```

## Tech stack

- **Framework**: Next.js 16 (App Router) with React 19
- **Styling**: Tailwind CSS 4 + inline styles
- **Database**: Supabase (PostgreSQL + Row-Level Security)
- **Auth**: Supabase Auth (email/password) with guest mode fallback
- **Image recognition**: Elasticsearch kNN vector search via The Met's semantic search API

## Two backends

1. **Met Collection API** (`collectionapi.metmuseum.org`) — public, no auth, used for fetching artwork metadata by object ID. See `lib/met-api.js`.

2. **Image similarity API** (Vercel preview deployment) — POST an image, get visually similar artworks back. Requires a bypass secret for Vercel deployment protection. Proxied through `/api/scan` to keep the secret server-side. See `docs/image-recognition-api.md`.

## Environment variables

Copy `.env.local.example` to `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL         # Supabase project URL (client-safe)
NEXT_PUBLIC_SUPABASE_ANON_KEY    # Supabase anon key (client-safe, RLS protects data)
IMAGE_SEARCH_BYPASS_SECRET       # Vercel deployment protection bypass (SERVER-SIDE ONLY)
```

The app works without any env vars — it falls back to hardcoded data and the scan page will attempt the API without auth.

## Development

```bash
cd app
npm install
npm run dev          # http://localhost:3000
```

## Key patterns

- **Offline-first**: Everything works with hardcoded data when Supabase isn't configured. The `isConnected()` check in `lib/supabase.js` gates database calls.
- **Guest identity**: Auto-generated "Guest-XXXX" ID stored in localStorage. No sign-up required to react and comment.
- **Server-side secrets**: The image search bypass secret is only used in the `/api/scan` route handler, never exposed to the browser. Any new secrets should follow this pattern.
- **Emoji intensity reactions**: 8 emotion categories × 4 intensity levels each. One reaction per visitor per artwork (upsert).

## Database schema

Three tables in Supabase (see `supabase/schema.sql`):

- **reactions** — artwork_id, guest_id, category, level, emoji (unique per guest+artwork)
- **comments** — artwork_id, guest_id, guest_name, emoji, text, parent_id (for replies)
- **comment_likes** — comment_id, guest_id (unique per guest+comment)

All tables have RLS enabled: anyone can read, anyone can insert, users can only update/delete their own rows.
