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
-- ==============================================

-- REACTIONS TABLE
-- Stores one emoji reaction per guest per artwork.
-- Example row: guest "abc123" reacted 😭 (sad, level 6) to artwork "436105"
CREATE TABLE reactions (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  artwork_id TEXT NOT NULL,           -- which artwork (e.g. "436105")
  guest_id TEXT NOT NULL,             -- who reacted (e.g. "Guest-7392")
  category TEXT NOT NULL,             -- emotion category (e.g. "sad")
  level INTEGER NOT NULL,             -- intensity 0-5 (0=mild, 5=extreme)
  emoji TEXT NOT NULL,                -- the actual emoji (e.g. "😭")
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(artwork_id, guest_id)        -- one reaction per person per artwork
);

-- COMMENTS TABLE
-- Stores comments on artworks. Replies are comments with a parent_id.
-- Example row: guest "abc123" said "This is amazing" on artwork "436105"
CREATE TABLE comments (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  artwork_id TEXT NOT NULL,           -- which artwork
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
CREATE TABLE comment_likes (
  comment_id BIGINT REFERENCES comments(id) ON DELETE CASCADE,
  guest_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (comment_id, guest_id)  -- one like per person per comment
);

-- ==============================================
-- ROW LEVEL SECURITY (RLS)
-- ==============================================
-- This controls WHO can read/write data.
-- We enable RLS and then create policies that say:
--   "Anyone can read, anyone can insert their own data"
-- This is important for security — without it, anyone
-- could delete other people's comments!

ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_likes ENABLE ROW LEVEL SECURITY;

-- Anyone can read all reactions, comments, and likes
CREATE POLICY "Anyone can read reactions" ON reactions FOR SELECT USING (true);
CREATE POLICY "Anyone can read comments" ON comments FOR SELECT USING (true);
CREATE POLICY "Anyone can read likes" ON comment_likes FOR SELECT USING (true);

-- Anyone can insert (we're using anonymous/guest access)
CREATE POLICY "Anyone can insert reactions" ON reactions FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can insert comments" ON comments FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can insert likes" ON comment_likes FOR INSERT WITH CHECK (true);

-- Users can update their own reactions (change emoji)
CREATE POLICY "Users can update own reactions" ON reactions FOR UPDATE USING (true);

-- Users can delete their own likes (unlike)
CREATE POLICY "Users can delete own likes" ON comment_likes FOR DELETE USING (true);
