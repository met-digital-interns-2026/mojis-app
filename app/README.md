# Moji Museum

Moji Museum is a Next.js app for reacting to artworks from The Met with emoji-based emotional responses, comments, replies, likes, scan-based artwork discovery, rankings, and lightweight profiles.

The app is designed to feel low-friction:
- visitors can participate immediately without creating an account
- artworks can be discovered by image scan
- reactions and comments persist
- optional sign-in exists, but the core interaction model is guest-first

## What The App Does

Main user flows:
- `Home`: shows top-reacted artworks by emotional category
- `Artwork detail`: lets visitors react, comment, reply, and like comments
- `Scan`: identifies artworks from a photo, then stores the match so it can be reacted to
- `Gallery`: shows artworks that have been discovered and stored
- `Rankings`: shows most-reacted and most-liked artworks
- `Profile`: stores local profile preferences like username, avatar, bio, and favorites

## Stack

- Next.js 16 App Router
- React 19
- Supabase for data storage and optional auth
- The Met Collection API for artwork metadata
- A proxied image-similarity API for scan recognition

## Guest Mode Overview

The app now uses a server-issued guest identity for trust-sensitive actions.

How it works:
- on first write/read through the interaction APIs, the server creates a random guest ID
- that guest ID is signed and stored in an `HttpOnly` cookie
- the browser cannot read or forge that cookie value
- writes for reactions, comments, replies, likes, and artwork upserts go through server routes
- those server routes use the signed guest cookie plus the Supabase service role key

Why this exists:
- older versions of the app trusted a client-generated `localStorage` guest ID
- that made it easy to impersonate other guests or tamper with reactions and likes
- the current model keeps guest participation frictionless while moving trust to the server

Important limitation:
- guest display names are still cosmetic, not authoritative
- the trusted identity is the signed guest cookie, not the visible username

## Optional Accounts

Supabase Auth is available, but it is currently optional.

Current behavior:
- sign-in does not replace guest mode
- sign-in does not yet migrate guest reactions/comments to an account
- guest participation is still the primary interaction path

Profile data such as avatar, bio, username, and favorites is still stored locally in browser storage.

## High-Level Architecture

### Client-side reads

Public reads still use the browser Supabase client for low-friction access:
- artwork metadata
- rankings
- homepage category leaders
- reaction totals

### Server-side trusted writes

Trusted writes go through Next API routes:
- `POST /api/artworks`
- `GET/POST /api/reactions/[artworkId]`
- `GET/POST /api/comments/[artworkId]`
- `POST /api/comment-likes`
- `POST /api/comment-likes/[commentId]`
- `POST /api/scan`

### Server helpers

Key server files:
- [src/app/lib/server/guest-session.js](/Users/dau/Projects/Met/Github/mojis-app/app/src/app/lib/server/guest-session.js)
- [src/app/lib/server/supabase-admin.js](/Users/dau/Projects/Met/Github/mojis-app/app/src/app/lib/server/supabase-admin.js)
- [src/app/lib/server/interactions.js](/Users/dau/Projects/Met/Github/mojis-app/app/src/app/lib/server/interactions.js)

Key client data helper:
- [src/app/lib/db.js](/Users/dau/Projects/Met/Github/mojis-app/app/src/app/lib/db.js)

## Environment Variables

Create `app/.env.local` with:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
NEXT_PUBLIC_LOCALE=en
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
GUEST_SESSION_SECRET=replace-with-a-long-random-string
IMAGE_SEARCH_BYPASS_SECRET=your-bypass-secret-here
```

Notes:
- `SUPABASE_SERVICE_ROLE_KEY` must stay server-only
- `GUEST_SESSION_SECRET` should be long and random
- `IMAGE_SEARCH_BYPASS_SECRET` is only needed for the scan API proxy
- `NEXT_PUBLIC_LOCALE` controls the default UI copy; visitors can switch between `en` and `es` in the app

Generate a secret with:

```bash
openssl rand -base64 48
```

## Supabase Setup

For a new project:
1. Create a Supabase project
2. Run [supabase/schema.sql](/Users/dau/Projects/Met/Github/mojis-app/app/supabase/schema.sql)
3. Optionally run [supabase/seed.sql](/Users/dau/Projects/Met/Github/mojis-app/app/supabase/seed.sql)

For an existing project that used the older anonymous browser-write model:
1. Deploy the current app with the new env vars
2. Run [supabase/harden_rls.sql](/Users/dau/Projects/Met/Github/mojis-app/app/supabase/harden_rls.sql)

Do not run [supabase/reset.sql](/Users/dau/Projects/Met/Github/mojis-app/app/supabase/reset.sql) unless you intentionally want to delete all data.

## Local Development

Install dependencies and run the dev server:

```bash
npm install
npm run dev
```

Then open:

```text
http://localhost:3000
```

Useful commands:

```bash
npm run lint
npm run build
```

## Project Structure

Top-level folders and files:
- `src/app/`: Next.js app router pages, components, API routes, and libs
- `public/`: static assets
- `supabase/`: schema, reset, seed, and hardening SQL
- `docs/`: notes on the image recognition API
- `prototype/`: early design/prototype files outside the shipped app

Important app areas:
- `src/app/page.js`: homepage
- `src/app/artwork/[id]/page.js`: artwork detail
- `src/app/scan/page.js`: camera and image upload flow
- `src/app/gallery/page.js`: discovered artworks
- `src/app/rankings/page.js`: ranking views
- `src/app/profile/page.js`: local profile and optional auth

## Interaction Model

### Reactions

- one guest can have one reaction per artwork
- reactions are stored in Supabase
- rankings and homepage category leaders are derived from reaction counts

### Comments and likes

- comments, replies, and likes are persisted
- comment interactions now use one shared DB-backed path instead of local-only UI state
- likes are tied to the server-issued guest identity

### Favorites and profile

- favorites, avatar, bio, and display name are currently stored in browser storage
- they are convenience/profile settings, not trusted identity

## Scan Flow

The scan page:
1. captures a photo from camera or file upload
2. sends it to `/api/scan`
3. proxies to the upstream similarity service with a server-side bypass secret
4. stores matched artworks in the local Supabase dataset so reactions/comments can work immediately

## Current Limitations

- guest display names are not unique or verified
- optional auth does not yet migrate guest history into an account
- there is no rate limiting yet
- moderation/profanity/spam controls are not implemented yet
- some pages still use plain `<img>` tags, which show lint warnings but do not block builds

## Deployment Notes

On Vercel:
1. add all required environment variables
2. redeploy
3. if upgrading an existing database, run `supabase/harden_rls.sql`

If the app is deployed without `SUPABASE_SERVICE_ROLE_KEY` or `GUEST_SESSION_SECRET`, trusted interaction routes will fail.
