// Shared comments section.
// Reads and writes comments, replies, and likes through the database helpers only.
"use client";

import { useEffect, useState } from "react";
import SpeechBubble from "./SpeechBubble";
import { addComment, getComments, getMyLikes, toggleLike } from "../lib/db";
import { getGuestName } from "../lib/guest";
import { isConnected } from "../lib/supabase";

function collectCommentIds(comments) {
  const ids = [];

  for (const comment of comments) {
    if (comment.id != null) {
      ids.push(comment.id);
    }
    if (comment.replies?.length) {
      ids.push(...collectCommentIds(comment.replies));
    }
  }

  return ids;
}

export default function CommentsSection({
  artworkId,
  comments = [],
  color,
  initialVisibleCount = 2,
  commentEmoji = "💬",
}) {
  const [showAll, setShowAll] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [storedComments, setStoredComments] = useState(comments);
  const [showInput, setShowInput] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [likedCommentIds, setLikedCommentIds] = useState(new Set());
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const canPersist = isConnected() && Boolean(artworkId);
  const visibleComments = showAll
    ? storedComments
    : storedComments.slice(0, initialVisibleCount);

  useEffect(() => {
    let cancelled = false;

    async function loadStoredComments() {
      if (!canPersist) {
        return;
      }

      const dbComments = await getComments(artworkId);
      if (cancelled || !dbComments) {
        return;
      }

      const commentIds = collectCommentIds(dbComments);
      const myLikes = await getMyLikes(commentIds);
      if (cancelled) {
        return;
      }

      setStoredComments(dbComments);
      setLikedCommentIds(myLikes);
    }

    loadStoredComments();
    return () => {
      cancelled = true;
    };
  }, [artworkId, canPersist]);

  async function refreshStoredComments() {
    if (!canPersist) {
      return false;
    }

    const dbComments = await getComments(artworkId);
    if (!dbComments) {
      return false;
    }

    const commentIds = collectCommentIds(dbComments);
    const myLikes = await getMyLikes(commentIds);
    setStoredComments(dbComments);
    setLikedCommentIds(myLikes);
    return true;
  }

  function handleCommentClick(e) {
    e.stopPropagation();
    if (!canPersist || pending) {
      return;
    }
    setError("");
    setShowInput(true);
  }

  const handleReply = (comment) => {
    if (!canPersist || pending) {
      return;
    }
    setError("");
    setReplyingTo(comment);
    setShowInput(true);
  };

  async function handleAddComment() {
    const text = newComment.trim();
    if (!text || !canPersist || pending) {
      return;
    }

    setPending(true);
    setError("");

    const saved = await addComment(
      artworkId,
      getGuestName(),
      commentEmoji,
      text,
      replyingTo?.id ?? null,
    );

    if (!saved) {
      setError("Could not save your comment. Try again.");
      setPending(false);
      return;
    }

    const refreshed = await refreshStoredComments();
    if (!refreshed) {
      setError("Your comment was saved, but the thread could not be refreshed.");
    }

    setNewComment("");
    setShowInput(false);
    setReplyingTo(null);
    setShowAll(true);
    setPending(false);
  }

  async function handleToggleLike(comment) {
    if (!canPersist || pending || !comment.id) {
      return;
    }

    setPending(true);
    setError("");

    const result = await toggleLike(comment.id);
    if (!result) {
      setError("Could not update that like. Try again.");
      setPending(false);
      return;
    }

    const refreshed = await refreshStoredComments();
    if (!refreshed) {
      setError("Your like was saved, but the thread could not be refreshed.");
    }

    setPending(false);
  }

  return (
    <div style={{ padding: "0 14px 14px", borderTop: "1px solid #F2EFE9" }}>
      {/* Comments header */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "10px 0 8px",
      }}>
        <span style={{
          fontSize: 12, fontWeight: 700, color: "#8C8580",
          letterSpacing: "0.04em", textTransform: "uppercase",
        }}>
          💬 Comments ({storedComments.length})
        </span>
        {storedComments.length > initialVisibleCount && (
          <button
            onClick={(e) => { e.stopPropagation(); setShowAll(!showAll); }}
            style={{
              background: "none", border: "none", fontSize: 11,
              fontWeight: 600, color: color, cursor: "pointer", padding: 0,
            }}
          >
            {showAll ? "Show less" : `View all ${storedComments.length}`}
          </button>
        )}
      </div>

      {/* Comment bubbles */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {visibleComments.map((comment, i) => (
          <SpeechBubble
            key={comment.id ?? i}
            comment={comment}
            color={color}
            delay={i * 0.05}
            onReply={handleReply}
            onToggleLike={handleToggleLike}
            likedCommentIds={likedCommentIds}
            actionsDisabled={!canPersist || pending}
          />
        ))}
      </div>

      {error && (
        <div style={{
          marginTop: 10,
          fontSize: 12,
          color: "#C1476F",
          padding: "8px 10px",
          background: "rgba(193,71,111,0.07)",
          borderRadius: 10,
        }}>
          {error}
        </div>
      )}

      {/* Add comment / reply input */}
      {showInput ? (
        <div style={{ marginTop: 10, animation: "fadeUp 0.25s ease" }} onClick={(e) => e.stopPropagation()}>
          {replyingTo && (
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "6px 10px", background: `${color}10`,
              borderRadius: "10px 10px 0 0", border: `1.5px solid ${color}25`, borderBottom: "none",
            }}>
              <span style={{ fontSize: 11, color: "#6B6560" }}>
                ↩ Replying to <strong style={{ color: color }}>{replyingTo.user}</strong>
              </span>
              <button
                onClick={(e) => { e.stopPropagation(); setReplyingTo(null); }}
                style={{
                  background: "none", border: "none", fontSize: 14,
                  color: "#A09B94", cursor: "pointer", padding: "0 2px", lineHeight: 1,
                }}
              >✕</button>
            </div>
          )}
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
              placeholder={replyingTo ? `Reply to ${replyingTo.user}...` : "Share your thoughts..."}
              autoFocus
              disabled={pending}
              style={{
                flex: 1, border: "1.5px solid #E8E4DD",
                borderRadius: replyingTo ? "0 0 0 12px" : 12, padding: "8px 12px",
                fontSize: 13, outline: "none", background: "#FAFAF8", color: "#2D2A26",
                opacity: pending ? 0.7 : 1,
              }}
            />
            <button
              onClick={handleAddComment}
              disabled={pending}
              style={{
                background: color, color: "#FFF", border: "none",
                borderRadius: replyingTo ? "0 0 12px 0" : 12, padding: "8px 14px",
                fontSize: 13, fontWeight: 700,
                cursor: pending ? "default" : "pointer",
                whiteSpace: "nowrap",
                opacity: pending ? 0.7 : 1,
              }}
            >{pending ? "Saving..." : "Send"}</button>
          </div>
        </div>
      ) : (
        <button
          onClick={handleCommentClick}
          disabled={!canPersist || pending}
          style={{
            width: "100%", marginTop: 10, padding: "9px 14px",
            background: "#FAFAF8", border: "1.5px dashed #D9D5CE",
            borderRadius: 12, fontSize: 12, color: "#A09B94",
            cursor: !canPersist || pending ? "default" : "pointer",
            fontWeight: 500,
            transition: "all 0.2s ease",
            opacity: !canPersist ? 0.7 : 1,
          }}
        >
          {canPersist ? "💬 Add a comment..." : "💬 Connect Supabase to comment"}
        </button>
      )}
    </div>
  );
}
