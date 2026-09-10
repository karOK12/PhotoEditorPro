"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  {
    label: "الصور",
    path: "/editor/photo",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="3" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <path d="m21 15-5-5L5 21" />
      </svg>
    ),
  },
  {
    label: "الفيديو",
    path: "/editor/video",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="5" width="12" height="14" rx="2.5" />
        <path d="m15 10 6-3.5v11L15 14" />
      </svg>
    ),
  },
  {
    label: "التصميم",
    path: "/editor/design",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m4 17 6-6" />
        <path d="m13 5 6 6" />
        <path d="m14 4 6 6" />
        <path d="m4 20 7-7" />
        <path d="m15 13 5 5" />
      </svg>
    ),
  },
  {
    label: "النص",
    path: "/editor/text",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 5h14" />
        <path d="M12 5v14" />
        <path d="M8 19h8" />
      </svg>
    ),
  },
  {
    label: "الفلاتر",
    path: "/editor/filters",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 6h16" />
        <path d="M7 12h10" />
        <path d="M10 18h4" />
      </svg>
    ),
  },
  {
    label: "الأدوات",
    path: "/tools",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m14.7 6.3 3 3" />
        <path d="M5 19 16.5 7.5" />
        <path d="m15 5 4 4" />
        <path d="M4 20h4" />
      </svg>
    ),
  },
];

export default function AppTopNav() {
  const pathname = usePathname();

  return (
    <header
      dir="rtl"
      style={{
        position: "fixed",
        top: 0,
        right: 0,
        left: 0,
        zIndex: 1100,
        minHeight: 76,
        padding: "0 18px",
        background: "rgba(8,9,12,.94)",
        borderBottom: "1px solid rgba(255,255,255,.08)",
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          position: "relative",
          height: 76,
          display: "flex",
          alignItems: "center",
          gap: 18,
          maxWidth: 1500,
          margin: "0 auto",
        }}
      >
        <button
          type="button"
          aria-label="فتح القائمة"
          className="top-sidebar-menu-button"
          onClick={() => {
            window.dispatchEvent(new Event("photoeditorpro:open-sidebar"));
          }}
          style={{
            position: "absolute",
            left: 14,
            top: 18,
            width: 40,
            height: 40,
            padding: 0,
            border: "1px solid rgba(255,255,255,.12)",
            borderRadius: 12,
            background: "rgba(255,255,255,.07)",
            color: "#fff",
            alignItems: "center",
            justifyContent: "center",
            backdropFilter: "blur(14px)",
            WebkitBackdropFilter: "blur(14px)",
            boxShadow: "0 4px 18px rgba(0,0,0,.18)",
          }}
        >
          <svg
            width="21"
            height="21"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <path d="M4 7h16" />
            <path d="M4 12h16" />
            <path d="M4 17h16" />
          </svg>
        </button>

        <div
          style={{
            minWidth: 170,
            color: "#fff",
            fontSize: 18,
            fontWeight: 900,
            letterSpacing: "-.4px",
          }}
        >
          PhotoEditorPro
        </div>

        <nav
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            overflowX: "auto",
            scrollbarWidth: "none",
            flex: 1,
          }}
        >
          {items.map((item) => {
            const active =
              pathname === item.path ||
              pathname.startsWith(item.path + "/");

            return (
              <Link
                key={item.path}
                href={item.path}
                style={{
                  flex: "0 0 auto",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  height: 40,
                  padding: "0 12px",
                  borderRadius: 10,
                  border: active
                    ? "1px solid rgba(255,255,255,.18)"
                    : "1px solid transparent",
                  background: active
                    ? "rgba(255,255,255,.12)"
                    : "rgba(255,255,255,.035)",
                  color: "#fff",
                  textDecoration: "none",
                  fontSize: 11.5,
                  fontWeight: active ? 800 : 650,
                  whiteSpace: "nowrap",
                }}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
