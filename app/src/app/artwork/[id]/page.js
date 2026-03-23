// Artwork Detail page — shows full info about one artwork.
// The [id] in the folder name means this page is "dynamic":
//   /artwork/11417 → shows "Washington Crossing the Delaware"
//   /artwork/436105 → shows "The Death of Socrates"
// The "id" comes from the URL and is passed to this component as a prop.
//
// NEW: This page now tries to fetch real artwork data from the Met API.
// If the API is unavailable, it falls back to our hardcoded data.
"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import BottomNav from "../../components/BottomNav";
import { ARTWORK_DETAIL, EMOJI_CATEGORIES, RELATED_ARTWORKS, getArtworkById } from "../../data/artworks";
import { fetchArtwork } from "../../lib/met-api";

function EmojiIntensityPicker({ catKey, category, selected, onSelect }) {
  const [open, setOpen] = useState(false);
  const isSelected = selected?.category === catKey;

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          background: isSelected ? `${category.color}15` : "rgba(255,255,255,0.06)",
          border: isSelected ? `2px solid ${category.color}50` : "2px solid rgba(255,255,255,0.08)",
          borderRadius: 14,
          padding: "6px 12px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: 5,
          fontSize: 13,
          fontWeight: 600,
          color: isSelected ? category.color : "rgba(255,255,255,0.5)",
          transition: "all 0.2s ease",
        }}
      >
        <span style={{ fontSize: 18 }}>{isSelected ? selected.emoji : category.levels[0]}</span>
        <span>{category.label}</span>
        {isSelected && (
          <span style={{
            fontSize: 9, background: category.color, color: "#FFF",
            borderRadius: 6, padding: "1px 5px", marginLeft: 2,
          }}>
            {selected.level + 1}/{category.levels.length}
          </span>
        )}
      </button>

      {open && (
        <div style={{
          position: "absolute", bottom: "calc(100% + 10px)", left: "50%", transform: "translateX(-50%)",
          background: "rgba(20,20,20,0.95)", backdropFilter: "blur(20px)",
          borderRadius: 18, padding: "10px 8px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
          display: "flex", gap: 4, zIndex: 100,
          border: `1.5px solid ${category.color}40`,
          animation: "popIn 0.25s cubic-bezier(.4,0,.2,1)",
        }}>
          <div style={{
            position: "absolute", bottom: -8, left: "50%", transform: "translateX(-50%)",
            width: 14, height: 14, background: "rgba(20,20,20,0.95)",
            borderRight: `1.5px solid ${category.color}40`, borderBottom: `1.5px solid ${category.color}40`,
            rotate: "45deg",
          }} />
          {category.levels.map((emoji, i) => (
            <button key={i} onClick={() => { onSelect(catKey, i, emoji); setOpen(false); }}
              style={{
                background: isSelected && selected.level === i ? `${category.color}30` : "transparent",
                border: isSelected && selected.level === i ? `2px solid ${category.color}` : "2px solid transparent",
                borderRadius: 10, padding: "5px 7px", cursor: "pointer",
                fontSize: 22 + i * 2, transition: "all 0.15s ease",
                display: "flex", alignItems: "center", justifyContent: "center", minWidth: 36,
              }}
              title={`Level ${i + 1}`}
            >{emoji}</button>
          ))}
          <div style={{
            position: "absolute", top: -20, left: "50%", transform: "translateX(-50%)",
            fontSize: 9, fontFamily: "'DM Mono', monospace", fontWeight: 500,
            color: category.color, whiteSpace: "nowrap", letterSpacing: 1,
          }}>
            MILD → → → EXTREME
          </div>
        </div>
      )}
    </div>
  );
}

function CommentBubble({ comment, delay = 0, depth = 0 }) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(comment.likes || 0);
  const [showReplies, setShowReplies] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [localReplies, setLocalReplies] = useState(comment.replies || []);
  const hasReplies = localReplies.length > 0;

  const handleLike = () => {
    setLiked(!liked);
    setLikeCount(liked ? likeCount - 1 : likeCount + 1);
  };

  const handleSendReply = () => {
    if (replyText.trim()) {
      setLocalReplies([...localReplies, {
        user: "You", emoji: "💬", text: replyText.trim(),
        replyTo: comment.user, likes: 0, replies: [],
      }]);
      setReplyText("");
      setShowReplyInput(false);
      setShowReplies(true);
    }
  };

  return (
    <div style={{ animation: `fadeUp 0.35s ease ${delay}s both`, marginLeft: depth > 0 ? 34 : 0 }}>
      <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
        <div style={{
          width: depth > 0 ? 22 : 28, height: depth > 0 ? 22 : 28,
          borderRadius: "50%", background: "rgba(193,71,111,0.15)",
          border: "1.5px solid rgba(193,71,111,0.3)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: depth > 0 ? 11 : 14, flexShrink: 0, marginTop: 2,
        }}>
          {comment.emoji}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            background: depth > 0 ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.06)",
            border: `1px solid rgba(255,255,255,${depth > 0 ? "0.05" : "0.08"})`,
            borderRadius: "4px 14px 14px 14px", padding: "8px 12px",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.8)" }}>{comment.user}</span>
              {comment.replyTo && (
                <>
                  <span style={{ fontSize: 10, color: "rgba(255,255,255,0.2)" }}>→</span>
                  <span style={{ fontSize: 10, fontWeight: 600, color: "rgba(193,71,111,0.8)" }}>{comment.replyTo}</span>
                </>
              )}
              <span style={{ fontSize: 10, color: "rgba(255,255,255,0.25)" }}>• just now</span>
            </div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", lineHeight: 1.4 }}>
              {comment.text}
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "4px 4px 0" }}>
            <button onClick={handleLike} style={{
              background: "none", border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", gap: 4, padding: "2px 0",
              fontSize: 11, fontWeight: 600,
              color: liked ? "#C1476F" : "rgba(255,255,255,0.3)",
            }}>
              <span style={{ fontSize: 13, transition: "transform 0.2s ease", transform: liked ? "scale(1.2)" : "scale(1)" }}>
                {liked ? "❤️" : "🤍"}
              </span>
              {likeCount > 0 && likeCount}
            </button>
            {depth === 0 && (
              <button onClick={() => setShowReplyInput(!showReplyInput)} style={{
                background: "none", border: "none", cursor: "pointer",
                display: "flex", alignItems: "center", gap: 4, padding: "2px 0",
                fontSize: 11, fontWeight: 600,
                color: "rgba(255,255,255,0.3)",
              }}>
                ↩ Reply
              </button>
            )}
          </div>

          {showReplyInput && depth === 0 && (
            <div style={{ display: "flex", gap: 6, marginTop: 6, animation: "fadeUp 0.2s ease" }}>
              <input type="text" value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendReply()}
                placeholder={`Reply to ${comment.user}...`} autoFocus
                style={{
                  flex: 1, background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10,
                  padding: "7px 10px", fontSize: 12,
                  color: "#FFF", outline: "none",
                }}
              />
              <button onClick={handleSendReply} style={{
                background: "linear-gradient(135deg, #C1476F 0%, #D4763A 100%)",
                color: "#FFF", border: "none", borderRadius: 10,
                padding: "7px 12px", fontSize: 12, fontWeight: 700,
                cursor: "pointer",
              }}>Send</button>
            </div>
          )}
        </div>
      </div>

      {hasReplies && (
        <>
          {localReplies.length > 1 && !showReplies && (
            <button onClick={() => setShowReplies(true)} style={{
              background: "none", border: "none", cursor: "pointer",
              fontSize: 11, fontWeight: 600, color: "rgba(193,71,111,0.8)",
              padding: "4px 0 0 40px",
            }}>
              View {localReplies.length} replies ▾
            </button>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 6 }}>
            {(showReplies ? localReplies : localReplies.slice(0, 1)).map((reply, ri) => (
              <CommentBubble key={ri} comment={reply} delay={ri * 0.05} depth={1} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function ArtDetailPage({ params }) {
  // In Next.js 16, params is a Promise — we unwrap it with use()
  const { id } = use(params);

  // Start with hardcoded data, then try to fetch real data from the Met API.
  // This pattern is called "optimistic UI" — show what you have immediately,
  // then upgrade to better data when it arrives.
  const fallbackArtwork = getArtworkById(id) || ARTWORK_DETAIL;
  const [artwork, setArtwork] = useState(fallbackArtwork);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function loadArtwork() {
      const apiData = await fetchArtwork(id);
      if (!cancelled && apiData && apiData.image) {
        // Merge API data with any hardcoded data we have (for reactions/comments)
        setArtwork(prev => ({
          ...prev,           // keep hardcoded reactions, comments, etc.
          ...apiData,         // overwrite with real title, artist, image, etc.
        }));
      }
      if (!cancelled) setLoading(false);
    }
    loadArtwork();
    return () => { cancelled = true; };
  }, [id]);

  const [selectedReaction, setSelectedReaction] = useState(null);
  const [comments, setComments] = useState(artwork.comments || []);
  const [newComment, setNewComment] = useState("");
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [showAllComments, setShowAllComments] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const visibleComments = showAllComments ? comments : comments.slice(0, 3);

  const handleEmojiSelect = (category, level, emoji) => {
    setSelectedReaction({ category, level, emoji });
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      setComments([...comments, {
        user: "You", emoji: selectedReaction?.emoji || "💬",
        text: newComment.trim(), likes: 0, replies: [],
      }]);
      setNewComment("");
      setShowCommentInput(false);
      setShowAllComments(true);
    }
  };

  return (
    <div style={{
      width: "100%", maxWidth: 420, margin: "0 auto", height: "100vh",
      background: "#0A0A0A",
      position: "relative", overflow: "hidden", display: "flex", flexDirection: "column",
    }}>
      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes popIn {
          0% { opacity: 0; transform: translateX(-50%) scale(0.85); }
          100% { opacity: 1; transform: translateX(-50%) scale(1); }
        }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* Header */}
      <div style={{
        padding: "16px 20px 12px", display: "flex", justifyContent: "space-between",
        alignItems: "center", flexShrink: 0, zIndex: 30,
      }}>
        <Link href="/" style={{
          background: "rgba(255,255,255,0.12)", border: "none", borderRadius: 12,
          width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 18, cursor: "pointer", backdropFilter: "blur(10px)", textDecoration: "none",
        }}>←</Link>
        <div style={{
          fontFamily: "'DM Mono', monospace", fontSize: 13, fontWeight: 500,
          color: "rgba(255,255,255,0.7)", letterSpacing: "0.06em", textTransform: "uppercase",
        }}>Artwork Details</div>
        <button style={{
          background: "rgba(255,255,255,0.12)", border: "none", borderRadius: 12,
          width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 18, cursor: "pointer", backdropFilter: "blur(10px)",
        }}>↗</button>
      </div>

      {/* Scrollable Content */}
      <div className="hide-scrollbar" style={{ flex: 1, overflowY: "auto", paddingBottom: 100 }}>

        {/* Hero Image */}
        <div style={{ width: "100%", height: 260, position: "relative", overflow: "hidden" }}>
          <img src={artwork.image} alt={artwork.title}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            onError={(e) => { e.target.style.display = "none"; }}
          />
          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0, height: 80,
            background: "linear-gradient(transparent, #0A0A0A)",
          }} />
        </div>

        {/* Artwork Info */}
        <div style={{ padding: "0 20px", animation: "fadeUp 0.4s ease" }}>
          <h1 style={{
            fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 700,
            color: "#FFF", lineHeight: 1.2, marginBottom: 6,
          }}>
            {artwork.title}
          </h1>
          <div style={{ fontSize: 15, color: "rgba(255,255,255,0.6)", marginBottom: 4 }}>
            {artwork.artist}, {artwork.year}
          </div>
          {artwork.gallery && (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 5,
                padding: "5px 12px", background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12,
              }}>
                <span style={{ fontSize: 12 }}>📍</span>
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", fontWeight: 500 }}>
                  {artwork.gallery}
                </span>
              </div>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 5,
                padding: "5px 12px", background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12,
              }}>
                <span style={{ fontSize: 12 }}>🖼️</span>
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", fontWeight: 500 }}>
                  {artwork.exhibition}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Description — collapsible */}
        {artwork.description && (
          <div style={{ padding: "16px 20px 0", animation: "fadeUp 0.4s ease 0.1s both" }}>
            <button
              onClick={() => setShowAbout(!showAbout)}
              style={{
                width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center",
                background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: showAbout ? "14px 14px 0 0" : 14, padding: "10px 14px",
                cursor: "pointer", transition: "all 0.2s ease",
              }}
            >
              <span style={{
                fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.4)",
                letterSpacing: "0.06em", textTransform: "uppercase",
              }}>About This Work</span>
              <span style={{
                fontSize: 18, color: "rgba(255,255,255,0.35)",
                transition: "transform 0.2s ease",
                transform: showAbout ? "rotate(180deg)" : "rotate(0deg)",
                lineHeight: 1,
              }}>
                {showAbout ? "▴" : "⋯"}
              </span>
            </button>
            {showAbout && (
              <div style={{
                background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                borderTop: "none", borderRadius: "0 0 14px 14px", padding: "12px 14px 14px",
                animation: "fadeUp 0.25s ease",
              }}>
                <p style={{ fontSize: 14, color: "rgba(255,255,255,0.55)", lineHeight: 1.6 }}>
                  {artwork.description}
                </p>
                {artwork.medium && (
                  <div style={{
                    display: "flex", gap: 16, marginTop: 12, padding: "10px 0 0",
                    borderTop: "1px solid rgba(255,255,255,0.06)",
                  }}>
                    <div>
                      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Medium</div>
                      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", marginTop: 2 }}>{artwork.medium}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Dimensions</div>
                      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", marginTop: 2 }}>{artwork.dimensions}</div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Existing Reactions */}
        {artwork.reactions && (
          <div style={{ padding: "16px 20px 0", animation: "fadeUp 0.4s ease 0.15s both" }}>
            <div style={{
              fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.4)",
              letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 10,
            }}>Reactions ({(artwork.totalReactions || Object.values(artwork.reactions).reduce((a, b) => a + b, 0)).toLocaleString()})</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {Object.entries(artwork.reactions).map(([emoji, count], i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: 4, padding: "5px 12px",
                  background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16,
                }}>
                  <span style={{ fontSize: 16 }}>{emoji}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.5)" }}>
                    {count >= 1000 ? `${(count / 1000).toFixed(1)}k` : count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Your Reaction — Emoji Intensity Picker */}
        <div style={{ padding: "20px 20px 0", animation: "fadeUp 0.4s ease 0.2s both" }}>
          <div style={{
            fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.4)",
            letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 10,
          }}>How Does This Make You Feel?</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {Object.entries(EMOJI_CATEGORIES).map(([key, cat]) => (
              <EmojiIntensityPicker key={key} catKey={key} category={cat}
                selected={selectedReaction} onSelect={handleEmojiSelect}
              />
            ))}
          </div>
          {selectedReaction && (
            <div style={{
              marginTop: 12, padding: "10px 14px",
              background: `${EMOJI_CATEGORIES[selectedReaction.category].color}15`,
              border: `1px solid ${EMOJI_CATEGORIES[selectedReaction.category].color}30`,
              borderRadius: 14, display: "flex", alignItems: "center", gap: 8,
              animation: "fadeUp 0.3s ease",
            }}>
              <span style={{ fontSize: 28 }}>{selectedReaction.emoji}</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: EMOJI_CATEGORIES[selectedReaction.category].color }}>
                  {EMOJI_CATEGORIES[selectedReaction.category].label} — Level {selectedReaction.level + 1}
                </div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>
                  Tap another emoji to change your reaction
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Comments */}
        {comments.length > 0 && (
          <div style={{ padding: "24px 20px 0", animation: "fadeUp 0.4s ease 0.25s both" }}>
            <div style={{
              display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12,
            }}>
              <span style={{
                fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.4)",
                letterSpacing: "0.06em", textTransform: "uppercase",
              }}>💬 Comments ({comments.length})</span>
              {comments.length > 3 && (
                <button onClick={() => setShowAllComments(!showAllComments)} style={{
                  background: "none", border: "none", fontSize: 11, fontWeight: 600,
                  color: "rgba(193,71,111,0.8)", cursor: "pointer",
                }}>
                  {showAllComments ? "Show less" : `View all ${comments.length}`}
                </button>
              )}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {visibleComments.map((c, i) => (
                <CommentBubble key={i} comment={c} delay={0.05 * i} />
              ))}
            </div>

            {showCommentInput ? (
              <div style={{ marginTop: 12, animation: "fadeUp 0.2s ease" }}>
                <div style={{ display: "flex", gap: 6 }}>
                  <input type="text" value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
                    placeholder="Share your thoughts..." autoFocus
                    style={{
                      flex: 1, background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12,
                      padding: "10px 14px", fontSize: 13,
                      color: "#FFF", outline: "none",
                    }}
                  />
                  <button onClick={handleAddComment} style={{
                    background: "linear-gradient(135deg, #C1476F 0%, #D4763A 100%)",
                    color: "#FFF", border: "none", borderRadius: 12,
                    padding: "10px 16px", fontSize: 13, fontWeight: 700,
                    cursor: "pointer",
                  }}>Send</button>
                </div>
              </div>
            ) : (
              <button onClick={() => setShowCommentInput(true)} style={{
                width: "100%", marginTop: 12, padding: "10px 14px",
                background: "rgba(255,255,255,0.04)", border: "1px dashed rgba(255,255,255,0.12)",
                borderRadius: 12, fontSize: 12, color: "rgba(255,255,255,0.35)",
                cursor: "pointer", fontWeight: 500,
              }}>
                💬 Add a comment...
              </button>
            )}
          </div>
        )}

        {/* Related Artworks */}
        <div style={{ padding: "28px 0 20px", animation: "fadeUp 0.4s ease 0.3s both" }}>
          <div style={{
            padding: "0 20px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12,
          }}>
            <span style={{
              fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.4)",
              letterSpacing: "0.06em", textTransform: "uppercase",
            }}>Also in {artwork.exhibition || "The Met"}</span>
            <span style={{ fontSize: 11, color: "rgba(193,71,111,0.8)", fontWeight: 500, cursor: "pointer" }}>
              View all →
            </span>
          </div>
          <div className="hide-scrollbar" style={{
            display: "flex", gap: 10, overflowX: "auto",
            padding: "0 20px 4px",
          }}>
            {RELATED_ARTWORKS.map((art, i) => (
              <Link key={i} href={`/artwork/${art.id}`} style={{ textDecoration: "none" }}>
                <div style={{
                  flexShrink: 0, width: 150, background: "rgba(15,15,15,0.75)",
                  backdropFilter: "blur(20px)", borderRadius: 14,
                  border: "1px solid rgba(255,255,255,0.08)", overflow: "hidden",
                  cursor: "pointer", transition: "transform 0.2s ease",
                  animation: `fadeUp 0.4s ease ${0.35 + i * 0.08}s backwards`,
                }}>
                  <div style={{ width: "100%", height: 105, overflow: "hidden", position: "relative", background: "#1a1a1a" }}>
                    <img src={art.image} alt={art.title}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      onError={(e) => { e.target.style.display = "none"; }}
                    />
                    <div style={{
                      position: "absolute", top: 6, right: 6, width: 28, height: 28, borderRadius: 8,
                      background: "rgba(0,0,0,0.55)", backdropFilter: "blur(8px)",
                      display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14,
                    }}>{art.topEmoji}</div>
                  </div>
                  <div style={{ padding: "8px 10px 10px" }}>
                    <div style={{
                      fontSize: 12, fontWeight: 600, color: "#FFF", lineHeight: 1.3,
                      display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
                      overflow: "hidden", marginBottom: 3,
                    }}>{art.title}</div>
                    <div style={{
                      fontSize: 10, color: "rgba(255,255,255,0.4)", marginBottom: 6,
                      whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                    }}>{art.artist}, {art.year}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <span style={{ fontSize: 11 }}>{art.topEmoji}</span>
                      <span style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.35)" }}>
                        {art.reactions >= 1000 ? `${(art.reactions / 1000).toFixed(1)}k` : art.reactions}
                      </span>
                      <span style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", marginLeft: 2 }}>reactions</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNav variant="dark" />
    </div>
  );
}
