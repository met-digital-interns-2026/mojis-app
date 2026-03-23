// Guest identity system.
//
// Instead of making people sign up, we give each visitor a random ID
// like "Guest-7392" and save it in localStorage.
//
// localStorage is built into every browser — it's a simple key-value
// store that persists even when you close the tab. Think of it like
// a sticky note the browser keeps for your website.

// Generate a random 4-digit number
function randomNumber() {
  return Math.floor(1000 + Math.random() * 9000);
}

// Get or create a guest ID. Returns something like "Guest-7392".
// Called once when the app loads — after that, the same ID is reused.
export function getGuestId() {
  if (typeof window === "undefined") return "Guest-0000"; // server-side fallback

  let guestId = localStorage.getItem("moji-guest-id");
  if (!guestId) {
    guestId = `Guest-${randomNumber()}`;
    localStorage.setItem("moji-guest-id", guestId);
  }
  return guestId;
}

// Get just the display name — returns custom username if set, otherwise guest ID
export function getGuestName() {
  if (typeof window === "undefined") return getGuestId();
  return localStorage.getItem("moji-username") || getGuestId();
}

// Save a custom username
export function setUsername(name) {
  localStorage.setItem("moji-username", name.trim());
}

// Get the user's chosen avatar emoji (defaults to a generic face)
export function getAvatar() {
  if (typeof window === "undefined") return "🙂";
  return localStorage.getItem("moji-avatar") || "🙂";
}

// Save the user's chosen avatar emoji
export function setAvatar(emoji) {
  localStorage.setItem("moji-avatar", emoji);
}

// Get the user's bio
export function getBio() {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("moji-bio") || "";
}

// Save the user's bio
export function setBio(text) {
  localStorage.setItem("moji-bio", text);
}
