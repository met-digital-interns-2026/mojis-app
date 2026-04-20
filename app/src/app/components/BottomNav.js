// "use client" tells Next.js: this component runs in the browser (not on the server).
"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { getAvatar } from "../lib/guest";
import { useTranslations } from "../lib/i18n";

const TABS = [
  { icon: "🏠", labelKey: "home",     id: "home",     href: "/" },
  { icon: "🗺️", labelKey: "gallery",  id: "gallery",  href: "/gallery" },
  { icon: "📸", labelKey: "scan",     id: "scan",     href: "/scan", special: true },
  { icon: "🏆", labelKey: "rankings", id: "rankings", href: "/rankings" },
  { icon: "👤", labelKey: "profile",  id: "profile",  href: "/profile" },
];

export default function BottomNav({ variant = "light" }) {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const [profileAvatar] = useState(() => getAvatar());
  const [isDesktop, setIsDesktop] = useState(
    () => typeof window !== "undefined" && window.innerWidth >= 1024
  );

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const activeTab = pathname === "/"           ? "home"
    : pathname.startsWith("/gallery")          ? "gallery"
    : pathname.startsWith("/scan")             ? "scan"
    : pathname.startsWith("/artwork")          ? "home"
    : pathname.startsWith("/profile")          ? "profile"
    : pathname.startsWith("/rankings")         ? "rankings"
    : "home";

  const isDark = variant === "dark" && !isDesktop;

  // ── Desktop: left sidebar ────────────────────────────────────────────────
  if (isDesktop) {
    return (
      <div style={{
        position: "fixed",
        left: 0,
        top: 0,
        width: 220,
        height: "100vh",
        background: "rgba(247,245,240,0.97)",
        backdropFilter: "blur(20px)",
        borderRight: "1px solid rgba(0,0,0,0.07)",
        display: "flex",
        flexDirection: "column",
        zIndex: 20,
      }}>
        {/* Logo */}
        <div style={{ padding: "28px 20px 20px", display: "flex", alignItems: "center", gap: 10, borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: "linear-gradient(135deg, #2D2A26 0%, #5C574E 100%)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0,
          }}>🏛️</div>
          <div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 15, fontWeight: 700, color: "#2D2A26", lineHeight: 1.1 }}>
              {t("brand")}
            </div>
            <div style={{ fontSize: 10, color: "#8C8580" }}>{t("venue")}</div>
          </div>
        </div>

        {/* Nav items */}
        <div style={{ flex: 1, padding: "16px 12px", display: "flex", flexDirection: "column", gap: 2 }}>
          {TABS.map(tab => {
            const isActive = activeTab === tab.id;
            const icon = tab.id === "profile"
              ? (profileAvatar.startsWith("http")
                  ? <div style={{ width: 22, height: 22, borderRadius: "50%", overflow: "hidden", flexShrink: 0 }}>
                      <Image src={profileAvatar} alt="avatar" width={22} height={22}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }} unoptimized />
                    </div>
                  : <span style={{ fontSize: 20, lineHeight: 1 }}>{profileAvatar}</span>
                )
              : <span style={{ fontSize: 20, lineHeight: 1 }}>{tab.icon}</span>;

            if (tab.special) {
              return (
                <Link key={tab.id} href={tab.href} style={{ textDecoration: "none" }}>
                  <div style={{
                    display: "flex", alignItems: "center", gap: 12, padding: "10px 14px",
                    borderRadius: 14, cursor: "pointer",
                    background: isActive
                      ? "linear-gradient(135deg, #C1476F 0%, #D4763A 100%)"
                      : "rgba(193,71,111,0.08)",
                    transition: "background 0.15s",
                  }}>
                    {icon}
                    <span style={{ fontSize: 14, fontWeight: 600, color: isActive ? "#FFF" : "#C1476F" }}>{t(tab.labelKey)}</span>
                  </div>
                </Link>
              );
            }

            return (
              <Link key={tab.id} href={tab.href} style={{ textDecoration: "none" }}>
                <div style={{
                  display: "flex", alignItems: "center", gap: 12, padding: "10px 14px",
                  borderRadius: 14, cursor: "pointer",
                  background: isActive ? "rgba(45,42,38,0.07)" : "transparent",
                  transition: "background 0.15s",
                }}>
                  <span style={{ opacity: isActive ? 1 : 0.45 }}>{icon}</span>
                  <span style={{ fontSize: 14, fontWeight: isActive ? 600 : 400, color: isActive ? "#2D2A26" : "#8C8580" }}>
                    {t(tab.labelKey)}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    );
  }

  // ── Mobile / tablet: bottom bar ──────────────────────────────────────────
  const bgColor = isDark ? "rgba(10,10,10,0.92)" : "rgba(247,245,240,0.92)";
  const borderColor = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";
  const activeTextColor = isDark ? "#FFF" : "#2D2A26";
  const inactiveTextColor = isDark ? "rgba(255,255,255,0.35)" : "#A09B94";

  return (
    <div style={{
      position: "fixed",
      bottom: 0,
      left: "50%",
      transform: "translateX(-50%)",
      width: "100%",
      maxWidth: 680,
      height: "calc(80px + env(safe-area-inset-bottom, 0px))",
      background: bgColor,
      backdropFilter: "blur(20px)",
      borderTop: `1px solid ${borderColor}`,
      display: "flex",
      justifyContent: "space-around",
      alignItems: "flex-start",
      paddingTop: 8,
      paddingBottom: "env(safe-area-inset-bottom, 0px)",
      zIndex: 20,
    }}>
      {TABS.map(tab => (
        <Link key={tab.id} href={tab.href} style={{
          textDecoration: "none", background: "none", border: "none",
          padding: "8px 0", display: "flex", flexDirection: "column",
          alignItems: "center", gap: 3, cursor: "pointer",
        }}>
          {tab.special ? (
            <div style={{
              width: 48, height: 48, borderRadius: 16,
              background: "linear-gradient(135deg, #C1476F 0%, #D4763A 100%)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 22, marginTop: -20,
              boxShadow: "0 4px 16px rgba(193,71,111,0.35)",
            }}>{tab.icon}</div>
          ) : tab.id === "profile" && profileAvatar.startsWith("http") ? (
            <div style={{
              width: 26, height: 26, borderRadius: "50%", overflow: "hidden",
              opacity: activeTab === tab.id ? 1 : 0.45, transition: "opacity 0.2s", flexShrink: 0,
            }}>
              <Image src={profileAvatar} alt="avatar" width={26} height={26}
                style={{ width: "100%", height: "100%", objectFit: "cover" }} unoptimized />
            </div>
          ) : (
            <span style={{ fontSize: 22, opacity: activeTab === tab.id ? 1 : 0.45, transition: "opacity 0.2s" }}>
              {tab.id === "profile" ? profileAvatar : tab.icon}
            </span>
          )}
          <span style={{
            fontSize: 10,
            fontWeight: activeTab === tab.id ? 600 : 400,
            color: activeTab === tab.id ? activeTextColor : inactiveTextColor,
            marginTop: tab.special ? -2 : 0,
          }}>{t(tab.labelKey)}</span>
        </Link>
      ))}
    </div>
  );
}
