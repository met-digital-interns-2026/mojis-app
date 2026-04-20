// Homepage — the main page visitors see at "/"
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import BottomNav from "./components/BottomNav";
import BookmarkButton from "./components/BookmarkButton";
import TopNav from "./components/TopNav";
import { getTopByCategory } from "./lib/db";
import { fixMetImageUrl } from "./lib/met-api";
import { useTranslations } from "./lib/i18n";

function getCommentTime(comment) {
  const time = Date.parse(comment?.createdAt || "");
  return Number.isNaN(time) ? 0 : time;
}

function getLatestComments(comments = [], limit = 1) {
  return [...comments]
    .sort((a, b) => getCommentTime(b) - getCommentTime(a))
    .slice(0, limit);
}

function CommentPreview({ artworkId, comment, color, label }) {
  const t = useTranslations("home");
  if (!comment) return null;

  return (
    <Link
      href={`/artwork/${artworkId}`}
      style={{ textDecoration: "none" }}
      onClick={(e) => e.stopPropagation()}
    >
      <div style={{
        margin: "0 14px 14px",
        padding: "12px 14px",
        background: "#FAFAF8",
        borderTop: "1px solid #F2EFE9",
        borderRadius: 8,
      }}>
        <div style={{
          fontSize: 10,
          fontWeight: 700,
          color: "#A09B94",
          textTransform: "uppercase",
          letterSpacing: 0.5,
          marginBottom: 7,
        }}>
          {label}
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
          <span style={{ fontSize: 16, lineHeight: 1.3 }}>{comment.emoji || "💬"}</span>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{
              fontSize: 13,
              color: "#4B4742",
              lineHeight: 1.45,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}>
              {comment.text}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 7 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#6B6560" }}>
                {comment.user}
              </span>
              {(comment.likes || 0) > 0 && (
                <span style={{ fontSize: 11, fontWeight: 700, color: "#C1476F" }}>
                  ❤️ {comment.likes}
                </span>
              )}
              <span style={{ marginLeft: "auto", fontSize: 11, fontWeight: 700, color }}>
                {t("viewDiscussion")}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

// Map emotion category keys to display info (labels come from i18n)
const CATEGORY_DISPLAY = {
  sad:        { emoji: "😢", color: "#4A6FA5", bgGrad: "linear-gradient(135deg, #4A6FA5 0%, #2D4A7A 100%)" },
  love:       { emoji: "❤️", color: "#C1476F", bgGrad: "linear-gradient(135deg, #C1476F 0%, #8B2252 100%)" },
  scary:      { emoji: "😱", color: "#D4763A", bgGrad: "linear-gradient(135deg, #D4763A 0%, #A04E1B 100%)" },
  confused:   { emoji: "🤔", color: "#6B7B5E", bgGrad: "linear-gradient(135deg, #6B7B5E 0%, #4A5940 100%)" },
  mindblowing:{ emoji: "🤯", color: "#00BCD4", bgGrad: "linear-gradient(135deg, #00BCD4 0%, #00838F 100%)" },
  funny:      { emoji: "😂", color: "#FFD600", bgGrad: "linear-gradient(135deg, #FFD600 0%, #F9A825 100%)" },
  disgusted:  { emoji: "🤢", color: "#7CB342", bgGrad: "linear-gradient(135deg, #7CB342 0%, #558B2F 100%)" },
  angry:      { emoji: "🔥", color: "#F44336", bgGrad: "linear-gradient(135deg, #F44336 0%, #C62828 100%)" },
};

export default function HomePage() {
  const t = useTranslations("home");
  const tCats = useTranslations("home.categories");

  const [loaded, setLoaded] = useState(false);
  const [isDesktop, setIsDesktop] = useState(
    () => typeof window !== "undefined" && window.innerWidth >= 1024
  );
  const [categories, setCategories] = useState([]);

  // Load category leaders from DB
  useEffect(() => {
    async function loadFromDb() {
      const dbData = await getTopByCategory();
      if (!dbData || Object.keys(dbData).length === 0) return;

      // Build categories array from DB data — labels derived at render time
      const dbCategories = Object.entries(dbData)
        .filter(([cat]) => CATEGORY_DISPLAY[cat])
        .map(([cat, data]) => ({
          key: cat,
          emoji: CATEGORY_DISPLAY[cat].emoji,
          count: data.count,
          color: CATEGORY_DISPLAY[cat].color,
          bgGrad: CATEGORY_DISPLAY[cat].bgGrad,
          exhibition: data.department || "",
          artwork: data.artwork,
        }))
        .sort((a, b) => b.count - a.count);

      if (dbCategories.length > 0) {
        setCategories(dbCategories);
      }
    }
    loadFromDb();
  }, []);

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      setLoaded(true);
    });

    const checkDesktop = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener("resize", checkDesktop);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("resize", checkDesktop);
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
        }
        .category-card:active { transform: scale(0.97); }
        .artwork-img { transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1); }
        .category-card:hover .artwork-img { transform: scale(1.05); }
        .emoji-pill { transition: all 0.2s ease; }
        .emoji-pill:hover { transform: scale(1.1); }
        .trending-item { transition: all 0.2s ease; cursor: pointer; }
        .trending-item:active { transform: scale(0.98); background: rgba(0,0,0,0.04); }
        .app-scroll { overflow-y: auto; flex: 1; padding-bottom: calc(100px + env(safe-area-inset-bottom, 0px)); }
        .app-scroll::-webkit-scrollbar { display: none; }
        @media (min-width: 1024px) {
          .app-scroll { overflow-y: visible; flex: none; }
        }
      `}</style>

      {/* Header */}
      {!isDesktop && <TopNav />}

      {/* Desktop: TopNav + page header */}
      {isDesktop && (
        <>
          <TopNav />
          <div style={{ padding: "12px 28px 0" }}>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, fontWeight: 700, color: "#2D2A26", letterSpacing: -0.5 }}>
              {t("title")}
            </h1>
            <p style={{ fontSize: 14, color: "#8C8580", marginTop: 4 }}>
              {t("subtitleDesktop")}
            </p>
          </div>
        </>
      )}

      {/* Scrollable Content */}
      <div className="app-scroll nav-spacer" style={{ padding: isDesktop ? "0" : "0" }}>

        {/* Section header — mobile only (desktop header is above) */}
        {!isDesktop && (
          <div style={{
            padding: "24px 20px 12px", display: "flex", justifyContent: "space-between", alignItems: "baseline",
            opacity: loaded ? 1 : 0,
            animation: loaded ? "fadeUp 0.5s ease 0.2s backwards" : "none",
          }}>
            <div>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 700, color: "#2D2A26", letterSpacing: "-0.01em" }}>
                {t("title")}
              </h2>
              <p style={{ fontSize: 13, color: "#8C8580", marginTop: 2 }}>{t("subtitleMobile")}</p>
            </div>
            <span style={{ fontSize: 13, fontWeight: 500, color: "#C1476F", cursor: "pointer" }}>{t("seeAll")}</span>
          </div>
        )}

        {/* Category Cards — 1-col on mobile/tablet, 2-col on desktop */}
        {categories.length === 0 && loaded && (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "#A09B94" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🏛️</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: "#6B6560" }}>{t("emptyTitle")}</div>
            <div style={{ fontSize: 13, marginTop: 4 }}>{t("emptyBody")}</div>
          </div>
        )}
        <div className="cards-grid" style={{ marginTop: isDesktop ? 24 : 0 }}>
          {categories.map((cat, i) => {
            const previewComments = getLatestComments(cat.artwork.comments, 1);
            const showCardPreview = previewComments.length > 0;

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
                      <div style={{ fontSize: 16, fontWeight: 700, color: "#2D2A26" }}>{tCats(cat.key)}</div>
                      <div style={{ fontSize: 12, color: "#8C8580" }}>{t("reactionCount", { count: cat.count.toLocaleString() })}</div>
                    </div>
                  </div>
                  <div style={{ padding: "4px 10px", borderRadius: 20, background: "#F2EFE9", fontSize: 11, fontWeight: 500, color: "#6B6560" }}>
                    {cat.exhibition}
                  </div>
                </div>

                {/* Artwork Preview */}
                <Link href={`/artwork/${cat.artwork.id}`} style={{ textDecoration: "none" }}>
                  <div style={{ position: "relative", overflow: "hidden", background: "#E8E4DD" }}>
                    <img
                      className="artwork-img"
                      src={fixMetImageUrl(cat.artwork.image)}
                      alt={cat.artwork.title}
                      style={{ width: "100%", maxHeight: 280, objectFit: "contain", display: "block" }}
                      onError={(e) => { e.target.style.display = "none"; }}
                    />
                    <div style={{ position: "absolute", top: 10, right: 10, zIndex: 5 }} onClick={e => e.stopPropagation()}>
                      <BookmarkButton type="artwork" id={cat.artwork.id} size={32} />
                    </div>
                  </div>
                  <div style={{ padding: "10px 14px 0" }}>
                    <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 700, color: "#2D2A26", lineHeight: 1.2 }}>
                      {cat.artwork.title}
                    </div>
                    <div style={{ fontSize: 12, color: "#6B6560", marginTop: 2 }}>
                      {cat.artwork.artist}, {cat.artwork.year}
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
                </div>

                {showCardPreview && (
                  <CommentPreview
                    artworkId={cat.artwork.id}
                    comment={previewComments[0]}
                    color={cat.color}
                    label={t("latestComment")}
                  />
                )}
              </>
            );

            return (
              <div
                key={i}
                className="category-card"
                style={{
                  borderRadius: 20,
                  overflow: "hidden",
                  background: "#FFF",
                  boxShadow: "0 2px 16px rgba(45,42,38,0.06), 0 0.5px 2px rgba(45,42,38,0.04)",
                  opacity: loaded ? 1 : 0,
                  animation: loaded ? `fadeUp 0.5s ease ${0.3 + i * 0.1}s forwards` : "none",
                  animationFillMode: "backwards",
                }}
              >
                {cardContent}
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
