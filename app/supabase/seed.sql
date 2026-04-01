-- ==============================================
-- Moji Museum — Seed Data
-- ==============================================
-- Fills the database with realistic test data so the app looks alive.
-- Run this AFTER schema.sql.
--
-- What's in here:
--   • 10 real artworks from The Met (with real image URLs)
--   • ~80 emoji reactions spread across the artworks
--   • ~30 comments with nested replies
--   • ~40 comment likes
--
-- All guest IDs are fake (Guest-XXXX format) to match the app's
-- guest identity system.
-- ==============================================

-- ==============================================
-- ARTWORKS
-- ==============================================
-- These are real Met objects with real IDs and image URLs.

INSERT INTO artworks (id, title, artist, year, image, medium, department, gallery, fact) VALUES
  ('436105',
   'The Death of Socrates',
   'Jacques-Louis David',
   '1787',
   'https://images.metmuseum.org/CRDImages/ep/web-large/DP-13139-001.jpg',
   'Oil on canvas',
   'European Paintings',
   'Gallery 614',
   'Painted just two years before the French Revolution, David chose this subject to stir the spirit of civic duty over self-interest sweeping Europe. Socrates, condemned for his beliefs, chose death by hemlock over exile — a decision that still unsettles viewers today.'),

  ('437984',
   'Water Lilies',
   'Claude Monet',
   '1919',
   'https://images.metmuseum.org/CRDImages/ep/web-large/DP-19279-001.jpg',
   'Oil on canvas',
   'European Paintings',
   'Gallery 819',
   'Monet began his Water Lilies series as cataracts slowly destroyed his sight, blurring color and softening edges. Art historians believe his increasingly luminous, abstract style was shaped by what he could no longer clearly see — turning failing vision into one of art''s greatest achievements.'),

  ('35829',
   'Armor Garniture',
   'Attributed to Kolman Helmschmid',
   'ca. 1525',
   'https://images.metmuseum.org/CRDImages/aa/web-large/DP-12881-005.jpg',
   'Steel, gold, leather, copper alloys',
   'Arms and Armor',
   'Gallery 371',
   'Crafted for a member of Emperor Maximilian I''s court around 1525, this suit weighs over 50 lbs yet allowed near-full range of motion — every joint was engineered to move with the body. The intricate engraving covering every surface made it as much a statement of extreme wealth as a weapon of war.'),

  ('45434',
   'Under the Wave off Kanagawa (Kanagawa oki nami ura), also known as The Great Wave',
   'Katsushika Hokusai',
   'ca. 1830–32',
   'https://images.metmuseum.org/CRDImages/as/web-large/DP130155.jpg',
   'Woodblock print; ink and color on paper',
   'Asian Art',
   'Gallery 231',
   'Often mistaken for a painting, this is actually a woodblock print — one of roughly 5,000–8,000 original copies Hokusai produced. The tiny white peak in the upper right isn''t seafoam: it''s Mount Fuji, deliberately dwarfed to show the overwhelming power of nature over the familiar and permanent.'),

  ('544',
   'Sphinx of Hatshepsut',
   'Unknown',
   'ca. 1479–1458 B.C.',
   'https://images.metmuseum.org/CRDImages/ad/web-large/ADA3901.jpg',
   'Granite, paint',
   'Egyptian Art',
   'Gallery 115',
   'Hatshepsut ruled Egypt for over 20 years as one of its most successful pharaohs, but after her death her successor tried to erase her from history — smashing her statues and chiseling her name from monuments. This sphinx survived only because it was buried under rubble, hidden for thousands of years.'),

  ('11417',
   'Washington Crossing the Delaware',
   'Emanuel Leutze',
   '1851',
   'https://images.metmuseum.org/CRDImages/ad/web-large/DP215410.jpg',
   'Oil on canvas',
   'The American Wing',
   'Gallery 760',
   'Leutze painted this in Germany, not America — using fellow immigrants as models and creating it to inspire European liberals with ideals of freedom. The flag shown didn''t exist in 1776, but Leutze chose emotional truth over historical accuracy, and it became one of the most recognizable images in American history.'),

  ('11507',
   'The Rocky Mountains, Lander''s Peak',
   'Albert Bierstadt',
   '1863',
   'https://images.metmuseum.org/CRDImages/ad/web-large/DP161472.jpg',
   'Oil on canvas',
   'The American Wing',
   'Gallery 760',
   'Bierstadt never actually visited Lander''s Peak — he composited this scene from sketches made during separate trips, creating an idealized vision of the American West that helped drive westward expansion.'),

  ('10159',
   'Fur Traders Descending the Missouri',
   'George Caleb Bingham',
   '1845',
   'https://images.metmuseum.org/CRDImages/ad/web-large/DT73.jpg',
   'Oil on canvas',
   'The American Wing',
   'Gallery 759',
   'The mysterious dark figure at the front of the canoe is actually a pet bear cub, chained to the boat. Bingham originally titled this "French Trader — Half Breed Son" but changed it when the American Art-Union thought it was too controversial.'),

  ('10814',
   'Heart of the Andes',
   'Frederic Edwin Church',
   '1859',
   'https://images.metmuseum.org/CRDImages/ad/web-large/ap25.97.5.jpg',
   'Oil on canvas',
   'The American Wing',
   'Gallery 760',
   'When this painting was first exhibited, thousands paid 25 cents each to see it in a single darkened room, lit by gas jets. Visitors brought opera glasses to examine the extraordinary botanical detail — Church had spent two years sketching plants in South America.'),

  ('11189',
   'The Veteran in a New Field',
   'Winslow Homer',
   '1865',
   'https://images.metmuseum.org/CRDImages/ad/web-large/ap87.15.78.jpg',
   'Oil on canvas',
   'The American Wing',
   'Gallery 764',
   'Painted just after the Civil War ended and Lincoln was assassinated, this seemingly peaceful harvest scene carries a heavy double meaning — the veteran''s scythe recalls the Grim Reaper, and the golden wheat evokes both abundance and the countless lives cut short by war.');


-- ==============================================
-- REACTIONS
-- ==============================================
-- Spread across all 10 artworks with different emotion categories.
-- Each guest can only react once per artwork (UNIQUE constraint).

INSERT INTO reactions (artwork_id, guest_id, category, level, emoji) VALUES
  -- The Death of Socrates (sad/shocking)
  ('436105', 'Guest-1001', 'sad',        3, '😭'),
  ('436105', 'Guest-1002', 'sad',        2, '😢'),
  ('436105', 'Guest-1003', 'sad',        1, '😞'),
  ('436105', 'Guest-1004', 'mindblowing',2, '🤯'),
  ('436105', 'Guest-1005', 'mindblowing',1, '😮'),
  ('436105', 'Guest-1006', 'confused',   1, '😵‍💫'),
  ('436105', 'Guest-1007', 'sad',        3, '😭'),
  ('436105', 'Guest-1008', 'mindblowing',3, '✨'),

  -- Water Lilies (love/beautiful)
  ('437984', 'Guest-2001', 'love',       3, '💖'),
  ('437984', 'Guest-2002', 'love',       2, '❤️‍🔥'),
  ('437984', 'Guest-2003', 'love',       3, '💖'),
  ('437984', 'Guest-2004', 'love',       1, '😍'),
  ('437984', 'Guest-2005', 'mindblowing',2, '🤯'),
  ('437984', 'Guest-2006', 'love',       2, '❤️‍🔥'),
  ('437984', 'Guest-2007', 'love',       3, '💖'),
  ('437984', 'Guest-2008', 'mindblowing',1, '😮'),
  ('437984', 'Guest-2009', 'love',       1, '😍'),
  ('437984', 'Guest-2010', 'love',       3, '💖'),

  -- Armor Garniture (scary/shocking)
  ('35829',  'Guest-3001', 'scary',      2, '😱'),
  ('35829',  'Guest-3002', 'mindblowing',2, '🤯'),
  ('35829',  'Guest-3003', 'scary',      1, '😨'),
  ('35829',  'Guest-3004', 'mindblowing',3, '✨'),
  ('35829',  'Guest-3005', 'angry',      1, '😡'),
  ('35829',  'Guest-3006', 'scary',      3, '👻'),
  ('35829',  'Guest-3007', 'mindblowing',1, '😮'),

  -- The Great Wave (confused/mindblowing)
  ('45434',  'Guest-4001', 'confused',   0, '🤔'),
  ('45434',  'Guest-4002', 'love',       1, '😍'),
  ('45434',  'Guest-4003', 'confused',   0, '🤔'),
  ('45434',  'Guest-4004', 'mindblowing',2, '🤯'),
  ('45434',  'Guest-4005', 'love',       2, '❤️‍🔥'),
  ('45434',  'Guest-4006', 'confused',   1, '😵‍💫'),
  ('45434',  'Guest-4007', 'mindblowing',3, '✨'),
  ('45434',  'Guest-4008', 'love',       1, '😍'),
  ('45434',  'Guest-4009', 'confused',   0, '🤔'),

  -- Sphinx of Hatshepsut (love/mindblowing)
  ('544',    'Guest-5001', 'love',       1, '😍'),
  ('544',    'Guest-5002', 'mindblowing',2, '🤯'),
  ('544',    'Guest-5003', 'love',       2, '❤️‍🔥'),
  ('544',    'Guest-5004', 'love',       1, '😍'),
  ('544',    'Guest-5005', 'mindblowing',1, '😮'),
  ('544',    'Guest-5006', 'love',       3, '💖'),
  ('544',    'Guest-5007', 'scary',      1, '😨'),
  ('544',    'Guest-5008', 'love',       2, '❤️‍🔥'),

  -- Washington Crossing the Delaware (love/mindblowing)
  ('11417',  'Guest-6001', 'love',       1, '😍'),
  ('11417',  'Guest-6002', 'mindblowing',2, '🤯'),
  ('11417',  'Guest-6003', 'love',       2, '❤️‍🔥'),
  ('11417',  'Guest-6004', 'mindblowing',1, '😮'),
  ('11417',  'Guest-6005', 'love',       3, '💖'),
  ('11417',  'Guest-6006', 'funny',      0, '😏'),
  ('11417',  'Guest-6007', 'love',       1, '😍'),
  ('11417',  'Guest-6008', 'confused',   0, '🤔'),
  ('11417',  'Guest-6009', 'love',       2, '❤️‍🔥'),

  -- Rocky Mountains (love)
  ('11507',  'Guest-7001', 'love',       1, '😍'),
  ('11507',  'Guest-7002', 'love',       3, '💖'),
  ('11507',  'Guest-7003', 'mindblowing',2, '🤯'),
  ('11507',  'Guest-7004', 'love',       2, '❤️‍🔥'),
  ('11507',  'Guest-7005', 'love',       1, '😍'),

  -- Fur Traders (confused/love)
  ('10159',  'Guest-8001', 'confused',   0, '🤔'),
  ('10159',  'Guest-8002', 'love',       1, '😍'),
  ('10159',  'Guest-8003', 'confused',   1, '😵‍💫'),
  ('10159',  'Guest-8004', 'love',       2, '❤️‍🔥'),

  -- Heart of the Andes (love/mindblowing)
  ('10814',  'Guest-9001', 'love',       2, '❤️‍🔥'),
  ('10814',  'Guest-9002', 'mindblowing',3, '✨'),
  ('10814',  'Guest-9003', 'love',       1, '😍'),
  ('10814',  'Guest-9004', 'mindblowing',2, '🤯'),
  ('10814',  'Guest-9005', 'love',       3, '💖'),
  ('10814',  'Guest-9006', 'love',       1, '😍'),

  -- Veteran in a New Field (sad/confused)
  ('11189',  'Guest-0001', 'sad',        1, '😞'),
  ('11189',  'Guest-0002', 'confused',   0, '🤔'),
  ('11189',  'Guest-0003', 'sad',        2, '😢'),
  ('11189',  'Guest-0004', 'love',       1, '😍'),
  ('11189',  'Guest-0005', 'sad',        3, '😭');


-- ==============================================
-- COMMENTS
-- ==============================================
-- Top-level comments first, then replies reference them.
-- We use a CTE trick to grab the auto-generated IDs.

-- The Death of Socrates
WITH c1 AS (
  INSERT INTO comments (artwork_id, guest_id, guest_name, emoji, text)
  VALUES ('436105', 'Guest-1001', 'ArtLover42', '😢', 'This one hits different when you see it in person')
  RETURNING id
),
r1a AS (
  INSERT INTO comments (artwork_id, guest_id, guest_name, emoji, text, parent_id)
  VALUES ('436105', 'Guest-1005', 'MuseumGuide', '😮', 'Right?? The painting is over 10 feet wide!', (SELECT id FROM c1))
  RETURNING id
),
r1b AS (
  INSERT INTO comments (artwork_id, guest_id, guest_name, emoji, text, parent_id)
  VALUES ('436105', 'Guest-1003', 'ClassicsFan', '😢', 'I literally teared up standing in front of it', (SELECT id FROM c1))
  RETURNING id
),
c2 AS (
  INSERT INTO comments (artwork_id, guest_id, guest_name, emoji, text)
  VALUES ('436105', 'Guest-1006', 'MuseumKid', '😮', 'Wait he actually chose to die?? That''s wild')
  RETURNING id
),
r2a AS (
  INSERT INTO comments (artwork_id, guest_id, guest_name, emoji, text, parent_id)
  VALUES ('436105', 'Guest-1004', 'PhiloNerd', '🤔', 'He believed in following the law even when it was unjust', (SELECT id FROM c2))
  RETURNING id
),
c3 AS (
  INSERT INTO comments (artwork_id, guest_id, guest_name, emoji, text)
  VALUES ('436105', 'Guest-1007', 'SocratesFan', '🤔', 'The way his students are grieving while he stays calm...')
  RETURNING id
)
SELECT 1; -- finish the CTE chain

-- Water Lilies
WITH c1 AS (
  INSERT INTO comments (artwork_id, guest_id, guest_name, emoji, text)
  VALUES ('437984', 'Guest-2001', 'PaintingPro', '❤️‍🔥', 'I could stare at this for hours honestly')
  RETURNING id
),
r1a AS (
  INSERT INTO comments (artwork_id, guest_id, guest_name, emoji, text, parent_id)
  VALUES ('437984', 'Guest-2002', 'MonetStan', '😍', 'Same!! I sat on the bench for 20 minutes', (SELECT id FROM c1))
  RETURNING id
),
c2 AS (
  INSERT INTO comments (artwork_id, guest_id, guest_name, emoji, text)
  VALUES ('437984', 'Guest-2003', 'LilyPad', '😍', 'The colors are insane up close!!')
  RETURNING id
)
SELECT 1;

-- The Great Wave
WITH c1 AS (
  INSERT INTO comments (artwork_id, guest_id, guest_name, emoji, text)
  VALUES ('45434', 'Guest-4001', 'WaveCatcher', '🤔', 'Is it about nature''s power or human smallness?')
  RETURNING id
),
r1a AS (
  INSERT INTO comments (artwork_id, guest_id, guest_name, emoji, text, parent_id)
  VALUES ('45434', 'Guest-4004', 'ArtTeacher', '✨', 'That''s the beauty of it — it''s both!', (SELECT id FROM c1))
  RETURNING id
),
c2 AS (
  INSERT INTO comments (artwork_id, guest_id, guest_name, emoji, text)
  VALUES ('45434', 'Guest-4002', 'PrintLover', '😍', 'Fun fact: this is a woodblock print not a painting!')
  RETURNING id
),
r2a AS (
  INSERT INTO comments (artwork_id, guest_id, guest_name, emoji, text, parent_id)
  VALUES ('45434', 'Guest-4001', 'WaveCatcher', '😮', 'Wait WHAT that makes it even more impressive', (SELECT id FROM c2))
  RETURNING id
),
c3 AS (
  INSERT INTO comments (artwork_id, guest_id, guest_name, emoji, text)
  VALUES ('45434', 'Guest-4005', 'OceanVibes', '✨', 'Mt. Fuji hiding in the background is everything')
  RETURNING id
)
SELECT 1;

-- Sphinx of Hatshepsut
WITH c1 AS (
  INSERT INTO comments (artwork_id, guest_id, guest_name, emoji, text)
  VALUES ('544', 'Guest-5001', 'EgyptFan', '😍', 'A female pharaoh!! She was ahead of her time')
  RETURNING id
),
r1a AS (
  INSERT INTO comments (artwork_id, guest_id, guest_name, emoji, text, parent_id)
  VALUES ('544', 'Guest-5002', 'HistoryBuff', '🤯', 'Hatshepsut was one of the most successful pharaohs ever', (SELECT id FROM c1))
  RETURNING id
),
c2 AS (
  INSERT INTO comments (artwork_id, guest_id, guest_name, emoji, text)
  VALUES ('544', 'Guest-5003', 'TimeTraveler', '😮', '3,500 years old and still looks this good')
  RETURNING id
)
SELECT 1;

-- Washington Crossing the Delaware
WITH c1 AS (
  INSERT INTO comments (artwork_id, guest_id, guest_name, emoji, text)
  VALUES ('11417', 'Guest-6001', 'PatriotPete', '😍', 'Standing in front of this made me emotional ngl')
  RETURNING id
),
r1a AS (
  INSERT INTO comments (artwork_id, guest_id, guest_name, emoji, text, parent_id)
  VALUES ('11417', 'Guest-6007', 'ArtNewbie', '😍', 'Same I wasn''t expecting to feel so much!', (SELECT id FROM c1))
  RETURNING id
),
c2 AS (
  INSERT INTO comments (artwork_id, guest_id, guest_name, emoji, text)
  VALUES ('11417', 'Guest-6002', 'ArtStudent', '😮', 'The scale of this painting is INSANE in person — like 20 feet wide')
  RETURNING id
),
r2a AS (
  INSERT INTO comments (artwork_id, guest_id, guest_name, emoji, text, parent_id)
  VALUES ('11417', 'Guest-6004', 'MetGuide', '🤯', 'It''s actually over 21 feet! One of the largest in the museum', (SELECT id FROM c2))
  RETURNING id
),
r2b AS (
  INSERT INTO comments (artwork_id, guest_id, guest_name, emoji, text, parent_id)
  VALUES ('11417', 'Guest-6002', 'ArtStudent', '😮', 'That''s even crazier than I thought!!', (SELECT id FROM c2))
  RETURNING id
),
c3 AS (
  INSERT INTO comments (artwork_id, guest_id, guest_name, emoji, text)
  VALUES ('11417', 'Guest-6003', 'HistoryBuff', '😍', 'Fun fact: Leutze painted this in Germany, not America!')
  RETURNING id
),
c4 AS (
  INSERT INTO comments (artwork_id, guest_id, guest_name, emoji, text)
  VALUES ('11417', 'Guest-6008', 'ClassicsFan', '🤔', 'The flag in the painting is historically inaccurate — it wasn''t designed yet in 1776')
  RETURNING id
),
r4a AS (
  INSERT INTO comments (artwork_id, guest_id, guest_name, emoji, text, parent_id)
  VALUES ('11417', 'Guest-6003', 'HistoryBuff', '😮', 'Great catch! Leutze used artistic license for the drama', (SELECT id FROM c4))
  RETURNING id
)
SELECT 1;

-- Armor Garniture
WITH c1 AS (
  INSERT INTO comments (artwork_id, guest_id, guest_name, emoji, text)
  VALUES ('35829', 'Guest-3001', 'KnightFan', '😱', 'Imagine actually wearing this into battle')
  RETURNING id
),
r1a AS (
  INSERT INTO comments (artwork_id, guest_id, guest_name, emoji, text, parent_id)
  VALUES ('35829', 'Guest-3002', 'ArmorNerd', '🤯', 'It weighs like 50 pounds and they fought in it!!', (SELECT id FROM c1))
  RETURNING id
),
c2 AS (
  INSERT INTO comments (artwork_id, guest_id, guest_name, emoji, text)
  VALUES ('35829', 'Guest-3004', 'HistoryNerd', '✨', 'The detail on this is next level craftsmanship')
  RETURNING id
)
SELECT 1;

-- Heart of the Andes
WITH c1 AS (
  INSERT INTO comments (artwork_id, guest_id, guest_name, emoji, text)
  VALUES ('10814', 'Guest-9001', 'NatureLover', '❤️‍🔥', 'I want to climb into this painting and live there')
  RETURNING id
),
c2 AS (
  INSERT INTO comments (artwork_id, guest_id, guest_name, emoji, text)
  VALUES ('10814', 'Guest-9003', 'DetailFreak', '😍', 'Bring binoculars — the tiny plants are all real species')
  RETURNING id
)
SELECT 1;

-- Veteran in a New Field
WITH c1 AS (
  INSERT INTO comments (artwork_id, guest_id, guest_name, emoji, text)
  VALUES ('11189', 'Guest-0001', 'WarHistory', '😞', 'So peaceful on the surface, so heavy underneath')
  RETURNING id
),
r1a AS (
  INSERT INTO comments (artwork_id, guest_id, guest_name, emoji, text, parent_id)
  VALUES ('11189', 'Guest-0003', 'SymbolHunter', '😢', 'The scythe = Grim Reaper, the wheat = lives lost. Devastating.', (SELECT id FROM c1))
  RETURNING id
)
SELECT 1;


-- ==============================================
-- COMMENT LIKES
-- ==============================================
-- We need the actual comment IDs, so we look them up by text.
-- This is a bit verbose but works reliably with seed data.

-- Likes on "The Death of Socrates" comments
INSERT INTO comment_likes (comment_id, guest_id)
SELECT id, 'Guest-1002' FROM comments WHERE text = 'This one hits different when you see it in person'
UNION ALL
SELECT id, 'Guest-1003' FROM comments WHERE text = 'This one hits different when you see it in person'
UNION ALL
SELECT id, 'Guest-1004' FROM comments WHERE text = 'This one hits different when you see it in person'
UNION ALL
SELECT id, 'Guest-1005' FROM comments WHERE text = 'Right?? The painting is over 10 feet wide!'
UNION ALL
SELECT id, 'Guest-1006' FROM comments WHERE text = 'Right?? The painting is over 10 feet wide!'
UNION ALL
SELECT id, 'Guest-1007' FROM comments WHERE text = 'Wait he actually chose to die?? That''s wild'
UNION ALL
SELECT id, 'Guest-1001' FROM comments WHERE text = 'Wait he actually chose to die?? That''s wild'
UNION ALL
SELECT id, 'Guest-1004' FROM comments WHERE text = 'He believed in following the law even when it was unjust'
UNION ALL
SELECT id, 'Guest-1001' FROM comments WHERE text = 'He believed in following the law even when it was unjust'
UNION ALL
SELECT id, 'Guest-1003' FROM comments WHERE text = 'He believed in following the law even when it was unjust'
UNION ALL
SELECT id, 'Guest-1001' FROM comments WHERE text = 'The way his students are grieving while he stays calm...'
UNION ALL
SELECT id, 'Guest-1002' FROM comments WHERE text = 'The way his students are grieving while he stays calm...'
UNION ALL
SELECT id, 'Guest-1003' FROM comments WHERE text = 'The way his students are grieving while he stays calm...'
UNION ALL
SELECT id, 'Guest-1004' FROM comments WHERE text = 'The way his students are grieving while he stays calm...'
UNION ALL
SELECT id, 'Guest-1005' FROM comments WHERE text = 'The way his students are grieving while he stays calm...';

-- Likes on Water Lilies comments
INSERT INTO comment_likes (comment_id, guest_id)
SELECT id, 'Guest-2002' FROM comments WHERE text = 'I could stare at this for hours honestly'
UNION ALL
SELECT id, 'Guest-2003' FROM comments WHERE text = 'I could stare at this for hours honestly'
UNION ALL
SELECT id, 'Guest-2004' FROM comments WHERE text = 'I could stare at this for hours honestly'
UNION ALL
SELECT id, 'Guest-2005' FROM comments WHERE text = 'I could stare at this for hours honestly'
UNION ALL
SELECT id, 'Guest-2001' FROM comments WHERE text = 'Same!! I sat on the bench for 20 minutes'
UNION ALL
SELECT id, 'Guest-2003' FROM comments WHERE text = 'Same!! I sat on the bench for 20 minutes'
UNION ALL
SELECT id, 'Guest-2001' FROM comments WHERE text = 'The colors are insane up close!!'
UNION ALL
SELECT id, 'Guest-2004' FROM comments WHERE text = 'The colors are insane up close!!'
UNION ALL
SELECT id, 'Guest-2005' FROM comments WHERE text = 'The colors are insane up close!!';

-- Likes on Great Wave comments
INSERT INTO comment_likes (comment_id, guest_id)
SELECT id, 'Guest-4002' FROM comments WHERE text = 'Is it about nature''s power or human smallness?'
UNION ALL
SELECT id, 'Guest-4004' FROM comments WHERE text = 'Is it about nature''s power or human smallness?'
UNION ALL
SELECT id, 'Guest-4005' FROM comments WHERE text = 'Is it about nature''s power or human smallness?'
UNION ALL
SELECT id, 'Guest-4001' FROM comments WHERE text = 'Fun fact: this is a woodblock print not a painting!'
UNION ALL
SELECT id, 'Guest-4003' FROM comments WHERE text = 'Fun fact: this is a woodblock print not a painting!'
UNION ALL
SELECT id, 'Guest-4005' FROM comments WHERE text = 'Fun fact: this is a woodblock print not a painting!'
UNION ALL
SELECT id, 'Guest-4006' FROM comments WHERE text = 'Fun fact: this is a woodblock print not a painting!';

-- Likes on Washington Crossing comments
INSERT INTO comment_likes (comment_id, guest_id)
SELECT id, 'Guest-6002' FROM comments WHERE text = 'Standing in front of this made me emotional ngl'
UNION ALL
SELECT id, 'Guest-6003' FROM comments WHERE text = 'Standing in front of this made me emotional ngl'
UNION ALL
SELECT id, 'Guest-6004' FROM comments WHERE text = 'Standing in front of this made me emotional ngl'
UNION ALL
SELECT id, 'Guest-6005' FROM comments WHERE text = 'The scale of this painting is INSANE in person — like 20 feet wide'
UNION ALL
SELECT id, 'Guest-6006' FROM comments WHERE text = 'The scale of this painting is INSANE in person — like 20 feet wide'
UNION ALL
SELECT id, 'Guest-6007' FROM comments WHERE text = 'The scale of this painting is INSANE in person — like 20 feet wide'
UNION ALL
SELECT id, 'Guest-6001' FROM comments WHERE text = 'The flag in the painting is historically inaccurate — it wasn''t designed yet in 1776'
UNION ALL
SELECT id, 'Guest-6002' FROM comments WHERE text = 'The flag in the painting is historically inaccurate — it wasn''t designed yet in 1776'
UNION ALL
SELECT id, 'Guest-6004' FROM comments WHERE text = 'The flag in the painting is historically inaccurate — it wasn''t designed yet in 1776'
UNION ALL
SELECT id, 'Guest-6005' FROM comments WHERE text = 'The flag in the painting is historically inaccurate — it wasn''t designed yet in 1776';
