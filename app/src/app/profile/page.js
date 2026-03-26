"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import BottomNav from "../components/BottomNav";
import { getGuestId, getGuestName, setUsername, getAvatar, setAvatar, getBio, setBio, getFavorites, saveFavorites } from "../lib/guest";
import { FEATURED_ARTWORKS } from "../data/artworks";

const BIO_LIMIT = 150;

function isImageUrl(value) {
  return typeof value === "string" && value.startsWith("http");
}

function AvatarDisplay({ value, size = 88, editing = false, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        width: size, height: size, borderRadius: "50%", overflow: "hidden",
        background: "linear-gradient(135deg, #F7EFE8 0%, #EDE4F8 100%)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: size * 0.55, cursor: editing ? "pointer" : "default",
        position: "relative", boxShadow: "0 4px 20px rgba(0,0,0,0.10)", flexShrink: 0,
      }}
    >
      {isImageUrl(value) ? (
        <Image src={value} alt="avatar" width={size} height={size}
          style={{ width: "100%", height: "100%", objectFit: "cover" }} unoptimized />
      ) : value}
      {editing && (
        <div style={{
          position: "absolute", bottom: 2, right: 2, width: 22, height: 22,
          borderRadius: "50%", background: "#C1476F",
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11,
        }}>✏️</div>
      )}
    </div>
  );
}

// One card in the favorites display row
function FavoriteCard({ fav, editing, onRemove }) {
  const item = FEATURED_ARTWORKS.find(a => a.id === fav.id);
  if (!item) return null;

  return (
    <div style={{ position: "relative", flexShrink: 0 }}>
      <Link href={`/artwork/${item.id}`} style={{ textDecoration: "none" }}>
        <div style={{
          width: 90, borderRadius: 14, overflow: "hidden",
          background: "#FFF", border: "1px solid rgba(0,0,0,0.08)",
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        }}>
          <div style={{ height: 72, overflow: "hidden", background: "#E8E4DD" }}>
            <Image src={item.image} alt={item.title} width={90} height={72}
              style={{ width: "100%", height: "100%", objectFit: "cover" }} unoptimized />
          </div>
          <div style={{ padding: "6px 7px 7px" }}>
            <div style={{
              fontSize: 10, fontWeight: 600, color: "#2D2A26", lineHeight: 1.3,
              display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
            }}>{item.title}</div>
          </div>
        </div>
      </Link>
      {editing && (
        <button
          onClick={() => onRemove(fav)}
          style={{
            position: "absolute", top: -6, right: -6, width: 20, height: 20,
            borderRadius: "50%", background: "#C1476F", border: "2px solid #FFF",
            color: "#FFF", fontSize: 10, fontWeight: 700,
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", lineHeight: 1, padding: 0,
          }}
        >✕</button>
      )}
    </div>
  );
}

// Picker shown while editing — toggle artworks
function FavoritesPicker({ favorites, onToggle }) {
  const isSelected = (id) => favorites.some(f => f.type === "artwork" && f.id === id);

  return (
    <div style={{ animation: "pop 0.2s ease both" }}>
      <p style={{ fontSize: 11, fontWeight: 600, color: "#A09B94", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>
        Artworks
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8 }}>
        {FEATURED_ARTWORKS.map(art => {
          const selected = isSelected(art.id);
          return (
            <div key={art.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <div
                onClick={() => onToggle("artwork", art.id)}
                style={{
                  width: 48, height: 48, borderRadius: "50%", overflow: "hidden",
                  cursor: "pointer", position: "relative", flexShrink: 0,
                  outline: selected ? "3px solid #C1476F" : "none",
                  outlineOffset: 2,
                  transition: "transform 0.15s ease",
                }}
              >
                <Image src={art.image} alt={art.title} width={48} height={48}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }} unoptimized />
                {selected && (
                  <div style={{
                    position: "absolute", inset: 0, background: "rgba(193,71,111,0.35)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 16,
                  }}>✓</div>
                )}
              </div>
              <span style={{
                fontSize: 9, color: "#A09B94", textAlign: "center", lineHeight: 1.2,
                maxWidth: 52, overflow: "hidden",
                display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
              }}>{art.title}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const [loaded, setLoaded] = useState(false);
  const [guestId, setGuestId] = useState("");
  const [username, setUsernameState] = useState("");
  const [avatar, setAvatarState] = useState("");
  const [bio, setBioState] = useState("");
  const [favorites, setFavoritesState] = useState([]);
  const [editing, setEditing] = useState(false);
  const [draftUsername, setDraftUsername] = useState("");
  const [draftAvatar, setDraftAvatar] = useState("");
  const [draftBio, setDraftBio] = useState("");
  const [draftFavorites, setDraftFavorites] = useState([]);
  const [saved, setSaved] = useState(false);
  const [avatarPickerOpen, setAvatarPickerOpen] = useState(false);
  const [favPickerOpen, setFavPickerOpen] = useState(false);

  useEffect(() => {
    setGuestId(getGuestId());
    setUsernameState(getGuestName());
    setAvatarState(getAvatar());
    setBioState(getBio());
    setFavoritesState(getFavorites());
    setLoaded(true);
  }, []);

  function startEditing() {
    setDraftUsername(username === guestId ? "" : username);
    setDraftAvatar(avatar);
    setDraftBio(bio);
    setDraftFavorites([...favorites]);
    setAvatarPickerOpen(false);
    setFavPickerOpen(false);
    setEditing(true);
  }

  function handleFavoriteToggle(type, id) {
    const exists = draftFavorites.some(f => f.type === type && f.id === id);
    if (exists) {
      setDraftFavorites(draftFavorites.filter(f => !(f.type === type && f.id === id)));
    } else {
      setDraftFavorites([...draftFavorites, { type, id }]);
    }
  }

  function handleRemoveFavorite(fav) {
    setDraftFavorites(draftFavorites.filter(f => !(f.type === fav.type && f.id === fav.id)));
  }

  function handleSave() {
    const finalName = draftUsername.trim() || guestId;
    setUsername(finalName);
    setAvatar(draftAvatar);
    setBio(draftBio);
    saveFavorites(draftFavorites);
    setUsernameState(finalName);
    setAvatarState(draftAvatar);
    setBioState(draftBio);
    setFavoritesState(draftFavorites);
    setEditing(false);
    setAvatarPickerOpen(false);
    setFavPickerOpen(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function handleCancel() {
    setEditing(false);
    setAvatarPickerOpen(false);
    setFavPickerOpen(false);
  }

  if (!loaded) return null;

  const displayFavorites = editing ? draftFavorites : favorites;

  return (
    <div className="responsive-page" style={{
      minHeight: "100vh", background: "#F7F5F0",
      display: "flex", flexDirection: "column",
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
        .art-thumb { cursor: pointer; border-radius: 50%; overflow: hidden;
          transition: transform 0.15s ease, box-shadow 0.15s ease; }
        .art-thumb:hover { transform: scale(1.08); }
        .art-thumb.selected { outline: 3px solid #C1476F; outline-offset: 2px; }
        input:focus, textarea:focus { outline: none; }
      `}</style>

      {/* Header */}
      <div style={{
        padding: "56px 24px 0",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: "#2D2A26", letterSpacing: -0.5 }}>Profile</h1>
        {!editing ? (
          <button onClick={startEditing} style={{
            background: "none", border: "1.5px solid rgba(0,0,0,0.15)", borderRadius: 20,
            padding: "6px 16px", fontSize: 13, fontWeight: 600, color: "#2D2A26", cursor: "pointer",
          }}>Edit</button>
        ) : (
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={handleCancel} style={{
              background: "none", border: "1.5px solid rgba(0,0,0,0.15)", borderRadius: 20,
              padding: "6px 14px", fontSize: 13, fontWeight: 600, color: "#2D2A26", cursor: "pointer",
            }}>Cancel</button>
            <button onClick={handleSave} style={{
              background: "linear-gradient(135deg, #C1476F 0%, #D4763A 100%)",
              border: "none", borderRadius: 20, padding: "6px 16px",
              fontSize: 13, fontWeight: 600, color: "#FFF", cursor: "pointer",
              boxShadow: "0 2px 10px rgba(193,71,111,0.3)",
            }}>Save</button>
          </div>
        )}
      </div>

      <div style={{ flex: 1, padding: "24px 24px 100px", display: "flex", flexDirection: "column", gap: 16 }}>

        {/* Avatar + name card */}
        <div className="profile-card" style={{
          background: "#FFF", borderRadius: 24, padding: 24,
          display: "flex", flexDirection: "column", alignItems: "center", gap: 12,
          boxShadow: "0 2px 16px rgba(0,0,0,0.06)",
        }}>
          <AvatarDisplay
            value={editing ? draftAvatar : avatar}
            editing={editing}
            onClick={editing ? () => setAvatarPickerOpen(p => !p) : undefined}
          />

          {/* Avatar artwork picker */}
          {editing && avatarPickerOpen && (
            <div style={{
              width: "100%", background: "#F7F5F0", borderRadius: 18, padding: 14,
              animation: "pop 0.2s ease both",
            }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: "#A09B94", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10 }}>
                Choose an artwork
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8 }}>
                {FEATURED_ARTWORKS.map(art => (
                  <div key={art.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                    <div
                      className={`art-thumb${draftAvatar === art.image ? " selected" : ""}`}
                      onClick={() => { setDraftAvatar(art.image); setAvatarPickerOpen(false); }}
                      style={{ width: 48, height: 48 }}
                    >
                      <Image src={art.image} alt={art.title} width={48} height={48}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }} unoptimized />
                    </div>
                    <span style={{
                      fontSize: 9, color: "#A09B94", textAlign: "center", lineHeight: 1.2,
                      maxWidth: 52, overflow: "hidden",
                      display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
                    }}>{art.title}</span>
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
                fontSize: 20, fontWeight: 700, color: "#2D2A26", textAlign: "center",
                background: "#F7F5F0", border: "1.5px solid rgba(0,0,0,0.12)",
                borderRadius: 12, padding: "8px 14px", width: "100%", fontFamily: "inherit",
              }}
            />
          ) : (
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: "#2D2A26" }}>{username}</div>
              <div style={{ fontSize: 12, color: "#A09B94", marginTop: 2 }}>{guestId}</div>
            </div>
          )}
        </div>

        {/* Bio card */}
        <div className="profile-card" style={{
          background: "#FFF", borderRadius: 24, padding: 20,
          boxShadow: "0 2px 16px rgba(0,0,0,0.06)", animationDelay: "0.05s",
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
                  width: "100%", fontSize: 15, color: "#2D2A26", background: "#F7F5F0",
                  border: "1.5px solid rgba(0,0,0,0.12)", borderRadius: 12,
                  padding: "10px 14px", fontFamily: "inherit", resize: "none", lineHeight: 1.5,
                }}
              />
              <div style={{ fontSize: 11, color: "#A09B94", textAlign: "right", marginTop: 4 }}>
                {draftBio.length}/{BIO_LIMIT}
              </div>
            </div>
          ) : (
            <p style={{
              fontSize: 15, lineHeight: 1.6,
              color: bio ? "#2D2A26" : "#C4BDB6",
              fontStyle: bio ? "normal" : "italic",
            }}>
              {bio || "No bio yet. Tap Edit to add one!"}
            </p>
          )}
        </div>

        {/* Favorites card */}
        <div className="profile-card" style={{
          background: "#FFF", borderRadius: 24, padding: 20,
          boxShadow: "0 2px 16px rgba(0,0,0,0.06)", animationDelay: "0.1s",
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#A09B94", textTransform: "uppercase", letterSpacing: 0.5 }}>
              Favorites
            </div>
            {editing && (
              <button
                onClick={() => setFavPickerOpen(p => !p)}
                style={{
                  background: favPickerOpen ? "rgba(193,71,111,0.1)" : "#F7F5F0",
                  border: favPickerOpen ? "1.5px solid rgba(193,71,111,0.3)" : "1.5px solid rgba(0,0,0,0.1)",
                  borderRadius: 12, padding: "4px 10px", fontSize: 12, fontWeight: 600,
                  color: favPickerOpen ? "#C1476F" : "#6B6560", cursor: "pointer",
                }}
              >
                {favPickerOpen ? "Done" : "+ Add"}
              </button>
            )}
          </div>

          {/* Current favorites */}
          {displayFavorites.length > 0 ? (
            <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 4 }}>
              {displayFavorites.map((fav, i) => (
                <FavoriteCard
                  key={`${fav.type}-${fav.id}`}
                  fav={fav}
                  editing={editing}
                  onRemove={handleRemoveFavorite}
                />
              ))}
            </div>
          ) : (
            <p style={{
              fontSize: 14, color: "#C4BDB6", fontStyle: "italic",
              marginBottom: editing && favPickerOpen ? 16 : 0,
            }}>
              {editing ? "Pick your favorites below." : "No favorites yet. Tap Edit to add some!"}
            </p>
          )}

          {/* Picker */}
          {editing && favPickerOpen && (
            <div style={{
              marginTop: 16, padding: 14, background: "#F7F5F0", borderRadius: 18,
            }}>
              <FavoritesPicker favorites={draftFavorites} onToggle={handleFavoriteToggle} />
            </div>
          )}
        </div>

        {saved && (
          <div style={{
            textAlign: "center", fontSize: 14, color: "#C1476F", fontWeight: 600,
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
