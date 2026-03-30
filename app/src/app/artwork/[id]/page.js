// Artwork Detail page — shows full info about one artwork.
"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import BottomNav from "../../components/BottomNav";
import BookmarkButton from "../../components/BookmarkButton";
import { EMOJI_CATEGORIES } from "../../data/artworks";
import { fetchArtwork } from "../../lib/met-api";
import { getArtwork, getReactionCounts, getMyReaction, saveReaction, getComments, addComment, upsertArtwork, getArtworkRankings } from "../../lib/db";
import { getGuestId, getGuestName } from "../../lib/guest";
import AuthModal from "../../components/AuthModal";

// openCategory / onToggle ensure only one picker is open at a time
function EmojiIntensityPicker({ catKey, category, selected, onSelect, openCategory, onToggle }) {
  const isSelected = selected?.category === catKey;
  const isOpen = openCategory === catKey;

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <button
        onClick={() => onToggle(isOpen ? null : catKey)}
        style={{
          background: isSelected ? `${category.color}15` : "rgba(0,0,0,0.05)",
          border: isSelected ? `2px solid ${category.color}50` : "2px solid rgba(0,0,0,0.08)",
          borderRadius: 14,
          padding: "6px 12px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: 5,
          fontSize: 13,
          fontWeight: 600,
          color: isSelected ? category.color : "#8C8580",
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

      {isOpen && (
        <div style={{
          position: "absolute", bottom: "calc(100% + 10px)", left: "50%", transform: "translateX(-50%)",
          background: "rgba(250,248,245,0.98)", backdropFilter: "blur(20px)",
          borderRadius: 18, padding: "10px 8px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
          display: "flex", gap: 4, zIndex: 100,
          border: `1.5px solid ${category.color}40`,
          animation: "popIn 0.2s cubic-bezier(.4,0,.2,1)",
        }}>
          <div style={{
            position: "absolute", bottom: -8, left: "50%", transform: "translateX(-50%)",
            width: 14, height: 14, background: "rgba(250,248,245,0.98)",
            borderRight: `1.5px solid ${category.color}40`, borderBottom: `1.5px solid ${category.color}40`,
            rotate: "45deg",
          }} />
          {category.levels.map((emoji, i) => (
            <button key={i} onClick={() => { onSelect(catKey, i, emoji); onToggle(null); }}
              style={{
                background: isSelected && selected.level === i ? `${category.color}20` : "transparent",
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
            fontSize: 9, fontWeight: 500,
            color: category.color, whiteSpace: "nowrap", letterSpacing: 1,
          }}>
            MILD → → → INTENSE
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
          borderRadius: "50%", background: "rgba(193,71,111,0.12)",
          border: "1.5px solid rgba(193,71,111,0.25)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: depth > 0 ? 11 : 14, flexShrink: 0, marginTop: 2,
        }}>
          {comment.emoji}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            background: depth > 0 ? "rgba(0,0,0,0.03)" : "#FFF",
            border: `1px solid rgba(0,0,0,${depth > 0 ? "0.05" : "0.07"})`,
            borderRadius: "4px 14px 14px 14px", padding: "8px 12px",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#2D2A26" }}>{comment.user}</span>
              {comment.replyTo && (
                <>
                  <span style={{ fontSize: 10, color: "rgba(0,0,0,0.2)" }}>→</span>
                  <span style={{ fontSize: 10, fontWeight: 600, color: "#C1476F" }}>{comment.replyTo}</span>
                </>
              )}
              <span style={{ fontSize: 10, color: "#A09B94" }}>• just now</span>
            </div>
            <div style={{ fontSize: 13, color: "#6B6560", lineHeight: 1.4 }}>
              {comment.text}
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "4px 4px 0" }}>
            <button onClick={handleLike} style={{
              background: "none", border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", gap: 4, padding: "2px 0",
              fontSize: 11, fontWeight: 600,
              color: liked ? "#C1476F" : "#A09B94",
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
                fontSize: 11, fontWeight: 600, color: "#A09B94",
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
                  flex: 1, background: "#F7F5F0",
                  border: "1.5px solid #E0DDD7", borderRadius: 10,
                  padding: "7px 10px", fontSize: 12,
                  color: "#2D2A26", outline: "none",
                }}
              />
              <button onClick={handleSendReply} style={{
                background: "linear-gradient(135deg, #C1476F 0%, #D4763A 100%)",
                color: "#FFF", border: "none", borderRadius: 10,
                padding: "7px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer",
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
              fontSize: 11, fontWeight: 600, color: "#C1476F",
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
  const { id } = use(params);

  // Start empty — no hardcoded fallback. Data comes from DB + Met API.
  const [artwork, setArtwork] = useState({ id, title: "", artist: "", year: "" });
  const [loading, setLoading] = useState(true);
  const [reactionCounts, setReactionCounts] = useState({});
  const [relatedArtworks, setRelatedArtworks] = useState([]);

  // Load artwork data: try DB first, then Met API
  useEffect(() => {
    let cancelled = false;
    async function loadArtwork() {
      // Try database first
      const dbArt = await getArtwork(id);
      if (!cancelled && dbArt) {
        setArtwork(prev => ({ ...prev, ...dbArt }));
      }

      // Also try the Met API for extra fields (dimensions, description, etc.)
      const apiData = await fetchArtwork(id);
      if (!cancelled && apiData) {
        // Only merge non-null fields so we don't overwrite a valid DB image with null
        const filtered = Object.fromEntries(
          Object.entries(apiData).filter(([, v]) => v != null && v !== "")
        );
        setArtwork(prev => ({ ...prev, ...filtered }));

        // If this artwork isn't in the DB yet, insert it so reactions/comments work
        if (!dbArt) {
          await upsertArtwork(apiData);
        }
      }

      // Load reaction counts from DB
      const counts = await getReactionCounts(id);
      if (!cancelled && counts) {
        setReactionCounts(counts);
      }

      // Load related artworks from DB (other popular artworks in same department)
      const rankings = await getArtworkRankings(6);
      if (!cancelled && rankings) {
        const related = rankings
          .filter(a => a.id !== id)
          .slice(0, 4)
          .map(a => ({
            id: a.id,
            title: a.title,
            artist: a.artist,
            year: a.year,
            image: a.image,
            topEmoji: a.topEmoji || "❤️",
            reactions: a.reaction_count || 0,
          }));
        setRelatedArtworks(related);
      }

      if (!cancelled) setLoading(false);
    }
    loadArtwork();
    return () => { cancelled = true; };
  }, [id]);

  const [selectedReaction, setSelectedReaction] = useState(null);
  const [openCategory, setOpenCategory] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [showAllComments, setShowAllComments] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const visibleComments = showAllComments ? comments : comments.slice(0, 3);

  // Load comments and the user's existing reaction from DB
  useEffect(() => {
    let cancelled = false;
    async function loadDbData() {
      const dbComments = await getComments(id);
      if (!cancelled && dbComments) {
        setComments(dbComments);
      }

      const guestId = getGuestId();
      const myReaction = await getMyReaction(id, guestId);
      if (!cancelled && myReaction) {
        setSelectedReaction(myReaction);
      }
    }
    loadDbData();
    return () => { cancelled = true; };
  }, [id]);

  const handleEmojiSelect = async (category, level, emoji) => {
    setSelectedReaction({ category, level, emoji });

    // Ensure artwork is in DB before saving reaction
    if (artwork.title) {
      await upsertArtwork(artwork);
    }

    // Save to database
    const guestId = getGuestId();
    await saveReaction(id, guestId, category, level, emoji);

    // Refresh counts
    const counts = await getReactionCounts(id);
    if (counts) setReactionCounts(counts);
  };

  const handleAddComment = async () => {
    if (newComment.trim()) {
      const guestId = getGuestId();
      const guestName = getGuestName();
      const emoji = selectedReaction?.emoji || "💬";
      const text = newComment.trim();

      // Ensure artwork is in DB before adding comment
      if (artwork.title) {
        await upsertArtwork(artwork);
      }

      // Optimistic update
      setComments(prev => [...prev, {
        user: guestName, emoji, text, likes: 0, replies: [],
      }]);
      setNewComment("");
      setShowCommentInput(false);
      setShowAllComments(true);

      // Save to DB
      await addComment(id, guestId, guestName, emoji, text);

      // Refresh from DB to get real IDs
      const dbComments = await getComments(id);
      if (dbComments) setComments(dbComments);
    }
  };

  async function handleCommentButtonClick() {
    setShowCommentInput(true);
  }

  return (
    <div className="responsive-page" style={{
      height: "100vh",
      background: "#F7F5F0",
      position: "relative", overflow: "hidden", display: "flex", flexDirection: "column",
    }}>
      {showAuthModal && (
        <AuthModal
          title="Join to comment"
          subtitle="Create a free account to share your thoughts on this artwork."
          onClose={() => setShowAuthModal(false)}
          onSuccess={() => { setShowAuthModal(false); setShowCommentInput(true); }}
          onGuest={() => { setShowAuthModal(false); setShowCommentInput(true); }}
        />
      )}
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
          background: "rgba(0,0,0,0.07)", border: "none", borderRadius: 12,
          width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 18, cursor: "pointer", textDecoration: "none", color: "#2D2A26",
        }}>←</Link>
        <div style={{
          fontSize: 13, fontWeight: 600,
          color: "#8C8580", letterSpacing: "0.06em", textTransform: "uppercase",
        }}>Artwork Details</div>
        <BookmarkButton type="artwork" id={artwork.id} size={40} />
      </div>

      {/* Scrollable Content */}
      <div className="hide-scrollbar" style={{ flex: 1, overflowY: "auto", paddingBottom: 100 }}>

        {/* Hero Image — uncropped, full artwork visible */}
        <div style={{
          width: "100%",
          maxHeight: "50vh",
          minHeight: 180,
          position: "relative",
          overflow: "hidden",
          background: "#E8E4DD",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}>
          {artwork.image ? (
            <img src={artwork.image} alt={artwork.title}
              style={{
                maxWidth: "100%",
                maxHeight: "50vh",
                objectFit: "contain",
              }}
              onError={(e) => { e.target.style.display = "none"; }}
            />
          ) : (
            <div style={{ fontSize: 48, color: "#C4BDB6", padding: "40px 0" }}>🖼️</div>
          )}
          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0, height: 40,
            background: "linear-gradient(transparent, #F7F5F0)",
          }} />
        </div>

        {/* Artwork Info */}
        <div style={{ padding: "0 20px", animation: "fadeUp 0.4s ease" }}>
          <h1 style={{
            fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 700,
            color: "#2D2A26", lineHeight: 1.2, marginBottom: 6,
          }}>
            {artwork.title}
          </h1>
          <div style={{ fontSize: 15, color: "#6B6560", marginBottom: 4 }}>
            {artwork.artist}, {artwork.year}
          </div>
          {(artwork.gallery || artwork.department) && (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
              {artwork.gallery && (
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: 5,
                  padding: "5px 12px", background: "rgba(0,0,0,0.05)",
                  border: "1px solid rgba(0,0,0,0.08)", borderRadius: 12,
                }}>
                  <span style={{ fontSize: 12 }}>📍</span>
                  <span style={{ fontSize: 12, color: "#6B6560", fontWeight: 500 }}>{artwork.gallery}</span>
                </div>
              )}
              {artwork.department && (
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: 5,
                  padding: "5px 12px", background: "rgba(0,0,0,0.05)",
                  border: "1px solid rgba(0,0,0,0.08)", borderRadius: 12,
                }}>
                  <span style={{ fontSize: 12 }}>🖼️</span>
                  <span style={{ fontSize: 12, color: "#6B6560", fontWeight: 500 }}>{artwork.department}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* About This Work */}
        {(artwork.fact || artwork.description) && (
          <div style={{ padding: "16px 20px 0", animation: "fadeUp 0.4s ease 0.1s both" }}>
            <div style={{ background: "#FFF", borderRadius: 16, padding: "14px 16px", border: "1px solid rgba(0,0,0,0.07)" }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#A09B94", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10 }}>
                About This Work
              </div>
              <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 10 }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#2D2A26" }}>{artwork.artist}</div>
                  <div style={{ fontSize: 12, color: "#8C8580" }}>{artwork.year}</div>
                </div>
              </div>
              <p style={{ fontSize: 14, color: "#6B6560", lineHeight: 1.65 }}>{artwork.fact || artwork.description}</p>
            </div>
          </div>
        )}

        {/* Existing Reactions */}
        {Object.keys(reactionCounts).length > 0 && (
          <div style={{ padding: "16px 20px 0", animation: "fadeUp 0.4s ease 0.15s both" }}>
            <div style={{
              fontSize: 12, fontWeight: 600, color: "#8C8580",
              letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 10,
            }}>Reactions ({Object.values(reactionCounts).reduce((a, b) => a + b, 0).toLocaleString()})</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {Object.entries(reactionCounts).map(([emoji, count], i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: 4, padding: "5px 12px",
                  background: "#FFF", border: "1px solid rgba(0,0,0,0.08)", borderRadius: 16,
                }}>
                  <span style={{ fontSize: 16 }}>{emoji}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#6B6560" }}>
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
            fontSize: 12, fontWeight: 600, color: "#8C8580",
            letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 10,
          }}>How Does This Make You Feel?</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {Object.entries(EMOJI_CATEGORIES).map(([key, cat]) => (
              <EmojiIntensityPicker
                key={key}
                catKey={key}
                category={cat}
                selected={selectedReaction}
                onSelect={handleEmojiSelect}
                openCategory={openCategory}
                onToggle={setOpenCategory}
              />
            ))}
          </div>
          {selectedReaction && (
            <div style={{
              marginTop: 12, padding: "10px 14px",
              background: `${EMOJI_CATEGORIES[selectedReaction.category].color}12`,
              border: `1px solid ${EMOJI_CATEGORIES[selectedReaction.category].color}30`,
              borderRadius: 14, display: "flex", alignItems: "center", gap: 8,
              animation: "fadeUp 0.3s ease",
            }}>
              <span style={{ fontSize: 28 }}>{selectedReaction.emoji}</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: EMOJI_CATEGORIES[selectedReaction.category].color }}>
                  {EMOJI_CATEGORIES[selectedReaction.category].label} — Level {selectedReaction.level + 1}
                </div>
                <div style={{ fontSize: 11, color: "#A09B94" }}>
                  Tap another category to change your reaction
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Comments */}
        <div style={{ padding: "24px 20px 0", animation: "fadeUp 0.4s ease 0.25s both" }}>
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12,
          }}>
            <span style={{
              fontSize: 12, fontWeight: 600, color: "#8C8580",
              letterSpacing: "0.06em", textTransform: "uppercase",
            }}>💬 Comments ({comments.length})</span>
            {comments.length > 3 && (
              <button onClick={() => setShowAllComments(!showAllComments)} style={{
                background: "none", border: "none", fontSize: 11, fontWeight: 600,
                color: "#C1476F", cursor: "pointer",
              }}>
                {showAllComments ? "Show less" : `View all ${comments.length}`}
              </button>
            )}
          </div>
          {comments.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {visibleComments.map((c, i) => (
                <CommentBubble key={i} comment={c} delay={0.05 * i} />
              ))}
            </div>
          )}

          {showCommentInput ? (
            <div style={{ marginTop: 12, animation: "fadeUp 0.2s ease" }}>
              <div style={{ display: "flex", gap: 6 }}>
                <input type="text" value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
                  placeholder="Share your thoughts..." autoFocus
                  style={{
                    flex: 1, background: "#FFF",
                    border: "1.5px solid #E0DDD7", borderRadius: 12,
                    padding: "10px 14px", fontSize: 13,
                    color: "#2D2A26", outline: "none",
                  }}
                />
                <button onClick={handleAddComment} style={{
                  background: "linear-gradient(135deg, #C1476F 0%, #D4763A 100%)",
                  color: "#FFF", border: "none", borderRadius: 12,
                  padding: "10px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer",
                }}>Send</button>
              </div>
            </div>
          ) : (
            <button onClick={handleCommentButtonClick} style={{
              width: "100%", marginTop: 12, padding: "10px 14px",
              background: "#FFF", border: "1.5px dashed #D9D5CE",
              borderRadius: 12, fontSize: 12, color: "#A09B94",
              cursor: "pointer", fontWeight: 500,
            }}>
              💬 Add a comment...
            </button>
          )}
        </div>

        {/* Related Artworks — from DB rankings, excluding current */}
        {relatedArtworks.length > 0 && (
          <div style={{ padding: "28px 0 20px", animation: "fadeUp 0.4s ease 0.3s both" }}>
            <div style={{
              padding: "0 20px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12,
            }}>
              <span style={{
                fontSize: 12, fontWeight: 600, color: "#8C8580",
                letterSpacing: "0.06em", textTransform: "uppercase",
              }}>More at The Met</span>
            </div>
            <div className="hide-scrollbar" style={{
              display: "flex", gap: 10, overflowX: "auto", padding: "0 20px 4px",
            }}>
              {relatedArtworks.map((art, i) => (
                <Link key={art.id} href={`/artwork/${art.id}`} style={{ textDecoration: "none" }}>
                  <div style={{
                    flexShrink: 0, width: 150, background: "#FFF",
                    borderRadius: 14, border: "1px solid rgba(0,0,0,0.08)",
                    overflow: "hidden", cursor: "pointer", transition: "transform 0.2s ease",
                    animation: `fadeUp 0.4s ease ${0.35 + i * 0.08}s backwards`,
                    boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
                  }}>
                    <div style={{ width: "100%", height: 105, overflow: "hidden", position: "relative", background: "#E8E4DD" }}>
                      <img src={art.image} alt={art.title}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        onError={(e) => { e.target.style.display = "none"; }}
                      />
                      <div style={{
                        position: "absolute", top: 6, right: 6, width: 28, height: 28, borderRadius: 8,
                        background: "rgba(255,255,255,0.85)", backdropFilter: "blur(8px)",
                        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14,
                      }}>{art.topEmoji}</div>
                    </div>
                    <div style={{ padding: "8px 10px 10px" }}>
                      <div style={{
                        fontSize: 12, fontWeight: 600, color: "#2D2A26", lineHeight: 1.3,
                        display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
                        overflow: "hidden", marginBottom: 3,
                      }}>{art.title}</div>
                      <div style={{
                        fontSize: 10, color: "#8C8580", marginBottom: 6,
                        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                      }}>{art.artist}, {art.year}</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <span style={{ fontSize: 11 }}>{art.topEmoji}</span>
                        <span style={{ fontSize: 10, fontWeight: 600, color: "#8C8580" }}>
                          {art.reactions >= 1000 ? `${(art.reactions / 1000).toFixed(1)}k` : art.reactions}
                        </span>
                        <span style={{ fontSize: 10, color: "#A09B94", marginLeft: 2 }}>reactions</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      <BottomNav variant="light" />
    </div>
  );
}
