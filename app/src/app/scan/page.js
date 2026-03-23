// Scan page — where visitors point their phone at artwork to identify it.
// Lives at /scan because this file is at src/app/scan/page.js
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import BottomNav from "../components/BottomNav";
import { ARTWORK_DETAIL } from "../data/artworks";

export default function ScanPage() {
  const [phase, setPhase] = useState("scanning");
  const [scanLine, setScanLine] = useState(0);

  // Timer-based phase transitions: scanning → detecting → found
  useEffect(() => {
    if (phase === "scanning") {
      const timer = setTimeout(() => setPhase("detecting"), 2800);
      return () => clearTimeout(timer);
    }
    if (phase === "detecting") {
      const timer = setTimeout(() => setPhase("found"), 1200);
      return () => clearTimeout(timer);
    }
  }, [phase]);

  // Animate the scan line moving down
  useEffect(() => {
    if (phase === "scanning") {
      const interval = setInterval(() => {
        setScanLine((p) => (p >= 100 ? 0 : p + 1.5));
      }, 20);
      return () => clearInterval(interval);
    }
  }, [phase]);

  const handleScanAgain = () => {
    setPhase("scanning");
  };

  return (
    <div style={{
      width: "100%",
      maxWidth: 420,
      margin: "0 auto",
      height: "100vh",
      background: "#0A0A0A",
      position: "relative",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
    }}>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(100%); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes cornerGlow { 0%, 100% { opacity: 0.6; } 50% { opacity: 1; } }
        .view-btn { transition: all 0.2s ease; cursor: pointer; border: none; }
        .view-btn:active { transform: scale(0.96); }
        .scan-again-btn { transition: all 0.2s ease; cursor: pointer; }
        .scan-again-btn:active { transform: scale(0.96); }
      `}</style>

      {/* Header */}
      <div style={{
        padding: "16px 20px 12px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexShrink: 0,
        position: "relative",
        zIndex: 30,
      }}>
        <Link href="/" style={{
          background: "rgba(255,255,255,0.12)",
          border: "none",
          borderRadius: 12,
          width: 40,
          height: 40,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 18,
          cursor: "pointer",
          backdropFilter: "blur(10px)",
          textDecoration: "none",
        }}>
          ←
        </Link>
        <div style={{
          fontFamily: "'DM Mono', monospace",
          fontSize: 13,
          fontWeight: 500,
          color: "rgba(255,255,255,0.7)",
          letterSpacing: "0.06em",
          textTransform: "uppercase",
        }}>
          {phase === "scanning" && "Point at artwork"}
          {phase === "detecting" && "Identifying..."}
          {phase === "found" && "Artwork found"}
        </div>
        <button style={{
          background: "rgba(255,255,255,0.12)",
          border: "none",
          borderRadius: 12,
          width: 40,
          height: 40,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 18,
          cursor: "pointer",
          backdropFilter: "blur(10px)",
        }}>
          ⚡
        </button>
      </div>

      {/* Viewfinder Area */}
      <div style={{
        flex: 1,
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}>
        {/* Camera background */}
        <div style={{
          position: "absolute",
          inset: 0,
          background: phase === "found"
            ? `url(${ARTWORK_DETAIL.image}) center/cover`
            : "radial-gradient(ellipse at center, #1a1a1a 0%, #0a0a0a 100%)",
          transition: "all 0.6s ease",
          filter: phase === "found" ? "brightness(0.35)" : "none",
        }} />

        {/* Scanning & Detecting */}
        {(phase === "scanning" || phase === "detecting") && (
          <>
            <div style={{ position: "absolute", width: 240, height: 240, animation: "cornerGlow 2.4s ease infinite" }}>
              {[
                { top: 0, left: 0, bt: true, bl: true, r: "8px 0 0 0" },
                { top: 0, right: 0, bt: true, br: true, r: "0 8px 0 0" },
                { bottom: 0, left: 0, bb: true, bl: true, r: "0 0 0 8px" },
                { bottom: 0, right: 0, bb: true, br: true, r: "0 0 8px 0" },
              ].map((c, i) => {
                const col = phase === "detecting" ? "#C1476F" : "rgba(255,255,255,0.7)";
                return (
                  <div key={i} style={{
                    position: "absolute", width: 40, height: 40,
                    ...(c.top !== undefined && { top: c.top }),
                    ...(c.bottom !== undefined && { bottom: c.bottom }),
                    ...(c.left !== undefined && { left: c.left }),
                    ...(c.right !== undefined && { right: c.right }),
                    ...(c.bt && { borderTop: `3px solid ${col}` }),
                    ...(c.bb && { borderBottom: `3px solid ${col}` }),
                    ...(c.bl && { borderLeft: `3px solid ${col}` }),
                    ...(c.br && { borderRight: `3px solid ${col}` }),
                    borderRadius: c.r,
                    transition: "border-color 0.3s",
                  }} />
                );
              })}
            </div>

            {phase === "scanning" && (
              <div style={{
                position: "absolute",
                left: "calc(50% - 118px)",
                width: 236,
                top: `calc(50% - 120px + ${scanLine * 2.4}px)`,
                height: 2,
                background: "linear-gradient(90deg, transparent, rgba(193,71,111,0.8), transparent)",
                boxShadow: "0 0 20px rgba(193,71,111,0.4)",
                transition: scanLine === 0 ? "none" : "top 0.02s linear",
              }} />
            )}

            {phase === "detecting" && (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, animation: "fadeIn 0.3s ease" }}>
                <div style={{
                  width: 48, height: 48,
                  border: "3px solid rgba(255,255,255,0.1)",
                  borderTopColor: "#C1476F",
                  borderRadius: "50%",
                  animation: "spin 0.8s linear infinite",
                }} />
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, color: "rgba(255,255,255,0.6)", letterSpacing: "0.05em" }}>
                  Matching artwork...
                </div>
              </div>
            )}

            {phase === "scanning" && (
              <div style={{ position: "absolute", bottom: 40, left: 0, right: 0, textAlign: "center", animation: "fadeIn 0.5s ease" }}>
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  padding: "8px 16px", background: "rgba(0,0,0,0.5)", backdropFilter: "blur(10px)", borderRadius: 20,
                }}>
                  <span style={{ fontSize: 16 }}>📸</span>
                  <span style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", fontWeight: 400 }}>Hold steady near artwork</span>
                </div>
              </div>
            )}
          </>
        )}

        {/* Found — Artwork card */}
        {phase === "found" && (
          <div style={{
            position: "relative", zIndex: 10, width: "100%", height: "100%",
            display: "flex", flexDirection: "column", justifyContent: "flex-end", overflow: "hidden",
          }}>
            <div style={{ padding: "0 18px 18px", animation: "slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1)" }}>
              {/* Match badge */}
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                padding: "6px 12px", background: "rgba(76,175,80,0.2)", border: "1px solid rgba(76,175,80,0.3)",
                borderRadius: 20, marginBottom: 12, backdropFilter: "blur(10px)",
              }}>
                <span style={{ fontSize: 12 }}>✅</span>
                <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, fontWeight: 500, color: "#81C784", letterSpacing: "0.04em" }}>
                  MATCH FOUND
                </span>
              </div>

              {/* Artwork card */}
              <div style={{
                background: "rgba(15,15,15,0.75)", backdropFilter: "blur(24px)",
                borderRadius: 20, border: "1px solid rgba(255,255,255,0.08)", overflow: "hidden",
              }}>
                <div style={{ width: "100%", height: 180, overflow: "hidden", position: "relative" }}>
                  <img src={ARTWORK_DETAIL.image} alt={ARTWORK_DETAIL.title}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    onError={(e) => { e.target.style.display = "none"; }}
                  />
                  <div style={{
                    position: "absolute", bottom: 0, left: 0, right: 0, height: 60,
                    background: "linear-gradient(transparent, rgba(15,15,15,0.9))",
                  }} />
                </div>

                <div style={{ padding: "14px 18px 10px" }}>
                  <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color: "#FFF", lineHeight: 1.2, marginBottom: 4 }}>
                    {ARTWORK_DETAIL.title}
                  </h2>
                  <div style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", marginBottom: 2 }}>
                    {ARTWORK_DETAIL.artist}, {ARTWORK_DETAIL.year}
                  </div>
                  <div style={{
                    display: "inline-flex", alignItems: "center", gap: 5, marginTop: 8,
                    padding: "4px 10px", background: "rgba(255,255,255,0.08)", borderRadius: 12,
                  }}>
                    <span style={{ fontSize: 12 }}>📍</span>
                    <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", fontWeight: 500 }}>
                      {ARTWORK_DETAIL.gallery} · {ARTWORK_DETAIL.exhibition}
                    </span>
                  </div>

                  {/* Reaction summary */}
                  <div style={{ display: "flex", gap: 6, marginTop: 14, flexWrap: "wrap" }}>
                    {Object.entries(ARTWORK_DETAIL.reactions).map(([emoji, count], i) => (
                      <div key={i} style={{
                        display: "flex", alignItems: "center", gap: 4, padding: "4px 10px",
                        background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16,
                      }}>
                        <span style={{ fontSize: 14 }}>{emoji}</span>
                        <span style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.5)" }}>
                          {count >= 1000 ? `${(count / 1000).toFixed(1)}k` : count}
                        </span>
                      </div>
                    ))}
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", alignSelf: "center", marginLeft: 4 }}>
                      {ARTWORK_DETAIL.totalReactions.toLocaleString()} total
                    </div>
                  </div>
                </div>

                {/* View Details button — links to artwork detail page */}
                <div style={{ padding: "8px 18px 16px" }}>
                  <Link href={`/artwork/${ARTWORK_DETAIL.id}`} className="view-btn" style={{
                    width: "100%", padding: "14px", borderRadius: 14,
                    background: "linear-gradient(135deg, #C1476F 0%, #D4763A 100%)",
                    color: "#FFF", fontSize: 15, fontWeight: 700,
                    letterSpacing: "0.02em", boxShadow: "0 4px 20px rgba(193,71,111,0.35)",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    textDecoration: "none",
                  }}>
                    View Details & React →
                  </Link>
                </div>
              </div>

              <button className="scan-again-btn" onClick={handleScanAgain} style={{
                width: "100%", marginTop: 10, padding: "12px", borderRadius: 14,
                background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)",
                color: "rgba(255,255,255,0.5)", fontSize: 14, fontWeight: 500,
              }}>
                📸 Scan Another Artwork
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNav variant="dark" />
    </div>
  );
}
