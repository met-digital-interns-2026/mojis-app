-- ==============================================
-- Harden RLS for server-issued guest sessions
-- ==============================================
-- Run this once on an existing project to remove the old anonymous
-- browser-write policies after deploying the server routes.
--
-- Reads stay public. Writes must go through the app server using the
-- Supabase service role key plus the signed HttpOnly guest cookie.
-- ==============================================

ALTER TABLE artworks ENABLE ROW LEVEL SECURITY;
ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_likes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can insert artworks" ON artworks;
DROP POLICY IF EXISTS "Anyone can insert reactions" ON reactions;
DROP POLICY IF EXISTS "Anyone can insert comments" ON comments;
DROP POLICY IF EXISTS "Anyone can insert likes" ON comment_likes;
DROP POLICY IF EXISTS "Anyone can update artworks" ON artworks;
DROP POLICY IF EXISTS "Users can update own reactions" ON reactions;
DROP POLICY IF EXISTS "Users can delete own likes" ON comment_likes;
