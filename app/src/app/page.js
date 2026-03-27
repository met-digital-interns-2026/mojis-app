// Homepage — the main page visitors see at "/"
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import BottomNav from "./components/BottomNav";
import BookmarkButton from "./components/BookmarkButton";
import CommentsSection from "./components/CommentsSection";
import { getAvatar } from "./lib/guest";
import { getTopByCategory } from "./lib/db";

// Category whose comments have the most total likes — shown as a featured wide card on desktop
function totalCommentLikes(cat) {
  return (cat.artwork.comments || []).reduce((s, c) =>
    s + (c.likes || 0) + (c.replies || []).reduce((rs, r) => rs + (r.likes || 0), 0), 0);
}
function getFeaturedIdx(categories) {
  return categories.reduce(
    (best, cat, i, arr) => totalCommentLikes(cat) > totalCommentLikes(arr[best]) ? i : best, 0
  );
}

// Map emotion category keys to display info
const CATEGORY_DISPLAY = {
  sad:        { emoji: "😢", label: "Saddest",       color: "#4A6FA5", bgGrad: "linear-gradient(135deg, #4A6FA5 0%, #2D4A7A 100%)" },
  love:       { emoji: "❤️", label: "Most Loved",     color: "#C1476F", bgGrad: "linear-gradient(135deg, #C1476F 0%, #8B2252 100%)" },
  scary:      { emoji: "😱", label: "Most Shocking",   color: "#D4763A", bgGrad: "linear-gradient(135deg, #D4763A 0%, #A04E1B 100%)" },
  confused:   { emoji: "🤔", label: "Most Puzzling",   color: "#6B7B5E", bgGrad: "linear-gradient(135deg, #6B7B5E 0%, #4A5940 100%)" },
  mindblowing:{ emoji: "🤯", label: "Mind-blowing",    color: "#00BCD4", bgGrad: "linear-gradient(135deg, #00BCD4 0%, #00838F 100%)" },
  funny:      { emoji: "😂", label: "Funniest",        color: "#FFD600", bgGrad: "linear-gradient(135deg, #FFD600 0%, #F9A825 100%)" },
  disgusted:  { emoji: "🤢", label: "Most Disgusting", color: "#7CB342", bgGrad: "linear-gradient(135deg, #7CB342 0%, #558B2F 100%)" },
  angry:      { emoji: "🔥", label: "Most Heated",     color: "#F44336", bgGrad: "linear-gradient(135deg, #F44336 0%, #C62828 100%)" },
};

export default function HomePage() {
  const [loaded, setLoaded] = useState(false);
  const [expandedCard, setExpandedCard] = useState(null);
  const [headerScrolled, setHeaderScrolled] = useState(false);
  const [avatar, setAvatar] = useState("👤");
  const [isDesktop, setIsDesktop] = useState(false);
  const [categories, setCategories] = useState([]);
  const [featuredIdx, setFeaturedIdx] = useState(0);

  // Load category leaders from DB
  useEffect(() => {
    async function loadFromDb() {
      const dbData = await getTopByCategory();
      if (!dbData || Object.keys(dbData).length === 0) return;

      // Build categories array from DB data
      const dbCategories = Object.entries(dbData)
        .filter(([cat]) => CATEGORY_DISPLAY[cat])
        .map(([cat, data]) => ({
          emoji: CATEGORY_DISPLAY[cat].emoji,
          label: CATEGORY_DISPLAY[cat].label,
          count: data.count,
          color: CATEGORY_DISPLAY[cat].color,
          bgGrad: CATEGORY_DISPLAY[cat].bgGrad,
          exhibition: data.department || "",
          artwork: data.artwork,
        }))
        .sort((a, b) => b.count - a.count);

      if (dbCategories.length > 0) {
        setCategories(dbCategories);
        setFeaturedIdx(getFeaturedIdx(dbCategories));
      }
    }
    loadFromDb();
  }, []);

  useEffect(() => {
    setLoaded(true);
    setAvatar(getAvatar());

    const checkDesktop = () => setIsDesktop(window.innerWidth >= 1024);
    checkDesktop();
    window.addEventListener("resize", checkDesktop);

    const handleScroll = (e) => {
      setHeaderScrolled((e.target.scrollTop ?? window.scrollY) > 40);
    };
    const el = document.querySelector(".app-scroll");
    if (el) el.addEventListener("scroll", handleScroll);
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("resize", checkDesktop);
      el?.removeEventListener("scroll", handleScroll);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div
      className="responsive-page"
      style={{
        height: isDesktop ? "auto" : "100vh",
        minHeight: isDesktop ? "100vh" : "auto",
        background: "#F7F5F0",
        position: "relative",
        overflow: isDesktop ? "visible" : "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.15); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        .category-card {
          transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
        }
        .category-card:active { transform: scale(0.97); }
        .artwork-img { transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1); }
        .category-card:hover .artwork-img { transform: scale(1.05); }
        .emoji-pill { transition: all 0.2s ease; }
        .emoji-pill:hover { transform: scale(1.1); }
        .trending-item { transition: all 0.2s ease; cursor: pointer; }
        .trending-item:active { transform: scale(0.98); background: rgba(0,0,0,0.04); }
        .app-scroll { overflow-y: auto; flex: 1; }
        .app-scroll::-webkit-scrollbar { display: none; }
        @media (min-width: 1024px) {
          .app-scroll { overflow-y: visible; flex: none; }
        }
      `}</style>

      {/* Header — hidden on desktop (sidebar has the logo) */}
      {!isDesktop && (
        <div style={{
          padding: "16px 20px 8px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexShrink: 0,
          transition: "all 0.3s ease",
          borderBottom: headerScrolled ? "1px solid rgba(0,0,0,0.06)" : "1px solid transparent",
          background: headerScrolled ? "rgba(247,245,240,0.95)" : "transparent",
          backdropFilter: headerScrolled ? "blur(10px)" : "none",
          zIndex: 10,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: "linear-gradient(135deg, #2D2A26 0%, #5C574E 100%)",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
            }}>🏛️</div>
            <div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: "#2D2A26", lineHeight: 1.1 }}>
                Moji Museum
              </div>
              <div style={{ fontSize: 11, color: "#8C8580", fontWeight: 400, letterSpacing: "0.02em" }}>
                The Met — 847 visitors reacting now
              </div>
            </div>
          </div>
          <Link href="/profile" style={{ textDecoration: "none" }}>
            <div style={{
              width: 36, height: 36, borderRadius: "50%", background: "#EDEAE4",
              overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 18, cursor: "pointer", flexShrink: 0,
            }}>
              {avatar.startsWith("http") ? (
                <Image src={avatar} alt="avatar" width={36} height={36}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }} unoptimized />
              ) : avatar}
            </div>
          </Link>
        </div>
      )}

      {/* Desktop page header */}
      {isDesktop && (
        <div style={{ padding: "36px 28px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, fontWeight: 700, color: "#2D2A26", letterSpacing: -0.5 }}>
              Top Reactions
            </h1>
            <p style={{ fontSize: 14, color: "#8C8580", marginTop: 4 }}>
              Most reacted artworks at The Met this week
            </p>
          </div>
          <Link href="/profile" style={{ textDecoration: "none" }}>
            <div style={{
              width: 44, height: 44, borderRadius: "50%", background: "#EDEAE4",
              overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 22, cursor: "pointer", flexShrink: 0,
            }}>
              {avatar.startsWith("http") ? (
                <Image src={avatar} alt="avatar" width={44} height={44}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }} unoptimized />
              ) : avatar}
            </div>
          </Link>
        </div>
      )}

      {/* Scrollable Content */}
      <div className="app-scroll nav-spacer" style={{ padding: isDesktop ? "0" : "0" }}>

        {/* Section header — mobile only (desktop header is above) */}
        {!isDesktop && (
          <div style={{
            padding: "24px 20px 12px", display: "flex", justifyContent: "space-between", alignItems: "baseline",
            opacity: loaded ? 1 : 0,
            animation: loaded ? "fadeUp 0.5s ease 0.2s forwards" : "none",
            animationFillMode: "backwards",
          }}>
            <div>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 700, color: "#2D2A26", letterSpacing: "-0.01em" }}>
                Top Reactions
              </h2>
              <p style={{ fontSize: 13, color: "#8C8580", marginTop: 2 }}>Most reacted artworks this week</p>
            </div>
            <span style={{ fontSize: 13, fontWeight: 500, color: "#C1476F", cursor: "pointer" }}>See all →</span>
          </div>
        )}

        {/* Category Cards — 1-col on mobile/tablet, 2-col on desktop */}
        {categories.length === 0 && loaded && (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "#A09B94" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🏛️</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: "#6B6560" }}>No reactions yet</div>
            <div style={{ fontSize: 13, marginTop: 4 }}>Scan artworks and share how they make you feel!</div>
          </div>
        )}
        <div className="cards-grid" style={{ marginTop: isDesktop ? 24 : 0 }}>
          {categories.map((cat, i) => {
            const isFeatured = isDesktop && i === featuredIdx;
            const topComments = isFeatured
              ? [...(cat.artwork.comments || [])].sort((a, b) => (b.likes || 0) - (a.likes || 0)).slice(0, 3)
              : [];

            // Shared card content (left side for featured, full card otherwise)
            const cardContent = (
              <>
                {/* Card Header */}
                <div style={{ padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{
                      width: 42, height: 42, borderRadius: 12, background: cat.bgGrad,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 22, animation: "float 3s ease infinite", animationDelay: `${i * 0.5}s`,
                    }}>{cat.emoji}</div>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: "#2D2A26" }}>{cat.label}</div>
                      <div style={{ fontSize: 12, color: "#8C8580" }}>{cat.count.toLocaleString()} reactions</div>
                    </div>
                  </div>
                  <div style={{ padding: "4px 10px", borderRadius: 20, background: "#F2EFE9", fontSize: 11, fontWeight: 500, color: "#6B6560" }}>
                    {cat.exhibition}
                  </div>
                </div>

                {/* Artwork Preview */}
                <Link href={`/artwork/${cat.artwork.id}`} style={{ textDecoration: "none" }}>
                  <div style={{ position: "relative", height: 200, overflow: "hidden", background: "#E8E4DD" }}>
                    <img
                      className="artwork-img"
                      src={cat.artwork.image}
                      alt={cat.artwork.title}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      onError={(e) => { e.target.style.display = "none"; }}
                    />
                    <div style={{ position: "absolute", top: 10, right: 10, zIndex: 5 }} onClick={e => e.stopPropagation()}>
                      <BookmarkButton type="artwork" id={cat.artwork.id} size={32} />
                    </div>
                    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 100, background: "linear-gradient(transparent, rgba(45,42,38,0.75))" }} />
                    <div style={{ position: "absolute", bottom: 12, left: 14, right: 14 }}>
                      <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 700, color: "#FFF", lineHeight: 1.2, textShadow: "0 1px 3px rgba(0,0,0,0.3)" }}>
                        {cat.artwork.title}
                      </div>
                      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.8)", marginTop: 2 }}>
                        {cat.artwork.artist}, {cat.artwork.year}
                      </div>
                    </div>
                  </div>
                </Link>

                {/* Reaction pills */}
                <div style={{ padding: "12px 14px", display: "flex", gap: 8, alignItems: "center" }}>
                  {Object.entries(cat.artwork.reactions).map(([emoji, count], j) => (
                    <div key={j} className="emoji-pill" style={{
                      display: "flex", alignItems: "center", gap: 5, padding: "5px 10px",
                      borderRadius: 20,
                      background: j === 0 ? `${cat.color}15` : "#F5F3EE",
                      border: j === 0 ? `1.5px solid ${cat.color}30` : "1.5px solid transparent",
                      cursor: "pointer",
                    }}>
                      <span style={{ fontSize: 15 }}>{emoji}</span>
                      <span style={{ fontSize: 12, fontWeight: 600, color: j === 0 ? cat.color : "#6B6560" }}>
                        {count >= 1000 ? `${(count / 1000).toFixed(1)}k` : count}
                      </span>
                    </div>
                  ))}
                  <div style={{ marginLeft: "auto", fontSize: 12, color: "#A09B94", cursor: "pointer", fontWeight: 500 }}>
                    + React
                  </div>
                </div>

                {/* Comments */}
                {cat.artwork.comments?.length > 0 && (
                  <CommentsSection comments={cat.artwork.comments} color={cat.color} />
                )}
              </>
            );

            return (
              <div
                key={i}
                className="category-card"
                onClick={() => setExpandedCard(expandedCard === i ? null : i)}
                style={{
                  gridColumn: isFeatured ? "1 / -1" : undefined,
                  borderRadius: 20,
                  overflow: "hidden",
                  background: "#FFF",
                  boxShadow: "0 2px 16px rgba(45,42,38,0.06), 0 0.5px 2px rgba(45,42,38,0.04)",
                  opacity: loaded ? 1 : 0,
                  animation: loaded ? `fadeUp 0.5s ease ${0.3 + i * 0.1}s forwards` : "none",
                  animationFillMode: "backwards",
                }}
              >
                {isFeatured ? (
                  /* Featured: card content left + most-loved comments right */
                  <div style={{ display: "flex" }}>
                    <div style={{ flex: "1 1 0", minWidth: 0 }}>{cardContent}</div>
                    <div style={{
                      width: 300, flexShrink: 0,
                      borderLeft: "1px solid rgba(0,0,0,0.06)",
                      background: "#FAFAF8",
                      padding: "20px 18px",
                      display: "flex", flexDirection: "column", gap: 12,
                    }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "#A09B94", textTransform: "uppercase", letterSpacing: 0.5 }}>
                        💬 Most Loved Comments
                      </div>
                      {topComments.map((c, ci) => (
                        <div key={ci} style={{
                          padding: "12px 14px", background: "#FFF",
                          borderRadius: 14, border: "1px solid rgba(0,0,0,0.07)",
                          boxShadow: "0 1px 6px rgba(0,0,0,0.04)",
                        }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                            <span style={{ fontSize: 15 }}>{c.emoji}</span>
                            <span style={{ fontSize: 12, fontWeight: 700, color: "#2D2A26" }}>{c.user}</span>
                            <span style={{ marginLeft: "auto", fontSize: 11, fontWeight: 600, color: "#C1476F" }}>
                              ❤️ {c.likes}
                            </span>
                          </div>
                          <div style={{ fontSize: 13, color: "#6B6560", lineHeight: 1.45 }}>{c.text}</div>
                        </div>
                      ))}
                      <Link href={`/artwork/${cat.artwork.id}`} style={{ textDecoration: "none", marginTop: "auto" }} onClick={e => e.stopPropagation()}>
                        <div style={{
                          textAlign: "center", padding: "10px 14px",
                          background: `${cat.color}10`,
                          border: `1.5px solid ${cat.color}25`,
                          borderRadius: 12, fontSize: 12, fontWeight: 600, color: cat.color,
                        }}>
                          See all comments →
                        </div>
                      </Link>
                    </div>
                  </div>
                ) : cardContent}
              </div>
            );
          })}
        </div>

        <div style={{ height: 20 }} />
      </div>

      <BottomNav variant="light" />
    </div>
  );
}
