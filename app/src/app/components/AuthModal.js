// Sign up / log in modal sheet — slides up from the bottom.
// Renders with position:fixed so it escapes any overflow:hidden parent.
"use client";

import { useState } from "react";
import { signUp, signIn } from "../lib/auth";
import { useTranslations } from "../lib/i18n";

export default function AuthModal({
  onClose,
  onSuccess,
  onGuest,
  title,
  subtitle,
  initialMode = "signup",
}) {
  const t = useTranslations("auth");
  const [mode, setMode] = useState(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email.trim() || !password.trim()) { setError(t("fillAllFields")); return; }
    setError("");
    setLoading(true);
    const fn = mode === "signup" ? signUp : signIn;
    const { data, error: authError } = await fn(email.trim(), password);
    setLoading(false);
    if (authError) {
      setError(authError.message);
    } else if (mode === "signup") {
      setDone(t("signupDone"));
    } else {
      onSuccess?.(data);
      onClose?.();
    }
  }

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 300,
        background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)",
        display: "flex", alignItems: "flex-end", justifyContent: "center",
        animation: "authFadeIn 0.2s ease",
      }}
      onClick={onClose}
    >
      <style>{`
        @keyframes authFadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes authSlideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        .auth-input { transition: border-color 0.2s ease; }
        .auth-input:focus { border-color: rgba(193,71,111,0.4) !important; }
      `}</style>

      <div
        style={{
          width: "100%", maxWidth: 480,
          background: "#FFF", borderRadius: "24px 24px 0 0",
          padding: "0 24px 48px",
          animation: "authSlideUp 0.3s cubic-bezier(0.4,0,0.2,1)",
          boxShadow: "0 -8px 40px rgba(0,0,0,0.15)",
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Handle bar */}
        <div style={{ width: 40, height: 4, borderRadius: 2, background: "#E0DDD7", margin: "12px auto 24px" }} />

        {/* Title */}
        <div style={{ marginBottom: 20 }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: "#2D2A26", marginBottom: 6 }}>
            {title ?? (mode === "signup" ? t("signupTitle") : t("loginTitle"))}
          </h2>
          <p style={{ fontSize: 14, color: "#8C8580", lineHeight: 1.5 }}>
            {subtitle ?? (mode === "signup" ? t("signupSubtitle") : t("loginSubtitle"))}
          </p>
        </div>

        {done ? (
          <div style={{
            padding: "14px 16px", background: "rgba(76,175,80,0.08)",
            border: "1.5px solid rgba(76,175,80,0.3)", borderRadius: 14,
            fontSize: 14, color: "#2D7A2D", lineHeight: 1.5, marginBottom: 16,
          }}>
            ✓ {done}
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <input
              className="auth-input"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder={t("emailPlaceholder")}
              autoFocus
              style={{
                background: "#F7F5F0", border: "1.5px solid rgba(0,0,0,0.10)",
                borderRadius: 14, padding: "13px 16px",
                fontSize: 16, color: "#2D2A26", outline: "none", fontFamily: "inherit",
              }}
            />
            <input
              className="auth-input"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder={t("passwordPlaceholder")}
              style={{
                background: "#F7F5F0", border: "1.5px solid rgba(0,0,0,0.10)",
                borderRadius: 14, padding: "13px 16px",
                fontSize: 16, color: "#2D2A26", outline: "none", fontFamily: "inherit",
              }}
            />
            {error && (
              <div style={{
                fontSize: 12, color: "#C1476F", padding: "8px 12px",
                background: "rgba(193,71,111,0.07)", borderRadius: 10,
              }}>
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: 2,
                background: "linear-gradient(135deg, #C1476F 0%, #D4763A 100%)",
                border: "none", borderRadius: 14, padding: "14px",
                fontSize: 15, fontWeight: 700, color: "#FFF", cursor: "pointer",
                boxShadow: "0 4px 16px rgba(193,71,111,0.28)", opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? t("loading") : (mode === "signup" ? t("createAccount") : t("signIn"))}
            </button>
          </form>
        )}

        {/* Toggle mode */}
        {!done && (
          <div style={{ textAlign: "center", marginTop: 14, fontSize: 13, color: "#8C8580" }}>
            {mode === "signup" ? t("haveAccount") : t("noAccount")}
            <button
              onClick={() => { setMode(mode === "signup" ? "login" : "signup"); setError(""); }}
              style={{
                background: "none", border: "none", fontSize: 13, fontWeight: 600,
                color: "#C1476F", cursor: "pointer", padding: 0,
              }}
            >
              {mode === "signup" ? t("switchToLogin") : t("switchToSignup")}
            </button>
          </div>
        )}

        {/* Continue as guest */}
        {onGuest && (
          <button
            onClick={onGuest}
            style={{
              width: "100%", marginTop: 10, background: "none",
              border: "1.5px solid rgba(0,0,0,0.10)", borderRadius: 14,
              padding: "12px", fontSize: 13, fontWeight: 500,
              color: "#A09B94", cursor: "pointer",
            }}
          >
            {t("continueAsGuest")}
          </button>
        )}
      </div>
    </div>
  );
}
