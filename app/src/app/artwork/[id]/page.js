// Artwork Detail page — shows full info about one artwork.
"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import BottomNav from "../../components/BottomNav";
import BookmarkButton from "../../components/BookmarkButton";
import CommentsSection from "../../components/CommentsSection";
import { EMOJI_CATEGORIES } from "../../data/artworks";
import { fetchArtwork, fetchMetMapUrlForGallery, fixMetImageUrl } from "../../lib/met-api";
import { getArtwork, getReactionCounts, getMyReaction, saveReaction, upsertArtwork, getArtworkRankings } from "../../lib/db";

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

export default function ArtDetailPage({ params }) {
  const { id } = use(params);
  const metObjectUrl = `https://www.metmuseum.org/art/collection/search/${encodeURIComponent(id)}`;

  // Start empty — no hardcoded fallback. Data comes from DB + Met API.
  const [artwork, setArtwork] = useState({ id, title: "", artist: "", year: "" });
  const [reactionCounts, setReactionCounts] = useState({});
  const [relatedArtworks, setRelatedArtworks] = useState([]);
  const [metMapUrl, setMetMapUrl] = useState(null);

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

        // Always update DB with fresh API data (keeps image URLs current)
        await upsertArtwork({ ...dbArt, ...filtered });
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

    }
    loadArtwork();
    return () => { cancelled = true; };
  }, [id]);

  const [selectedReaction, setSelectedReaction] = useState(null);
  const [openCategory, setOpenCategory] = useState(null);
  const [showAbout, setShowAbout] = useState(false);

  // Load the user's existing reaction from DB
  useEffect(() => {
    let cancelled = false;
    async function loadDbData() {
      const myReaction = await getMyReaction(id);
      if (!cancelled && myReaction) {
        setSelectedReaction(myReaction);
      }
    }
    loadDbData();
    return () => { cancelled = true; };
  }, [id]);

  useEffect(() => {
    let cancelled = false;

    async function loadMetMapUrl() {
      if (!artwork.gallery) {
        setMetMapUrl(null);
        return;
      }

      const url = await fetchMetMapUrlForGallery(artwork.gallery);
      if (!cancelled) {
        setMetMapUrl(url);
      }
    }

    loadMetMapUrl();
    return () => { cancelled = true; };
  }, [artwork.gallery]);

  const handleEmojiSelect = async (category, level, emoji) => {
    setSelectedReaction({ category, level, emoji });

    // Ensure artwork is in DB before saving reaction
    if (artwork.title) {
      await upsertArtwork(artwork);
    }

    // Save to database
    await saveReaction(id, category, level, emoji);

    // Refresh counts
    const counts = await getReactionCounts(id);
    if (counts) setReactionCounts(counts);
  };
  return (
    <div className="responsive-page" style={{
      height: "100vh",
      background: "#F7F5F0",
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
      <div className="hide-scrollbar" style={{ flex: 1, overflowY: "auto", paddingBottom: "calc(100px + env(safe-area-inset-bottom, 0px))" }}>

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
            <img src={fixMetImageUrl(artwork.image)} alt={artwork.title}
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
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
            <a
              href={metObjectUrl}
              target="_blank"
              rel="noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 12px",
                borderRadius: 12,
                background: "#FFF",
                border: "1px solid rgba(0,0,0,0.08)",
                color: "#2D2A26",
                fontSize: 13,
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              View on The Met
              <span aria-hidden="true">↗</span>
            </a>
            {metMapUrl && (
              <a
                href={metMapUrl}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 12px",
                  borderRadius: 12,
                  background: "#2D2A26",
                  border: "1px solid #2D2A26",
                  color: "#FFF",
                  fontSize: 13,
                  fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                View Map
                <span aria-hidden="true">↗</span>
              </a>
            )}
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

        {/* About This Work — collapsed behind a Learn More button */}
        {(artwork.fact || artwork.description) && (
          <div style={{ padding: "16px 20px 0", animation: "fadeUp 0.4s ease 0.1s both" }}>
            {!showAbout ? (
              <button
                onClick={() => setShowAbout(true)}
                style={{
                  width: "100%", padding: "12px 16px", borderRadius: 16,
                  background: "#FFF", border: "1px solid rgba(0,0,0,0.07)",
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#2D2A26",
                }}
              >
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span>📖</span>
                  <span>Learn more about this work</span>
                </span>
                <span style={{ fontSize: 16, color: "#A09B94" }}>▾</span>
              </button>
            ) : (
              <div style={{ background: "#FFF", borderRadius: 16, padding: "14px 16px", border: "1px solid rgba(0,0,0,0.07)", animation: "fadeUp 0.3s ease" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "#A09B94", textTransform: "uppercase", letterSpacing: 0.5 }}>
                    About This Work
                  </div>
                  <button
                    onClick={() => setShowAbout(false)}
                    style={{
                      background: "transparent", border: "none", cursor: "pointer",
                      fontSize: 12, fontWeight: 600, color: "#A09B94", padding: 4,
                    }}
                  >
                    Hide ▴
                  </button>
                </div>
                <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 10 }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#2D2A26" }}>{artwork.artist}</div>
                    <div style={{ fontSize: 12, color: "#8C8580" }}>{artwork.year}</div>
                  </div>
                </div>
                <p style={{ fontSize: 14, color: "#6B6560", lineHeight: 1.65 }}>{artwork.fact || artwork.description}</p>
              </div>
            )}
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
          <CommentsSection
            key={id}
            artworkId={id}
            color="#C1476F"
            initialVisibleCount={3}
            commentEmoji={selectedReaction?.emoji || "💬"}
          />
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
                    <div style={{ width: "100%", height: 105, overflow: "hidden", position: "relative", background: "#E8E4DD", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <img src={fixMetImageUrl(art.image)} alt={art.title}
                        style={{ width: "100%", height: "100%", objectFit: "contain" }}
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
