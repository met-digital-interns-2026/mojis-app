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
