"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { getAvatar } from "../lib/guest";
import { setLocale, SUPPORTED_LOCALES, useLocale, useTranslations } from "../lib/i18n";

const LOCALE_LABELS = {
  en: "EN",
  es: "ES",
};

function LanguageSelector() {
  const t = useTranslations("nav");
  const locale = useLocale();

  return (
    <select
      aria-label={t("language")}
      value={locale}
      onChange={(event) => setLocale(event.target.value)}
      style={{
        height: 36,
        borderRadius: 8,
        border: "1px solid rgba(0,0,0,0.10)",
        background: "#FAFAF8",
        color: "#2D2A26",
        fontSize: 12,
        fontWeight: 700,
        padding: "0 8px",
        cursor: "pointer",
      }}
    >
      {SUPPORTED_LOCALES.map((localeCode) => (
        <option key={localeCode} value={localeCode}>
          {LOCALE_LABELS[localeCode] ?? localeCode.toUpperCase()}
        </option>
      ))}
    </select>
  );
}

export default function TopNav() {
  const t = useTranslations("nav");
  const [avatar] = useState(() => getAvatar());

  return (
    <div style={{
      padding: "16px 20px 8px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      flexShrink: 0,
      zIndex: 10,
    }}>
      <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: "linear-gradient(135deg, #2D2A26 0%, #5C574E 100%)",
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
        }}>🏛️</div>
        <div>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: "#2D2A26", lineHeight: 1.1 }}>
            {t("brand")}
          </div>
          <div style={{ fontSize: 11, color: "#8C8580", fontWeight: 400, letterSpacing: "0.02em" }}>
            {t("venue")}
          </div>
        </div>
      </Link>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <LanguageSelector />
        <Link href="/profile" style={{ textDecoration: "none" }}>
          <div style={{
            width: 36, height: 36, borderRadius: "50%", background: "#EDEAE4",
            overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 18, cursor: "pointer", flexShrink: 0,
          }}>
            {typeof avatar === "string" && avatar.startsWith("http") ? (
              <Image src={avatar} alt="avatar" width={36} height={36}
                style={{ width: "100%", height: "100%", objectFit: "cover" }} unoptimized />
            ) : avatar}
          </div>
        </Link>
      </div>
    </div>
  );
}
