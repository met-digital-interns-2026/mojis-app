// Comments section for homepage cards.
// Shows a list of comments with a "View all" toggle and an input to add new ones.
"use client";

import { useState } from "react";
import SpeechBubble from "./SpeechBubble";

export default function CommentsSection({ comments, color }) {
  const [showAll, setShowAll] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [localComments, setLocalComments] = useState(comments || []);
  const [showInput, setShowInput] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const visibleComments = showAll ? localComments : localComments.slice(0, 2);

  const handleAddComment = () => {
    if (newComment.trim()) {
      if (replyingTo) {
        setLocalComments(localComments.map(c => {
          if (c === replyingTo) {
            return {
              ...c,
              replies: [...(c.replies || []), {
                user: "You",
                emoji: "💬",
                text: newComment.trim(),
                replyTo: replyingTo.user,
                likes: 0,
              }],
            };
          }
          return c;
        }));
      } else {
        setLocalComments([...localComments, {
          user: "You",
          emoji: "💬",
          text: newComment.trim(),
          likes: 0,
          replies: [],
        }]);
      }
      setNewComment("");
      setShowInput(false);
      setReplyingTo(null);
      setShowAll(true);
    }
  };

  const handleReply = (comment) => {
    setReplyingTo(comment);
    setShowInput(true);
  };

  return (
    <div style={{
      padding: "0 14px 14px",
      borderTop: "1px solid #F2EFE9",
    }}>
      {/* Comments header */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "10px 0 8px",
      }}>
        <span style={{
          fontSize: 12,
          fontWeight: 700,
          color: "#8C8580",
          letterSpacing: "0.04em",
          textTransform: "uppercase",
        }}>
          💬 Comments ({localComments.length})
        </span>
        {localComments.length > 2 && (
          <button
            onClick={(e) => { e.stopPropagation(); setShowAll(!showAll); }}
            style={{
              background: "none",
              border: "none",
              fontSize: 11,
              fontWeight: 600,
              color: color,
              cursor: "pointer",
              padding: 0,
            }}
          >
            {showAll ? "Show less" : `View all ${localComments.length}`}
          </button>
        )}
      </div>

      {/* Comment bubbles */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {visibleComments.map((comment, i) => (
          <SpeechBubble
            key={i}
            comment={comment}
            color={color}
            delay={i * 0.05}
            onReply={handleReply}
          />
        ))}
      </div>

      {/* Add comment / reply input */}
      {showInput ? (
        <div style={{
          marginTop: 10,
          animation: "fadeUp 0.25s ease",
        }}
          onClick={(e) => e.stopPropagation()}
        >
          {replyingTo && (
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "6px 10px",
              background: `${color}10`,
              borderRadius: "10px 10px 0 0",
              border: `1.5px solid ${color}25`,
              borderBottom: "none",
            }}>
              <span style={{ fontSize: 11, color: "#6B6560" }}>
                ↩ Replying to <strong style={{ color: color }}>{replyingTo.user}</strong>
              </span>
              <button
                onClick={(e) => { e.stopPropagation(); setReplyingTo(null); }}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: 14,
                  color: "#A09B94",
                  cursor: "pointer",
                  padding: "0 2px",
                  lineHeight: 1,
                }}
              >
                ✕
              </button>
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
              style={{
                flex: 1,
                border: "1.5px solid #E8E4DD",
                borderRadius: replyingTo ? "0 0 0 12px" : 12,
                padding: "8px 12px",
                fontSize: 13,
                outline: "none",
                background: "#FAFAF8",
                color: "#2D2A26",
              }}
            />
            <button
              onClick={handleAddComment}
              style={{
                background: color,
                color: "#FFF",
                border: "none",
                borderRadius: replyingTo ? "0 0 12px 0" : 12,
                padding: "8px 14px",
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              Send
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={(e) => { e.stopPropagation(); setShowInput(true); }}
          style={{
            width: "100%",
            marginTop: 10,
            padding: "9px 14px",
            background: "#FAFAF8",
            border: "1.5px dashed #D9D5CE",
            borderRadius: 12,
            fontSize: 12,
            color: "#A09B94",
            cursor: "pointer",
            fontWeight: 500,
            transition: "all 0.2s ease",
          }}
        >
          💬 Add a comment...
        </button>
      )}
    </div>
  );
}
