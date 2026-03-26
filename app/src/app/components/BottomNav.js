// "use client" tells Next.js: this component runs in the browser (not on the server).
// We need it here because we use Link for navigation and track which tab is active.
"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { getAvatar } from "../lib/guest";

// The tabs array defines our 5 navigation buttons.
// "href" is the URL each button links to.
const TABS = [
  { icon: "🏠", label: "Home", id: "home", href: "/" },
  { icon: "🗺️", label: "Gallery", id: "gallery", href: "#" },
  { icon: "📸", label: "Scan", id: "scan", href: "/scan", special: true },
  { icon: "🏆", label: "Rankings", id: "rankings", href: "#" },
  { icon: "👤", label: "Profile", id: "profile", href: "/profile" },
];

// This component is used on every page. It figures out which tab is active
// by looking at the current URL (usePathname gives us the current path).
export default function BottomNav({ variant = "light" }) {
  const pathname = usePathname();
  const [profileAvatar, setProfileAvatar] = useState("👤");

  useEffect(() => {
    setProfileAvatar(getAvatar());
  }, []);

  // Figure out which tab matches the current page
  const activeTab = pathname === "/" ? "home"
    : pathname.startsWith("/scan") ? "scan"
    : pathname.startsWith("/artwork") ? "home"
    : pathname.startsWith("/profile") ? "profile"
    : "home";

  // Dark variant for scan and artwork detail pages, light for homepage
  const isDark = variant === "dark";
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
      maxWidth: 420,
      height: 80,
      background: bgColor,
      backdropFilter: "blur(20px)",
      borderTop: `1px solid ${borderColor}`,
      display: "flex",
      justifyContent: "space-around",
      alignItems: "flex-start",
      paddingTop: 8,
      zIndex: 20,
    }}>
      {TABS.map((tab) => (
        <Link
          key={tab.id}
          href={tab.href}
          style={{
            textDecoration: "none",
            background: "none",
            border: "none",
            padding: "8px 0",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 3,
            cursor: "pointer",
          }}
        >
          {tab.special ? (
            <div style={{
              width: 48,
              height: 48,
              borderRadius: 16,
              background: "linear-gradient(135deg, #C1476F 0%, #D4763A 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 22,
              marginTop: -20,
              boxShadow: "0 4px 16px rgba(193,71,111,0.35)",
            }}>
              {tab.icon}
            </div>
          ) : tab.id === "profile" && profileAvatar.startsWith("http") ? (
            <div style={{
              width: 26,
              height: 26,
              borderRadius: "50%",
              overflow: "hidden",
              opacity: activeTab === tab.id ? 1 : 0.45,
              transition: "opacity 0.2s",
              flexShrink: 0,
            }}>
              <Image
                src={profileAvatar}
                alt="avatar"
                width={26}
                height={26}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                unoptimized
              />
            </div>
          ) : (
            <span style={{
              fontSize: 22,
              opacity: activeTab === tab.id ? 1 : 0.45,
              transition: "opacity 0.2s",
            }}>
              {tab.id === "profile" ? profileAvatar : tab.icon}
            </span>
          )}
          <span style={{
            fontSize: 10,
            fontWeight: activeTab === tab.id ? 600 : 400,
            color: activeTab === tab.id ? activeTextColor : inactiveTextColor,
            marginTop: tab.special ? -2 : 0,
          }}>
            {tab.label}
          </span>
        </Link>
      ))}
    </div>
  );
}
