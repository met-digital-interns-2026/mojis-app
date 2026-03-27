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
│   │   ├── db.js              # Database functions (reactions, comments, likes, rankings, artworks)
│   │   ├── auth.js            # Auth helpers (signUp, signIn, signOut)
│   │   └── guest.js           # Guest identity via localStorage
│   └── data/artworks.js       # Hardcoded artwork data (fallback when DB not connected)
├── supabase/
│   ├── schema.sql             # Database schema (artworks, reactions, comments, comment_likes)
│   ├── seed.sql               # Test data: 10 artworks, ~80 reactions, ~30 comments, ~40 likes
│   └── reset.sql              # Drop all tables (for starting over)
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

Four tables in Supabase (see `supabase/schema.sql`):

- **artworks** — id (Met object ID, PK), title, artist, year, image, medium, department, gallery, fact
- **reactions** — artwork_id (FK→artworks), guest_id, category, level, emoji (unique per guest+artwork)
- **comments** — artwork_id (FK→artworks), guest_id, guest_name, emoji, text, parent_id (for replies)
- **comment_likes** — comment_id (FK→comments), guest_id (unique per guest+comment)

All tables have RLS enabled: anyone can read, anyone can insert. Artworks and reactions allow updates (needed for upsert). Comment likes allow deletes (for unliking). **Important**: Supabase `upsert` requires both INSERT and UPDATE RLS policies — missing the UPDATE policy causes silent failures.

### Setting up the database

1. Run `supabase/schema.sql` in the Supabase SQL Editor to create tables
2. Run `supabase/seed.sql` to populate with test data (10 artworks, ~80 reactions, ~30 comments)
3. To reset: run `supabase/reset.sql` then repeat steps 1-2

### DB integration pattern

All pages try to load from the database first, then fall back to the hardcoded data in `data/artworks.js` when Supabase isn't configured. The key functions in `lib/db.js`:

- `getArtwork(id)` — single artwork lookup
- `getTopByCategory()` — homepage: top-reacted artwork per emotion category
- `getArtworkRankings()` — rankings: artworks sorted by total reaction count
- `getCommentHeartRankings()` — rankings: artworks sorted by comment like count
- `getReactionCounts(id)` / `getMyReaction(id, guestId)` / `saveReaction(...)` — reaction CRUD
- `getComments(id)` / `addComment(...)` — comment CRUD with nested reply trees
- `toggleLike(commentId, guestId)` / `getMyLikes(...)` — like CRUD
- `upsertArtwork(artwork)` — insert/update artwork metadata (used by scan page)
