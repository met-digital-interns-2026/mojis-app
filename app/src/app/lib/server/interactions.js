import "server-only";

function normalizeArtworkPayload(artwork) {
  if (!artwork?.id || !artwork?.title) {
    return null;
  }

  return {
    id: String(artwork.id),
    title: artwork.title,
    artist: artwork.artist || "Unknown",
    year: artwork.year || artwork.dated || null,
    image: artwork.image || null,
    medium: artwork.medium || null,
    department: artwork.department || null,
    gallery: artwork.gallery || null,
    fact: artwork.fact || null,
  };
}

export async function upsertArtworkRecord(supabase, artwork) {
  const payload = normalizeArtworkPayload(artwork);
  if (!payload) {
    return { ok: false, error: "Artwork id and title are required." };
  }

  const { error } = await supabase
    .from("artworks")
    .upsert(payload, { onConflict: "id" });

  if (error) {
    console.error("Error upserting artwork:", error);
    return { ok: false, error: "Could not save artwork." };
  }

  return { ok: true };
}

export async function getMyReactionForArtwork(supabase, artworkId, guestId) {
  const { data, error } = await supabase
    .from("reactions")
    .select("category, level, emoji")
    .eq("artwork_id", artworkId)
    .eq("guest_id", guestId)
    .maybeSingle();

  if (error) {
    console.error("Error fetching my reaction:", error);
    return null;
  }

  return data;
}

export async function saveReactionForArtwork(supabase, artworkId, guestId, reaction) {
  const { category, level, emoji } = reaction;

  const { error } = await supabase
    .from("reactions")
    .upsert(
      {
        artwork_id: artworkId,
        guest_id: guestId,
        category,
        level,
        emoji,
      },
      { onConflict: "artwork_id,guest_id" }
    );

  if (error) {
    console.error("Error saving reaction:", error);
    return { ok: false, error: "Could not save reaction." };
  }

  return { ok: true };
}

function buildCommentTree(comments, likeCounts) {
  const topLevel = [];
  const replyMap = {};

  for (const comment of comments) {
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
      const parent = comments.find((candidate) => candidate.id === comment.parent_id);
      formatted.replyTo = parent ? parent.guest_name : null;

      if (!replyMap[comment.parent_id]) {
        replyMap[comment.parent_id] = [];
      }
      replyMap[comment.parent_id].push(formatted);
    } else {
      topLevel.push(formatted);
    }
  }

  for (const comment of topLevel) {
    comment.replies = replyMap[comment.id] || [];
  }

  return topLevel;
}

export async function getCommentsForArtwork(supabase, artworkId) {
  const { data: comments, error } = await supabase
    .from("comments")
    .select("*")
    .eq("artwork_id", artworkId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching comments:", error);
    return null;
  }

  const commentIds = (comments || []).map((comment) => comment.id);
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

  return buildCommentTree(comments || [], likeCounts);
}

export async function addCommentForArtwork(
  supabase,
  artworkId,
  guestId,
  guestName,
  emoji,
  text,
  parentId = null
) {
  const trimmedText = text?.trim();
  if (!trimmedText) {
    return { ok: false, error: "Comment text is required." };
  }

  const { data, error } = await supabase
    .from("comments")
    .insert({
      artwork_id: artworkId,
      guest_id: guestId,
      guest_name: guestName?.trim() || "Guest",
      emoji: emoji || "💬",
      text: trimmedText,
      parent_id: parentId,
    })
    .select()
    .single();

  if (error) {
    console.error("Error adding comment:", error);
    return { ok: false, error: "Could not save comment." };
  }

  return { ok: true, data };
}

export async function toggleCommentLike(supabase, commentId, guestId) {
  const { data: existing, error: readError } = await supabase
    .from("comment_likes")
    .select("comment_id")
    .eq("comment_id", commentId)
    .eq("guest_id", guestId)
    .maybeSingle();

  if (readError) {
    console.error("Error checking like state:", readError);
    return { ok: false, error: "Could not update like." };
  }

  if (existing) {
    const { error } = await supabase
      .from("comment_likes")
      .delete()
      .eq("comment_id", commentId)
      .eq("guest_id", guestId);

    if (error) {
      console.error("Error removing like:", error);
      return { ok: false, error: "Could not update like." };
    }

    return { ok: true, liked: false };
  }

  const { error } = await supabase
    .from("comment_likes")
    .insert({ comment_id: commentId, guest_id: guestId });

  if (error) {
    console.error("Error adding like:", error);
    return { ok: false, error: "Could not update like." };
  }

  return { ok: true, liked: true };
}

export async function getLikedCommentIds(supabase, commentIds, guestId) {
  if (!Array.isArray(commentIds) || commentIds.length === 0) {
    return [];
  }

  const { data, error } = await supabase
    .from("comment_likes")
    .select("comment_id")
    .in("comment_id", commentIds)
    .eq("guest_id", guestId);

  if (error) {
    console.error("Error fetching liked comments:", error);
    return [];
  }

  return data.map((row) => row.comment_id);
}
