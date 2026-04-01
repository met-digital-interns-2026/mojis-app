"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import BottomNav from "../components/BottomNav";
import { getAllArtworks } from "../lib/db";

export default function GalleryPage() {
  const [artworks, setArtworks] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [activeDept, setActiveDept] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await getAllArtworks();
      if (data) {
        setArtworks(data);
        // Extract unique departments, sorted alphabetically
        const depts = [...new Set(data.map(a => a.department).filter(Boolean))].sort();
        setDepartments(depts);
      }
      setLoading(false);
    }
    load();
  }, []);

  const filtered = activeDept
    ? artworks.filter(a => a.department === activeDept)
    : artworks;

  return (
    <div className="responsive-page" style={{ minHeight: "100vh", background: "#F7F5F0", display: "flex", flexDirection: "column" }}>
      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .gallery-card { transition: transform 0.2s ease, box-shadow 0.2s ease; }
        .gallery-card:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(0,0,0,0.12); }
      `}</style>

      {/* Header */}
      <div style={{ padding: "56px 24px 0" }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: "#2D2A26", letterSpacing: -0.5 }}>
          Gallery
        </h1>
        <p style={{ fontSize: 13, color: "#8C8580", marginTop: 4 }}>
          Artworks discovered by visitors
        </p>

        {/* Department filter chips */}
        {departments.length > 0 && (
          <div style={{ display: "flex", gap: 8, marginTop: 16, overflowX: "auto", paddingBottom: 4 }}
            className="hide-scrollbar">
            <style>{`.hide-scrollbar::-webkit-scrollbar { display: none; } .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
            <button
              onClick={() => setActiveDept(null)}
              style={{
                background: !activeDept ? "#2D2A26" : "rgba(0,0,0,0.05)",
                color: !activeDept ? "#FFF" : "#6B6560",
                border: "none", borderRadius: 20, padding: "7px 16px",
                fontSize: 12, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap",
                flexShrink: 0,
              }}
            >All</button>
            {departments.map(dept => (
              <button
                key={dept}
                onClick={() => setActiveDept(dept === activeDept ? null : dept)}
                style={{
                  background: activeDept === dept ? "#2D2A26" : "rgba(0,0,0,0.05)",
                  color: activeDept === dept ? "#FFF" : "#6B6560",
                  border: "none", borderRadius: 20, padding: "7px 16px",
                  fontSize: 12, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap",
                  flexShrink: 0,
                }}
              >{dept}</button>
            ))}
          </div>
        )}
      </div>

      {/* Gallery grid */}
      <div style={{ flex: 1, padding: "20px 24px", paddingBottom: "calc(100px + env(safe-area-inset-bottom, 0px))" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#A09B94", fontSize: 14 }}>
            Loading artworks...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{
            textAlign: "center", padding: "60px 24px",
            animation: "fadeUp 0.35s ease both",
          }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🖼️</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: "#2D2A26", marginBottom: 8 }}>
              {activeDept ? "No artworks in this department yet" : "No artworks discovered yet"}
            </div>
            <p style={{ fontSize: 13, color: "#8C8580", lineHeight: 1.5 }}>
              {activeDept
                ? "Try selecting a different department or scan more artworks."
                : "Scan an artwork with your phone to add it to the gallery!"}
            </p>
            {!activeDept && (
              <Link href="/scan" style={{
                display: "inline-block", marginTop: 20,
                background: "linear-gradient(135deg, #C1476F 0%, #D4763A 100%)",
                color: "#FFF", border: "none", borderRadius: 16, padding: "12px 28px",
                fontSize: 14, fontWeight: 700, textDecoration: "none",
                boxShadow: "0 4px 16px rgba(193,71,111,0.3)",
              }}>
                Scan an Artwork
              </Link>
            )}
          </div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: 14,
          }}>
            {filtered.map((art, i) => (
              <Link key={art.id} href={`/artwork/${art.id}`} style={{ textDecoration: "none" }}>
                <div
                  className="gallery-card"
                  style={{
                    background: "#FFF",
                    borderRadius: 18,
                    overflow: "hidden",
                    boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                    animation: `fadeUp 0.35s ease ${Math.min(i * 0.05, 0.5)}s both`,
                  }}
                >
                  {/* Artwork image */}
                  <div style={{
                    height: 160, overflow: "hidden", background: "#E8E4DD",
                    position: "relative",
                  }}>
                    {art.image ? (
                      <Image
                        src={art.image}
                        alt={art.title}
                        width={200}
                        height={160}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        unoptimized
                      />
                    ) : (
                      <div style={{
                        width: "100%", height: "100%",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 36, color: "#C4BDB6",
                      }}>🖼️</div>
                    )}
                    {/* Reaction badge */}
                    {art.reaction_count > 0 && (
                      <div style={{
                        position: "absolute", top: 8, right: 8,
                        background: "rgba(0,0,0,0.65)", backdropFilter: "blur(8px)",
                        borderRadius: 10, padding: "3px 8px",
                        display: "flex", alignItems: "center", gap: 3,
                        fontSize: 11, color: "#FFF", fontWeight: 600,
                      }}>
                        <span>{art.topEmoji}</span>
                        <span>{art.reaction_count}</span>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div style={{ padding: "10px 12px 12px" }}>
                    <div style={{
                      fontSize: 13, fontWeight: 700, color: "#2D2A26",
                      lineHeight: 1.3, marginBottom: 3,
                      display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
                    }}>{art.title}</div>
                    <div style={{
                      fontSize: 11, color: "#8C8580",
                      display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical", overflow: "hidden",
                    }}>{art.artist}</div>
                    {art.department && (
                      <div style={{
                        fontSize: 10, color: "#A09B94", marginTop: 6,
                        background: "rgba(0,0,0,0.04)", borderRadius: 6,
                        padding: "2px 7px", display: "inline-block",
                      }}>{art.department}</div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <BottomNav variant="light" />
    </div>
  );
}
