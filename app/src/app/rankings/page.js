"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import BottomNav from "../components/BottomNav";
import BookmarkButton from "../components/BookmarkButton";

// All artworks with total reactions computed from source data
const RANKED_ARTWORKS = [
  { id: "437984",  title: "Water Lilies",                        artist: "Claude Monet",           year: "1919",          image: "https://images.metmuseum.org/CRDImages/ep/original/DT1877.jpg",       topEmoji: "❤️",  reactions: 5944 },
  { id: "11417",   title: "Washington Crossing the Delaware",    artist: "Emanuel Leutze",          year: "1851",          image: "https://images.metmuseum.org/CRDImages/ap/original/DT100.jpg",        topEmoji: "😍",  reactions: 4664 },
  { id: "544",     title: "Sphinx of Hatshepsut",                artist: "Unknown",                 year: "ca. 1479 B.C.", image: "https://images.metmuseum.org/CRDImages/eg/original/DP246556.jpg",     topEmoji: "😍",  reactions: 4320 },
  { id: "45434",   title: "Under the Wave off Kanagawa",         artist: "Katsushika Hokusai",      year: "ca. 1830–32",   image: "https://images.metmuseum.org/CRDImages/as/original/DP141139.jpg",     topEmoji: "🤔",  reactions: 3211 },
  { id: "436105",  title: "The Death of Socrates",               artist: "Jacques-Louis David",     year: "1787",          image: "https://images.metmuseum.org/CRDImages/ep/original/DP-13139-001.jpg", topEmoji: "😢",  reactions: 2847 },
  { id: "10814",   title: "Heart of the Andes",                  artist: "Frederic Edwin Church",   year: "1859",          image: "https://images.metmuseum.org/CRDImages/ap/original/DT51.jpg",         topEmoji: "😮",  reactions: 2105 },
  { id: "35829",   title: "Armor Garniture",                     artist: "Kolman Helmschmid",       year: "ca. 1525",      image: "https://images.metmuseum.org/CRDImages/aa/original/DP-12881-005.jpg", topEmoji: "😱",  reactions: 1956 },
  { id: "11507",   title: "The Rocky Mountains, Lander's Peak",  artist: "Albert Bierstadt",        year: "1863",          image: "https://images.metmuseum.org/CRDImages/ap/original/DT160.jpg",        topEmoji: "😍",  reactions: 1847 },
  { id: "10159",   title: "Fur Traders Descending the Missouri", artist: "George Caleb Bingham",    year: "1845",          image: "https://images.metmuseum.org/CRDImages/ap/original/DT68.jpg",         topEmoji: "❤️",  reactions: 923  },
  { id: "11189",   title: "The Veteran in a New Field",          artist: "Winslow Homer",           year: "1865",          image: "https://images.metmuseum.org/CRDImages/ap/original/DT1880.jpg",       topEmoji: "🤔",  reactions: 654  },
];

const TABS = ["🔥 Most Reacted", "🔖 Most Saved", "💬 Most Commented"];

const MEDALS = ["🥇", "🥈", "🥉"];
const MEDAL_COLORS = ["#F5A623", "#9BA3AF", "#CD7F32"];

function fmt(n) {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : n;
}

export default function RankingsPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [top1, top2, top3, ...rest] = RANKED_ARTWORKS;

  return (
    <div className="responsive-page" style={{ minHeight: "100vh", background: "#F7F5F0", display: "flex", flexDirection: "column" }}>
      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideIn { from { opacity: 0; transform: translateX(-12px); } to { opacity: 1; transform: translateX(0); } }
        .rank-row { transition: background 0.15s ease; border-radius: 16px; }
        .rank-row:hover { background: rgba(0,0,0,0.03); }
        .podium-card { transition: transform 0.2s ease; }
        .podium-card:hover { transform: translateY(-3px); }
      `}</style>

      {/* Header */}
      <div style={{ padding: "56px 24px 0" }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: "#2D2A26", letterSpacing: -0.5 }}>
          Rankings
        </h1>
        <p style={{ fontSize: 13, color: "#8C8580", marginTop: 4 }}>
          Most reacted artworks at The Met
        </p>

        {/* Tab pills */}
        <div style={{ display: "flex", gap: 8, marginTop: 16, overflowX: "auto", paddingBottom: 4 }}>
          {TABS.map((tab, i) => (
            <button
              key={i}
              onClick={() => setActiveTab(i)}
              style={{
                flexShrink: 0,
                padding: "7px 14px",
                borderRadius: 20,
                border: "none",
                background: activeTab === i ? "#2D2A26" : "#EDEAE4",
                color: activeTab === i ? "#FFF" : "#6B6560",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s ease",
                fontFamily: "inherit",
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Scrollable content */}
      <div className="nav-spacer" style={{ flex: 1, padding: "24px 20px 0", display: "flex", flexDirection: "column", gap: 24 }}>

        {/* ── Podium: top 3 ──────────────────────────────────────── */}
        <div style={{ animation: "fadeUp 0.4s ease both" }}>

          {/* #1 Hero card */}
          <Link href={`/artwork/${top1.id}`} style={{ textDecoration: "none", display: "block", marginBottom: 12 }}>
            <div className="podium-card" style={{
              borderRadius: 24,
              overflow: "hidden",
              background: "#FFF",
              boxShadow: "0 4px 24px rgba(245,166,35,0.15), 0 1px 4px rgba(0,0,0,0.06)",
              border: "2px solid rgba(245,166,35,0.3)",
              position: "relative",
            }}>
              {/* Image */}
              <div style={{ height: 200, position: "relative", background: "#E8E4DD", overflow: "hidden" }}>
                <Image
                  src={top1.image}
                  alt={top1.title}
                  fill
                  style={{ objectFit: "cover" }}
                  unoptimized
                />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(transparent 40%, rgba(45,42,38,0.7))" }} />
                {/* Medal badge */}
                <div style={{
                  position: "absolute", top: 12, left: 12,
                  background: "rgba(245,166,35,0.95)", backdropFilter: "blur(8px)",
                  borderRadius: 12, padding: "4px 10px",
                  display: "flex", alignItems: "center", gap: 5,
                }}>
                  <span style={{ fontSize: 16 }}>🥇</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#2D2A26" }}>#1</span>
                </div>
                {/* Bookmark */}
                <div style={{ position: "absolute", top: 12, right: 12 }} onClick={e => e.preventDefault()}>
                  <BookmarkButton type="artwork" id={top1.id} size={34} />
                </div>
                {/* Title overlay */}
                <div style={{ position: "absolute", bottom: 12, left: 14, right: 14 }}>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700, color: "#FFF", lineHeight: 1.2, textShadow: "0 1px 4px rgba(0,0,0,0.4)" }}>
                    {top1.title}
                  </div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.8)", marginTop: 3 }}>
                    {top1.artist}, {top1.year}
                  </div>
                </div>
              </div>
              {/* Stats row */}
              <div style={{ padding: "10px 16px", display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 20 }}>{top1.topEmoji}</span>
                <span style={{ fontSize: 15, fontWeight: 700, color: "#2D2A26" }}>{fmt(top1.reactions)}</span>
                <span style={{ fontSize: 12, color: "#A09B94" }}>reactions</span>
                <div style={{
                  marginLeft: "auto", padding: "3px 10px", borderRadius: 12,
                  background: "rgba(245,166,35,0.12)", border: "1px solid rgba(245,166,35,0.3)",
                }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#D4890A" }}>⬆ 1st place</span>
                </div>
              </div>
            </div>
          </Link>

          {/* #2 and #3 side by side */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {[top2, top3].map((art, idx) => (
              <Link key={art.id} href={`/artwork/${art.id}`} style={{ textDecoration: "none" }}>
                <div className="podium-card" style={{
                  borderRadius: 20,
                  overflow: "hidden",
                  background: "#FFF",
                  boxShadow: `0 2px 14px rgba(${idx === 0 ? "155,163,175" : "205,127,50"},0.15), 0 1px 3px rgba(0,0,0,0.05)`,
                  border: `1.5px solid ${idx === 0 ? "rgba(155,163,175,0.35)" : "rgba(205,127,50,0.3)"}`,
                }}>
                  <div style={{ height: 130, position: "relative", background: "#E8E4DD", overflow: "hidden" }}>
                    <Image src={art.image} alt={art.title} fill style={{ objectFit: "cover" }} unoptimized />
                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(transparent 40%, rgba(45,42,38,0.65))" }} />
                    <div style={{
                      position: "absolute", top: 8, left: 8,
                      background: idx === 0 ? "rgba(155,163,175,0.9)" : "rgba(205,127,50,0.9)",
                      borderRadius: 10, padding: "3px 8px",
                      display: "flex", alignItems: "center", gap: 4,
                    }}>
                      <span style={{ fontSize: 13 }}>{MEDALS[idx + 1]}</span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: "#FFF" }}>#{idx + 2}</span>
                    </div>
                    <div style={{ position: "absolute", bottom: 8, left: 10, right: 10 }}>
                      <div style={{
                        fontSize: 12, fontWeight: 700, color: "#FFF", lineHeight: 1.3,
                        display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
                        textShadow: "0 1px 3px rgba(0,0,0,0.4)",
                      }}>{art.title}</div>
                    </div>
                  </div>
                  <div style={{ padding: "8px 10px", display: "flex", alignItems: "center", gap: 5 }}>
                    <span style={{ fontSize: 16 }}>{art.topEmoji}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#2D2A26" }}>{fmt(art.reactions)}</span>
                    <div style={{ marginLeft: "auto" }} onClick={e => e.preventDefault()}>
                      <BookmarkButton type="artwork" id={art.id} size={28} />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* ── #4–#10 list ────────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 4, animation: "fadeUp 0.4s ease 0.1s both" }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#A09B94", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>
            Leaderboard
          </div>

          {rest.map((art, i) => {
            const rank = i + 4;
            return (
              <Link key={art.id} href={`/artwork/${art.id}`} style={{ textDecoration: "none" }}>
                <div className="rank-row" style={{
                  display: "flex", alignItems: "center", gap: 12, padding: "10px 8px",
                  animation: `slideIn 0.3s ease ${0.05 * i}s both`,
                }}>
                  {/* Rank number */}
                  <div style={{
                    width: 28, textAlign: "center", flexShrink: 0,
                    fontSize: 14, fontWeight: 700,
                    color: rank <= 5 ? "#C1476F" : "#C4BDB6",
                  }}>
                    {rank}
                  </div>

                  {/* Artwork thumbnail */}
                  <div style={{ width: 52, height: 52, borderRadius: 12, overflow: "hidden", flexShrink: 0, background: "#E8E4DD" }}>
                    <Image src={art.image} alt={art.title} width={52} height={52}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }} unoptimized />
                  </div>

                  {/* Title + artist */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: 14, fontWeight: 600, color: "#2D2A26", lineHeight: 1.3,
                      whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                    }}>{art.title}</div>
                    <div style={{ fontSize: 11, color: "#8C8580", marginTop: 1 }}>{art.artist}</div>
                  </div>

                  {/* Reaction count */}
                  <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
                    <span style={{ fontSize: 14 }}>{art.topEmoji}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#6B6560" }}>{fmt(art.reactions)}</span>
                  </div>

                  {/* Bookmark */}
                  <div onClick={e => e.preventDefault()}>
                    <BookmarkButton type="artwork" id={art.id} size={30} />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      <BottomNav variant="light" />
    </div>
  );
}
