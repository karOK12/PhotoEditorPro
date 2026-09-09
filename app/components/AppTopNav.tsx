"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  {
    label: "تحرير الصور",
    path: "/editor/photo",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <path d="m21 15-5-5L5 21" />
      </svg>
    ),
  },
  {
    label: "تحرير الفيديو",
    path: "/editor/video",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="5" width="13" height="14" rx="2" />
        <path d="m16 10 5-3v10l-5-3z" />
      </svg>
    ),
  },
  {
    label: "التصميم",
    path: "/editor/design",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3v18" />
        <path d="M3 12h18" />
        <path d="M5 5l14 14" />
        <path d="M19 5 5 19" />
      </svg>
    ),
  },
  {
    label: "النصوص",
    path: "/editor/text",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 6h16" />
        <path d="M12 6v14" />
        <path d="M8 20h8" />
      </svg>
    ),
  },
  {
    label: "الفلاتر",
    path: "/editor/filters",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 5h16" />
        <path d="M7 12h10" />
        <path d="M10 19h4" />
      </svg>
    ),
  },
  {
    label: "الأدوات",
    path: "/tools",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m14.7 6.3 3 3" />
        <path d="m5 19 6.5-6.5" />
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
        minHeight: "70px",
        padding: "0 18px",
        borderBottom: "1px solid rgba(255,255,255,.08)",
        background: "rgba(8,9,12,.92)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
      }}
    >
      <div style={{ width: "100%" }}>
        <div
          style={{
            height: "70px",
            display: "flex",
            alignItems: "center",
            fontSize: "20px",
            fontWeight: 800,
            color: "#fff",
          }}
        >
          PhotoEditorPro
        </div>

        <div
          style={{
            display: "flex",
            gap: "8px",
            overflowX: "auto",
            paddingBottom: "8px",
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
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "9px 12px",
                  borderRadius: "12px",
                  border: "1px solid rgba(255,255,255,.10)",
                  background: active
                    ? "rgba(255,255,255,.12)"
                    : "rgba(255,255,255,.06)",
                  color: "#fff",
                  textDecoration: "none",
                  fontSize: "12px",
                  fontWeight: active ? 800 : 600,
                  whiteSpace: "nowrap",
                }}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
}
