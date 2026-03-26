"use client";

import { useState, useEffect } from "react";
import { getFavorites, saveFavorites } from "../lib/guest";

export default function BookmarkButton({ type, id, size = 32 }) {
  const [bookmarked, setBookmarked] = useState(false);

  useEffect(() => {
    setBookmarked(getFavorites().some(f => f.type === type && f.id === id));
  }, [type, id]);

  function toggle(e) {
    e.preventDefault();
    e.stopPropagation();
    const favs = getFavorites();
    const exists = favs.some(f => f.type === type && f.id === id);
    saveFavorites(
      exists ? favs.filter(f => !(f.type === type && f.id === id))
             : [...favs, { type, id }]
    );
    setBookmarked(!exists);
  }

  return (
    <button
      onClick={toggle}
      title={bookmarked ? "Remove from favorites" : "Save to favorites"}
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.3,
        background: bookmarked ? "rgba(245,166,35,0.15)" : "rgba(255,255,255,0.88)",
        border: `1.5px solid ${bookmarked ? "rgba(245,166,35,0.5)" : "rgba(0,0,0,0.10)"}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        backdropFilter: "blur(8px)",
        transition: "all 0.2s ease",
        flexShrink: 0,
        padding: 0,
      }}
    >
      <svg
        width={size * 0.5}
        height={size * 0.5}
        viewBox="0 0 24 24"
        fill={bookmarked ? "#F5A623" : "none"}
        stroke={bookmarked ? "#F5A623" : "#6B6560"}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
      </svg>
    </button>
  );
}
