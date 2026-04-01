// Database helper functions.
//
// These are the functions your pages call to read and write data.
// Each function talks to Supabase (the database) if connected,
// or returns null so the page can fall back to local state.
//
// Think of these as the "waiters" between your app and the kitchen (database).
// Your page says "I want the comments for artwork 436105" and this file
// goes to the database, gets them, and brings them back.

import { supabase, isConnected } from "./supabase";

// ==================
// ARTWORKS
// ==================

// Get a single artwork by its Met object ID.
// Returns { id, title, artist, year, image, ... } or null.
export async function getArtwork(artworkId) {
  if (!isConnected()) return null;

  const { data, error } = await supabase
    .from("artworks")
    .select("*")
    .eq("id", artworkId)
    .maybeSingle();

  if (error) {
    console.error("Error fetching artwork:", error);
    return null;
  }
  return data;
}

// Get all artworks that have at least one reaction, ranked by total reaction count.
// Used by the rankings page.
// Returns: [{ id, title, artist, year, image, ..., reaction_count, top_emoji }]
export async function getArtworkRankings(limit = 10) {
  if (!isConnected()) return null;

  // Get reaction counts per artwork
  const { data: reactions, error: rErr } = await supabase
    .from("reactions")
    .select("artwork_id, emoji");

  if (rErr) {
    console.error("Error fetching reaction rankings:", rErr);
    return null;
  }

  // Count reactions per artwork and find the most common emoji
  const artworkStats = {};
  for (const r of reactions) {
    if (!artworkStats[r.artwork_id]) {
      artworkStats[r.artwork_id] = { count: 0, emojis: {} };
    }
    artworkStats[r.artwork_id].count++;
    artworkStats[r.artwork_id].emojis[r.emoji] = (artworkStats[r.artwork_id].emojis[r.emoji] || 0) + 1;
  }

  // Sort by count descending
  const ranked = Object.entries(artworkStats)
    .sort(([, a], [, b]) => b.count - a.count)
    .slice(0, limit);

  if (ranked.length === 0) return [];

  // Fetch artwork details for the top ones
  const artworkIds = ranked.map(([id]) => id);
  const { data: artworks, error: aErr } = await supabase
    .from("artworks")
    .select("*")
    .in("id", artworkIds);

  if (aErr) {
    console.error("Error fetching ranked artworks:", aErr);
    return null;
  }

  const artworkMap = {};
  for (const a of artworks) artworkMap[a.id] = a;

  return ranked
    .map(([id, stats]) => {
      const art = artworkMap[id];
      if (!art) return null;
      // Find the top emoji
      const topEmoji = Object.entries(stats.emojis)
        .sort(([, a], [, b]) => b - a)[0]?.[0] || "❤️";
      return {
        ...art,
        reaction_count: stats.count,
        topEmoji,
      };
    })
    .filter(Boolean);
}

// Get artworks ranked by total comment likes (heart count).
// Used by the "Most Commented" tab on the rankings page.
export async function getCommentHeartRankings(limit = 10) {
  if (!isConnected()) return null;

  // Get all comment likes joined with comments to get artwork_id
  const { data: comments, error: cErr } = await supabase
    .from("comments")
    .select("id, artwork_id");

  if (cErr) {
    console.error("Error fetching comments for rankings:", cErr);
    return null;
  }

  const { data: likes, error: lErr } = await supabase
    .from("comment_likes")
    .select("comment_id");

  if (lErr) {
    console.error("Error fetching likes for rankings:", lErr);
    return null;
  }

  // Map comment_id to artwork_id
  const commentArtwork = {};
  for (const c of comments) commentArtwork[c.id] = c.artwork_id;

  // Count likes per artwork
  const artworkLikes = {};
  for (const l of likes) {
    const artworkId = commentArtwork[l.comment_id];
    if (artworkId) {
      artworkLikes[artworkId] = (artworkLikes[artworkId] || 0) + 1;
    }
  }

  const ranked = Object.entries(artworkLikes)
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit);

  if (ranked.length === 0) return [];

  const artworkIds = ranked.map(([id]) => id);
  const { data: artworks, error: aErr } = await supabase
    .from("artworks")
    .select("*")
    .in("id", artworkIds);

  if (aErr) return null;

  const artworkMap = {};
  for (const a of artworks) artworkMap[a.id] = a;

  // Also get top emoji per artwork from reactions
  const { data: reactions } = await supabase
    .from("reactions")
    .select("artwork_id, emoji")
    .in("artwork_id", artworkIds);

  const topEmojis = {};
  if (reactions) {
    const emojiCounts = {};
    for (const r of reactions) {
      if (!emojiCounts[r.artwork_id]) emojiCounts[r.artwork_id] = {};
      emojiCounts[r.artwork_id][r.emoji] = (emojiCounts[r.artwork_id][r.emoji] || 0) + 1;
    }
    for (const [artId, counts] of Object.entries(emojiCounts)) {
      topEmojis[artId] = Object.entries(counts).sort(([, a], [, b]) => b - a)[0]?.[0] || "❤️";
    }
  }

  return ranked
    .map(([id, likeCount]) => {
      const art = artworkMap[id];
      if (!art) return null;
      return {
        ...art,
        reaction_count: likeCount,
        topEmoji: topEmojis[id] || "❤️",
        label: "comment hearts",
      };
    })
    .filter(Boolean);
}

// Get the top-reacted artwork for each emotion category.
// Used by the homepage to show "Saddest", "Most Loved", etc.
// Returns: { sad: { artwork, count, topReactions }, love: { ... }, ... }
export async function getTopByCategory() {
  if (!isConnected()) return null;

  // Fetch all reactions with artwork info
  const { data: reactions, error } = await supabase
    .from("reactions")
    .select("artwork_id, category, emoji");

  if (error) {
    console.error("Error fetching category leaders:", error);
    return null;
  }

  // Group by category → artwork → count
  const catArtworks = {};
  for (const r of reactions) {
    if (!catArtworks[r.category]) catArtworks[r.category] = {};
    if (!catArtworks[r.category][r.artwork_id]) {
      catArtworks[r.category][r.artwork_id] = { count: 0, emojis: {} };
    }
    catArtworks[r.category][r.artwork_id].count++;
    catArtworks[r.category][r.artwork_id].emojis[r.emoji] =
      (catArtworks[r.category][r.artwork_id].emojis[r.emoji] || 0) + 1;
  }

  // For each category, find the artwork with the most reactions
  const leaders = {};
  const artworkIds = new Set();
  for (const [cat, artworks] of Object.entries(catArtworks)) {
    const sorted = Object.entries(artworks).sort(([, a], [, b]) => b.count - a.count);
    if (sorted.length > 0) {
      const [artId, stats] = sorted[0];
      artworkIds.add(artId);
      leaders[cat] = {
        artworkId: artId,
        count: stats.count,
        emojis: stats.emojis,
      };
    }
  }

  if (artworkIds.size === 0) return {};

  // Fetch artwork details
  const { data: artworks, error: aErr } = await supabase
    .from("artworks")
    .select("*")
    .in("id", [...artworkIds]);

  if (aErr) return null;

  const artworkMap = {};
  for (const a of artworks) artworkMap[a.id] = a;

  // Also get comments for these artworks
  const { data: comments } = await supabase
    .from("comments")
    .select("*")
    .in("artwork_id", [...artworkIds])
    .order("created_at", { ascending: true });

  // Get like counts
  const commentIds = (comments || []).map(c => c.id);
  let likeCounts = {};
  if (commentIds.length > 0) {
    const { data: likes } = await supabase
      .from("comment_likes")
      .select("comment_id")
      .in("comment_id", commentIds);
    if (likes) {
      for (const l of likes) {
        likeCounts[l.comment_id] = (likeCounts[l.comment_id] || 0) + 1;
      }
    }
  }

  // Build comment trees per artwork
  const commentsByArtwork = {};
  for (const c of (comments || [])) {
    if (!commentsByArtwork[c.artwork_id]) commentsByArtwork[c.artwork_id] = [];
    commentsByArtwork[c.artwork_id].push(c);
  }

  function buildCommentTree(artworkComments) {
    const topLevel = [];
    const replyMap = {};
    for (const c of artworkComments) {
      const formatted = {
        id: c.id,
        user: c.guest_name,
        emoji: c.emoji,
        text: c.text,
        likes: likeCounts[c.id] || 0,
        replies: [],
        createdAt: c.created_at,
      };
      if (c.parent_id) {
        const parent = artworkComments.find(p => p.id === c.parent_id);
        formatted.replyTo = parent ? parent.guest_name : null;
        if (!replyMap[c.parent_id]) replyMap[c.parent_id] = [];
        replyMap[c.parent_id].push(formatted);
      } else {
        topLevel.push(formatted);
      }
    }
    for (const comment of topLevel) {
      comment.replies = replyMap[comment.id] || [];
    }
    return topLevel;
  }

  // Assemble results
  const result = {};
  for (const [cat, leader] of Object.entries(leaders)) {
    const art = artworkMap[leader.artworkId];
    if (!art) continue;

    // Sort emojis by count for the reaction pills
    const reactionEntries = Object.entries(leader.emojis)
      .sort(([, a], [, b]) => b - a);
    const reactions = {};
    for (const [emoji, count] of reactionEntries) {
      reactions[emoji] = count;
    }

    result[cat] = {
      artwork: {
        id: art.id,
        title: art.title,
        artist: art.artist,
        year: art.year,
        image: art.image,
        fact: art.fact,
        reactions,
        comments: buildCommentTree(commentsByArtwork[art.id] || []),
      },
      count: leader.count,
      department: art.department,
    };
  }

  return result;
}

// Get all artworks from the database, optionally filtered by department.
// Returns each artwork with its total reaction count and top emoji.
// Used by the gallery page.
export async function getAllArtworks(department = null) {
  if (!isConnected()) return null;

  let query = supabase.from("artworks").select("*");
  if (department) {
    query = query.eq("department", department);
  }
  const { data: artworks, error } = await query.order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching all artworks:", error);
    return null;
  }

  if (!artworks || artworks.length === 0) return [];

  // Get reaction counts and top emoji per artwork
  const artworkIds = artworks.map(a => a.id);
  const { data: reactions } = await supabase
    .from("reactions")
    .select("artwork_id, emoji")
    .in("artwork_id", artworkIds);

  const stats = {};
  if (reactions) {
    for (const r of reactions) {
      if (!stats[r.artwork_id]) stats[r.artwork_id] = { count: 0, emojis: {} };
      stats[r.artwork_id].count++;
      stats[r.artwork_id].emojis[r.emoji] = (stats[r.artwork_id].emojis[r.emoji] || 0) + 1;
    }
  }

  return artworks.map(art => {
    const s = stats[art.id];
    const topEmoji = s
      ? Object.entries(s.emojis).sort(([, a], [, b]) => b - a)[0]?.[0] || null
      : null;
    return {
      ...art,
      reaction_count: s?.count || 0,
      topEmoji,
    };
  });
}

// Ensure an artwork exists in the artworks table.
// Called when we discover a new artwork (e.g. from image recognition scan).
export async function upsertArtwork(artwork) {
  if (!isConnected()) return null;

  const { error } = await supabase
    .from("artworks")
    .upsert({
      id: artwork.id,
      title: artwork.title,
      artist: artwork.artist,
      year: artwork.year || artwork.dated || null,
      image: artwork.image,
      medium: artwork.medium || null,
      department: artwork.department || null,
      gallery: artwork.gallery || null,
      fact: artwork.fact || null,
    }, {
      onConflict: "id",
    });

  if (error) {
    console.error("Error upserting artwork:", error);
    return false;
  }
  return true;
}

// ==================
// REACTIONS
// ==================

// Get all reactions for an artwork, grouped by emoji.
// Returns something like: { "😭": 45, "😮": 23, "🤔": 12 }
export async function getReactionCounts(artworkId) {
  if (!isConnected()) return null;

  const { data, error } = await supabase
    .from("reactions")
    .select("emoji")
    .eq("artwork_id", artworkId);

  if (error) {
    console.error("Error fetching reactions:", error);
    return null;
  }

  // Count how many of each emoji
  const counts = {};
  for (const row of data) {
    counts[row.emoji] = (counts[row.emoji] || 0) + 1;
  }
  return counts;
}

// Get the current user's reaction to an artwork (if any).
// Returns something like: { category: "sad", level: 5, emoji: "😭" }
export async function getMyReaction(artworkId, guestId) {
  if (!isConnected()) return null;

  const { data, error } = await supabase
    .from("reactions")
    .select("category, level, emoji")
    .eq("artwork_id", artworkId)
    .eq("guest_id", guestId)
    .maybeSingle(); // returns null if no match (instead of error)

  if (error) {
    console.error("Error fetching my reaction:", error);
    return null;
  }
  return data;
}

// Save or update the user's reaction to an artwork.
// "upsert" means "insert if new, update if exists" — like "save".
export async function saveReaction(artworkId, guestId, category, level, emoji) {
  if (!isConnected()) return null;

  const { error } = await supabase
    .from("reactions")
    .upsert({
      artwork_id: artworkId,
      guest_id: guestId,
      category,
      level,
      emoji,
    }, {
      onConflict: "artwork_id,guest_id", // if this combo exists, update it
    });

  if (error) {
    console.error("Error saving reaction:", error);
    return false;
  }
  return true;
}

// ==================
// COMMENTS
// ==================

// Get all comments for an artwork, including reply counts and like counts.
// Returns an array of comment objects with nested replies.
export async function getComments(artworkId) {
  if (!isConnected()) return null;

  // Get all comments for this artwork, newest first
  const { data, error } = await supabase
    .from("comments")
    .select("*")
    .eq("artwork_id", artworkId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching comments:", error);
    return null;
  }

  // Get like counts for each comment
  const commentIds = data.map(c => c.id);
  let likeCounts = {};

  if (commentIds.length > 0) {
    const { data: likes, error: likesError } = await supabase
      .from("comment_likes")
      .select("comment_id")
      .in("comment_id", commentIds);

    if (!likesError && likes) {
      for (const like of likes) {
        likeCounts[like.comment_id] = (likeCounts[like.comment_id] || 0) + 1;
      }
    }
  }

  // Organize into a tree: top-level comments with nested replies
  const topLevel = [];
  const replyMap = {};

  for (const comment of data) {
    const formatted = {
      id: comment.id,
      user: comment.guest_name,
      emoji: comment.emoji,
      text: comment.text,
      likes: likeCounts[comment.id] || 0,
      replyTo: null,
      replies: [],
      createdAt: comment.created_at,
    };

    if (comment.parent_id) {
      // This is a reply — find the parent comment's user name
      const parent = data.find(c => c.id === comment.parent_id);
      formatted.replyTo = parent ? parent.guest_name : null;

      if (!replyMap[comment.parent_id]) {
        replyMap[comment.parent_id] = [];
      }
      replyMap[comment.parent_id].push(formatted);
    } else {
      topLevel.push(formatted);
    }
  }

  // Attach replies to their parent comments
  for (const comment of topLevel) {
    comment.replies = replyMap[comment.id] || [];
  }

  return topLevel;
}

// Add a new comment (or reply).
export async function addComment(artworkId, guestId, guestName, emoji, text, parentId = null) {
  if (!isConnected()) return null;

  const { data, error } = await supabase
    .from("comments")
    .insert({
      artwork_id: artworkId,
      guest_id: guestId,
      guest_name: guestName,
      emoji,
      text,
      parent_id: parentId,
    })
    .select()
    .single();

  if (error) {
    console.error("Error adding comment:", error);
    return null;
  }
  return data;
}

// ==================
// LIKES
// ==================

// Toggle a like on a comment. Returns { liked: true/false, newCount: number }
export async function toggleLike(commentId, guestId) {
  if (!isConnected()) return null;

  // Check if already liked
  const { data: existing } = await supabase
    .from("comment_likes")
    .select("comment_id")
    .eq("comment_id", commentId)
    .eq("guest_id", guestId)
    .maybeSingle();

  if (existing) {
    // Unlike
    await supabase
      .from("comment_likes")
      .delete()
      .eq("comment_id", commentId)
      .eq("guest_id", guestId);
    return { liked: false };
  } else {
    // Like
    await supabase
      .from("comment_likes")
      .insert({ comment_id: commentId, guest_id: guestId });
    return { liked: true };
  }
}

// Check which comments the current guest has liked
export async function getMyLikes(commentIds, guestId) {
  if (!isConnected() || commentIds.length === 0) return new Set();

  const { data, error } = await supabase
    .from("comment_likes")
    .select("comment_id")
    .in("comment_id", commentIds)
    .eq("guest_id", guestId);

  if (error) return new Set();
  return new Set(data.map(d => d.comment_id));
}
