"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import BottomNav from "../components/BottomNav";
import { getGuestId, getGuestName, setUsername, getAvatar, setAvatar, getBio, setBio } from "../lib/guest";
import { FEATURED_ARTWORKS } from "../data/artworks";

const BIO_LIMIT = 150;

// True if the stored avatar value is an image URL rather than an emoji
function isImageUrl(value) {
  return typeof value === "string" && value.startsWith("http");
}

// Renders the avatar — either a circular artwork image or an emoji
function AvatarDisplay({ value, size = 88, editing = false, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        overflow: "hidden",
        background: "linear-gradient(135deg, #F7EFE8 0%, #EDE4F8 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.55,
        cursor: editing ? "pointer" : "default",
        position: "relative",
        boxShadow: "0 4px 20px rgba(0,0,0,0.10)",
        flexShrink: 0,
      }}
    >
      {isImageUrl(value) ? (
        <Image
          src={value}
          alt="avatar"
          width={size}
          height={size}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          unoptimized
        />
      ) : (
        value
      )}
      {editing && (
        <div style={{
          position: "absolute",
          bottom: 2,
          right: 2,
          width: 22,
          height: 22,
          borderRadius: "50%",
          background: "#C1476F",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 11,
        }}>
          ✏️
        </div>
      )}
    </div>
  );
}

export default function ProfilePage() {
  const [loaded, setLoaded] = useState(false);
  const [guestId, setGuestId] = useState("");
  const [username, setUsernameState] = useState("");
  const [avatar, setAvatarState] = useState("");
  const [bio, setBioState] = useState("");
  const [editing, setEditing] = useState(false);
  const [draftUsername, setDraftUsername] = useState("");
  const [draftAvatar, setDraftAvatar] = useState("");
  const [draftBio, setDraftBio] = useState("");
  const [saved, setSaved] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  useEffect(() => {
    const id = getGuestId();
    const name = getGuestName();
    const av = getAvatar();
    const b = getBio();
    setGuestId(id);
    setUsernameState(name);
    setAvatarState(av);
    setBioState(b);
    setLoaded(true);
  }, []);

  function startEditing() {
    setDraftUsername(username === guestId ? "" : username);
    setDraftAvatar(avatar);
    setDraftBio(bio);
    setPickerOpen(false);
    setEditing(true);
  }

  function handleSave() {
    const finalName = draftUsername.trim() || guestId;
    setUsername(finalName);
    setAvatar(draftAvatar);
    setBio(draftBio);
    setUsernameState(finalName);
    setAvatarState(draftAvatar);
    setBioState(draftBio);
    setEditing(false);
    setPickerOpen(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function handleCancel() {
    setEditing(false);
    setPickerOpen(false);
  }

  if (!loaded) return null;

  return (
    <div style={{
      width: "100%",
      maxWidth: 420,
      margin: "0 auto",
      minHeight: "100vh",
      background: "#F7F5F0",
      display: "flex",
      flexDirection: "column",
    }}>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pop {
          0% { transform: scale(0.92); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        .profile-card { animation: fadeUp 0.35s ease both; }
        .art-thumb {
          cursor: pointer;
          border-radius: 50%;
          overflow: hidden;
          transition: transform 0.15s ease, box-shadow 0.15s ease;
          flex-shrink: 0;
        }
        .art-thumb:hover { transform: scale(1.08); box-shadow: 0 4px 14px rgba(0,0,0,0.2); }
        .art-thumb.selected { outline: 3px solid #C1476F; outline-offset: 2px; }
        input:focus, textarea:focus { outline: none; }
      `}</style>

      {/* Header */}
      <div style={{
        padding: "56px 24px 0",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: "#2D2A26", letterSpacing: -0.5 }}>
          Profile
        </h1>
        {!editing && (
          <button
            onClick={startEditing}
            style={{
              background: "none",
              border: "1.5px solid rgba(0,0,0,0.15)",
              borderRadius: 20,
              padding: "6px 16px",
              fontSize: 13,
              fontWeight: 600,
              color: "#2D2A26",
              cursor: "pointer",
            }}
          >
            Edit
          </button>
        )}
      </div>

      {/* Main content */}
      <div style={{ flex: 1, padding: "24px 24px 100px", display: "flex", flexDirection: "column", gap: 16 }}>

        {/* Avatar + name card */}
        <div className="profile-card" style={{
          background: "#fff",
          borderRadius: 24,
          padding: 24,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 12,
          boxShadow: "0 2px 16px rgba(0,0,0,0.06)",
        }}>
          <AvatarDisplay
            value={editing ? draftAvatar : avatar}
            editing={editing}
            onClick={editing ? () => setPickerOpen(p => !p) : undefined}
          />

          {/* Artwork picker */}
          {editing && pickerOpen && (
            <div style={{
              width: "100%",
              background: "#F7F5F0",
              borderRadius: 18,
              padding: 14,
              animation: "pop 0.2s ease both",
            }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: "#A09B94", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10 }}>
                Choose an artwork
              </p>
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(5, 1fr)",
                gap: 8,
              }}>
                {FEATURED_ARTWORKS.map(art => (
                  <div key={art.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                    <div
                      className={`art-thumb${draftAvatar === art.image ? " selected" : ""}`}
                      onClick={() => { setDraftAvatar(art.image); setPickerOpen(false); }}
                      style={{ width: 48, height: 48 }}
                    >
                      <Image
                        src={art.image}
                        alt={art.title}
                        width={48}
                        height={48}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        unoptimized
                      />
                    </div>
                    <span style={{
                      fontSize: 9,
                      color: "#A09B94",
                      textAlign: "center",
                      lineHeight: 1.2,
                      maxWidth: 52,
                      overflow: "hidden",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                    }}>
                      {art.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Username */}
          {editing ? (
            <input
              value={draftUsername}
              onChange={e => setDraftUsername(e.target.value)}
              placeholder={guestId}
              maxLength={32}
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: "#2D2A26",
                textAlign: "center",
                background: "#F7F5F0",
                border: "1.5px solid rgba(0,0,0,0.12)",
                borderRadius: 12,
                padding: "8px 14px",
                width: "100%",
                fontFamily: "inherit",
              }}
            />
          ) : (
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: "#2D2A26" }}>
                {username}
              </div>
              <div style={{ fontSize: 12, color: "#A09B94", marginTop: 2 }}>
                {guestId}
              </div>
            </div>
          )}
        </div>

        {/* Bio card */}
        <div className="profile-card" style={{
          background: "#fff",
          borderRadius: 24,
          padding: 20,
          boxShadow: "0 2px 16px rgba(0,0,0,0.06)",
          animationDelay: "0.05s",
        }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#A09B94", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>
            Bio
          </div>
          {editing ? (
            <div>
              <textarea
                value={draftBio}
                onChange={e => setDraftBio(e.target.value.slice(0, BIO_LIMIT))}
                placeholder="Tell other museum visitors a little about yourself…"
                rows={3}
                style={{
                  width: "100%",
                  fontSize: 15,
                  color: "#2D2A26",
                  background: "#F7F5F0",
                  border: "1.5px solid rgba(0,0,0,0.12)",
                  borderRadius: 12,
                  padding: "10px 14px",
                  fontFamily: "inherit",
                  resize: "none",
                  lineHeight: 1.5,
                }}
              />
              <div style={{ fontSize: 11, color: "#A09B94", textAlign: "right", marginTop: 4 }}>
                {draftBio.length}/{BIO_LIMIT}
              </div>
            </div>
          ) : (
            <p style={{
              fontSize: 15,
              color: bio ? "#2D2A26" : "#C4BDB6",
              lineHeight: 1.6,
              fontStyle: bio ? "normal" : "italic",
            }}>
              {bio || "No bio yet. Tap Edit to add one!"}
            </p>
          )}
        </div>

        {/* Save / Cancel buttons */}
        {editing && (
          <div style={{ display: "flex", gap: 10, animation: "fadeUp 0.2s ease both" }}>
            <button
              onClick={handleCancel}
              style={{
                flex: 1,
                padding: "14px",
                borderRadius: 16,
                background: "none",
                border: "1.5px solid rgba(0,0,0,0.15)",
                fontSize: 15,
                fontWeight: 600,
                color: "#2D2A26",
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              style={{
                flex: 2,
                padding: "14px",
                borderRadius: 16,
                background: "linear-gradient(135deg, #C1476F 0%, #D4763A 100%)",
                border: "none",
                fontSize: 15,
                fontWeight: 600,
                color: "#fff",
                cursor: "pointer",
                fontFamily: "inherit",
                boxShadow: "0 4px 16px rgba(193,71,111,0.3)",
              }}
            >
              Save Profile
            </button>
          </div>
        )}

        {saved && (
          <div style={{
            textAlign: "center",
            fontSize: 14,
            color: "#C1476F",
            fontWeight: 600,
            animation: "fadeUp 0.2s ease both",
          }}>
            ✓ Profile saved!
          </div>
        )}
      </div>

      <BottomNav variant="light" />
    </div>
  );
}
