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
          height: 76,
          display: "flex",
          alignItems: "center",
          gap: 26,
          maxWidth: 1500,
          margin: "0 auto",
        }}
      >
        <div
          style={{
            minWidth: 190,
            color: "#fff",
            fontSize: 19,
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
            gap: 7,
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
                  height: 42,
                  padding: "0 13px",
                  borderRadius: 11,
                  border: active
                    ? "1px solid rgba(255,255,255,.18)"
                    : "1px solid transparent",
                  background: active
                    ? "rgba(255,255,255,.13)"
                    : "rgba(255,255,255,.045)",
                  color: "#fff",
                  textDecoration: "none",
                  fontSize: 12,
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
