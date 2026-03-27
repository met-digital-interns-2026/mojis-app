-- ==============================================
-- Reset — drops all Moji Museum tables
-- ==============================================
-- Run this in the Supabase SQL Editor BEFORE re-running schema.sql
-- if you want a fresh start.
--
-- ⚠️  This deletes ALL data permanently. No undo.
-- ==============================================

DROP TABLE IF EXISTS comment_likes CASCADE;
DROP TABLE IF EXISTS comments CASCADE;
DROP TABLE IF EXISTS reactions CASCADE;
DROP TABLE IF EXISTS artworks CASCADE;
