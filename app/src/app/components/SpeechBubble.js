// Speech bubble comment component used by both the homepage and detail page.
// All comment data is expected to come from the database; this component only
// handles presentation plus local UI affordances like collapsing replies.
"use client";

import { useState } from "react";
import { useTranslations } from "../lib/i18n";

export default function SpeechBubble({
  comment,
  color,
  delay = 0,
  onReply,
  onToggleLike,
  likedCommentIds,
  depth = 0,
  actionsDisabled = false,
}) {
  const t = useTranslations("speechBubble");
  const [showReplies, setShowReplies] = useState(false);

  const handleLike = (e) => {
    e.stopPropagation();
    if (actionsDisabled || !comment.id || !onToggleLike) {
      return;
    }
    onToggleLike(comment);
  };

  const handleReply = (e) => {
    e.stopPropagation();
    if (actionsDisabled) {
      return;
    }
    if (onReply) onReply(comment);
  };

  const hasReplies = comment.replies && comment.replies.length > 0;
  const liked = comment.id != null && likedCommentIds?.has(comment.id);
  const likeCount = comment.likes || 0;

  return (
    <div style={{
      animation: `fadeUp 0.35s ease ${delay}s both`,
      marginLeft: depth > 0 ? 36 : 0,
    }}>
      <div style={{
        display: "flex",
        gap: 8,
        alignItems: "flex-start",
      }}>
        {/* Avatar circle */}
        <div style={{
          width: depth > 0 ? 24 : 28,
          height: depth > 0 ? 24 : 28,
          borderRadius: "50%",
          background: `${color}20`,
          border: `1.5px solid ${color}40`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: depth > 0 ? 12 : 14,
          flexShrink: 0,
          marginTop: 2,
        }}>
          {comment.emoji}
        </div>
        {/* Bubble */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            position: "relative",
            padding: depth > 0 ? "16px 20px 22px 24px" : "20px 24px 26px 28px",
            minHeight: depth > 0 ? 60 : 72,
          }}>
            {/* Puffy cloud background */}
            <svg
              viewBox="0 0 200 100"
              preserveAspectRatio="none"
              aria-hidden="true"
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                zIndex: 0,
                filter: "drop-shadow(0 1px 3px rgba(45,42,38,0.06))",
              }}
            >
              <path
                d="M 35 35 C 35 10 70 10 75 30 C 80 5 115 5 120 30 C 125 10 160 10 165 35 C 190 35 195 65 175 70 C 195 85 165 95 155 80 C 145 95 115 95 110 80 C 100 95 70 95 65 80 C 55 95 25 90 25 70 L 5 95 L 25 65 C 5 60 5 35 35 35 Z"
                fill={depth > 0 ? "#F9F7F4" : "#FFF"}
                stroke={depth > 0 ? "#EDEAE4" : "#E8E4DD"}
                strokeWidth="2"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                marginBottom: 3,
              }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#2D2A26" }}>
                  {comment.user}
                </span>
                {comment.replyTo && (
                  <>
                    <span style={{ fontSize: 10, color: "#A09B94" }}>→</span>
                    <span style={{ fontSize: 10, fontWeight: 600, color: color }}>
                      {comment.replyTo}
                    </span>
                  </>
                )}
                <span style={{ fontSize: 10, color: "#A09B94" }}>• {t("timeJustNow")}</span>
              </div>
              <div style={{ fontSize: 13, color: "#4A453D", lineHeight: 1.4 }}>
                {comment.text}
              </div>
            </div>
          </div>

          {/* Like & Reply buttons */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "4px 4px 0",
          }}>
            <button
              onClick={handleLike}
              disabled={actionsDisabled || !comment.id || !onToggleLike}
              style={{
                background: "none",
                border: "none",
                cursor: actionsDisabled || !comment.id || !onToggleLike ? "default" : "pointer",
                display: "flex",
                alignItems: "center",
                gap: 4,
                padding: "2px 0",
                fontSize: 11,
                fontWeight: 600,
                color: liked ? "#C1476F" : "#A09B94",
                transition: "all 0.2s ease",
                opacity: actionsDisabled || !comment.id || !onToggleLike ? 0.6 : 1,
              }}
            >
              <span style={{
                fontSize: 13,
                transition: "transform 0.2s ease",
                transform: liked ? "scale(1.2)" : "scale(1)",
              }}>
                {liked ? "❤️" : "🤍"}
              </span>
              {likeCount > 0 && likeCount}
            </button>
            {depth === 0 && (
              <button
                onClick={handleReply}
                disabled={actionsDisabled || !onReply}
                style={{
                  background: "none",
                  border: "none",
                  cursor: actionsDisabled || !onReply ? "default" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  padding: "2px 0",
                  fontSize: 11,
                  fontWeight: 600,
                  color: "#A09B94",
                  transition: "color 0.2s ease",
                  opacity: actionsDisabled || !onReply ? 0.6 : 1,
                }}
              >
                {t("reply")}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Replies */}
      {hasReplies && (
        <>
          {comment.replies.length > 1 && !showReplies ? (
            <button
              onClick={(e) => { e.stopPropagation(); setShowReplies(true); }}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: 11,
                fontWeight: 600,
                color: color,
                padding: "4px 0 0 44px",
              }}
            >
              {t("viewReplies", { count: comment.replies.length })}
            </button>
          ) : null}
          <div style={{
            display: "flex",
            flexDirection: "column",
            gap: 6,
            marginTop: 6,
          }}>
            {(showReplies ? comment.replies : comment.replies.slice(0, 1)).map((reply, ri) => (
              <SpeechBubble
                key={ri}
                comment={reply}
                color={color}
                delay={ri * 0.05}
                onToggleLike={onToggleLike}
                likedCommentIds={likedCommentIds}
                depth={1}
                actionsDisabled={actionsDisabled}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
