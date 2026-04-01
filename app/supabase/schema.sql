-- ==============================================
-- Moji Museum Database Schema
-- ==============================================
-- This file defines the "tables" in our database.
-- Think of each table as a spreadsheet:
--   - The table name is the sheet name
--   - Each column is a header
--   - Each row is one entry
--
-- To set this up:
--   1. Go to supabase.com and create a free project
--   2. Go to SQL Editor (left sidebar)
--   3. Paste this entire file and click "Run"
--
-- To reset everything (drop all tables and start over):
--   Run supabase/reset.sql first, then run this file again.
-- ==============================================

-- ARTWORKS TABLE
-- Stores metadata about artworks that visitors have interacted with.
-- We cache artwork info here so the homepage and rankings can load fast
-- without calling the Met API for every artwork on every page load.
-- Example row: "436105", "The Death of Socrates", "Jacques-Louis David", ...
CREATE TABLE IF NOT EXISTS artworks (
  id TEXT PRIMARY KEY,                 -- Met object ID (e.g. "436105")
  title TEXT NOT NULL,                 -- artwork title
  artist TEXT NOT NULL DEFAULT 'Unknown',
  year TEXT,                           -- display date (e.g. "1787", "ca. 1830–32")
  image TEXT,                          -- primary image URL
  medium TEXT,                         -- materials (e.g. "Oil on canvas")
  department TEXT,                     -- Met department (e.g. "European Paintings")
  gallery TEXT,                        -- gallery location (e.g. "Gallery 760")
  fact TEXT,                           -- fun fact / curatorial note
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- REACTIONS TABLE
-- Stores one emoji reaction per guest per artwork.
-- Example row: guest "abc123" reacted 😭 (sad, level 3) to artwork "436105"
CREATE TABLE IF NOT EXISTS reactions (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  artwork_id TEXT NOT NULL REFERENCES artworks(id) ON DELETE CASCADE,
  guest_id TEXT NOT NULL,             -- who reacted (e.g. "Guest-7392")
  category TEXT NOT NULL,             -- emotion category (e.g. "sad")
  level INTEGER NOT NULL,             -- intensity 0-3 (0=mild, 3=extreme)
  emoji TEXT NOT NULL,                -- the actual emoji (e.g. "😭")
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(artwork_id, guest_id)        -- one reaction per person per artwork
);

-- COMMENTS TABLE
-- Stores comments on artworks. Replies are comments with a parent_id.
-- Example row: guest "abc123" said "This is amazing" on artwork "436105"
CREATE TABLE IF NOT EXISTS comments (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  artwork_id TEXT NOT NULL REFERENCES artworks(id) ON DELETE CASCADE,
  guest_id TEXT NOT NULL,             -- who wrote it
  guest_name TEXT NOT NULL,           -- display name (e.g. "Guest-7392")
  emoji TEXT NOT NULL DEFAULT '💬',   -- their reaction emoji (shows next to name)
  text TEXT NOT NULL,                 -- the comment text
  parent_id BIGINT REFERENCES comments(id) ON DELETE CASCADE,  -- null = top-level, set = reply
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- COMMENT_LIKES TABLE
-- Tracks who liked which comment (prevents double-liking).
-- Example row: guest "abc123" liked comment #5
CREATE TABLE IF NOT EXISTS comment_likes (
  comment_id BIGINT REFERENCES comments(id) ON DELETE CASCADE,
  guest_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (comment_id, guest_id)  -- one like per person per comment
);

-- ==============================================
-- INDEXES
-- ==============================================
-- Speed up common queries (looking up reactions/comments by artwork).

CREATE INDEX IF NOT EXISTS idx_reactions_artwork ON reactions(artwork_id);
CREATE INDEX IF NOT EXISTS idx_reactions_guest ON reactions(artwork_id, guest_id);
CREATE INDEX IF NOT EXISTS idx_comments_artwork ON comments(artwork_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent ON comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_comment_likes_guest ON comment_likes(comment_id, guest_id);

-- ==============================================
-- ROW LEVEL SECURITY (RLS)
-- ==============================================
-- This controls WHO can read/write data.
-- We enable RLS and then create policies that say:
--   "Anyone can read, anyone can insert their own data"
-- This is important for security — without it, anyone
-- could delete other people's comments!

ALTER TABLE artworks ENABLE ROW LEVEL SECURITY;
ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_likes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read artworks" ON artworks;
DROP POLICY IF EXISTS "Anyone can read reactions" ON reactions;
DROP POLICY IF EXISTS "Anyone can read comments" ON comments;
DROP POLICY IF EXISTS "Anyone can read likes" ON comment_likes;
DROP POLICY IF EXISTS "Anyone can insert artworks" ON artworks;
DROP POLICY IF EXISTS "Anyone can insert reactions" ON reactions;
DROP POLICY IF EXISTS "Anyone can insert comments" ON comments;
DROP POLICY IF EXISTS "Anyone can insert likes" ON comment_likes;
DROP POLICY IF EXISTS "Anyone can update artworks" ON artworks;
DROP POLICY IF EXISTS "Users can update own reactions" ON reactions;
DROP POLICY IF EXISTS "Users can delete own likes" ON comment_likes;

-- Anyone can read everything
CREATE POLICY "Anyone can read artworks" ON artworks FOR SELECT USING (true);
CREATE POLICY "Anyone can read reactions" ON reactions FOR SELECT USING (true);
CREATE POLICY "Anyone can read comments" ON comments FOR SELECT USING (true);
CREATE POLICY "Anyone can read likes" ON comment_likes FOR SELECT USING (true);

-- Client writes are intentionally blocked.
-- Reactions, comments, likes, and artwork upserts now go through server routes
-- with a signed guest cookie plus the Supabase service role key.
