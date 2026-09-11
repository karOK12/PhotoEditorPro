"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";


function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg width="23" height="23" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M3 10.8 12 3l9 7.8V21a1 1 0 0 1-1 1h-5.2v-6.2H9.2V22H4a1 1 0 0 1-1-1V10.8Z"
        fill={active ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ToolsIcon({ active }: { active: boolean }) {
  return (
    <svg width="23" height="23" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="m14.7 6.2 3.1-3.1a5.2 5.2 0 0 0 0 7.4l-8.9 8.9a2.8 2.8 0 1 1-4-4l8.9-8.9a5.2 5.2 0 0 0 7.4 0l-3.1 3.1"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx="6.9"
        cy="17.4"
        r="1.1"
        fill={active ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.4"
      />
    </svg>
  );
}

function ProjectsIcon({ active }: { active: boolean }) {
  return (
    <svg width="23" height="23" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M3 7.5A2.5 2.5 0 0 1 5.5 5h4l2 2h7A2.5 2.5 0 0 1 21 9.5v8A2.5 2.5 0 0 1 18.5 20h-13A2.5 2.5 0 0 1 3 17.5v-10Z"
        fill={active ? "currentColor" : "none"}
        fillOpacity={active ? 0.16 : 0}
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M3.5 10h17"
        stroke="currentColor"
        strokeWidth="1.6"
      />
    </svg>
  );
}

function VideoIcon({ active }: { active: boolean }) {
  return (
    <svg width="23" height="23" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="5" width="13" height="14" rx="2.5"
        fill={active ? "currentColor" : "none"}
        fillOpacity={active ? 0.14 : 0}
        stroke="currentColor" strokeWidth="1.8" />
      <path d="m16 10 4-2.5v9L16 14"
        stroke="currentColor" strokeWidth="1.8"
        strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 9v6l4-3-4-3Z"
        fill="currentColor" />
    </svg>
  );
}

function PhotoIcon({ active }: { active: boolean }) {
  return (
    <svg width="23" height="23" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="4" width="18" height="16" rx="2.5"
        fill={active ? "currentColor" : "none"}
        fillOpacity={active ? 0.14 : 0}
        stroke="currentColor" strokeWidth="1.8" />
      <circle cx="8.5" cy="9" r="1.5" fill="currentColor" />
      <path d="m4.8 17 4.6-4.6 3.1 3.1 2.1-2.1 4.6 4.6"
        stroke="currentColor" strokeWidth="1.8"
        strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DesignIcon({ active }: { active: boolean }) {
  return (
    <svg width="23" height="23" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="m14.8 4.2 5 5"
        stroke="currentColor" strokeWidth="1.8"
        strokeLinecap="round" />
      <path d="m13.5 5.5-9 9a2.5 2.5 0 0 0-.7 1.4L3.2 20.8l4.9-.6a2.5 2.5 0 0 0 1.4-.7l9-9-5-5Z"
        fill={active ? "currentColor" : "none"}
        fillOpacity={active ? 0.14 : 0}
        stroke="currentColor" strokeWidth="1.8"
        strokeLinejoin="round" />
      <path d="m11.2 7.8 5 5"
        stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

const items = [
  { href: "/dashboard", label: "الرئيسية", Icon: HomeIcon },
  { href: "/dashboard/editor/video", label: "فيديو", Icon: VideoIcon },
  { href: "/dashboard/editor/photo", label: "صور", Icon: PhotoIcon },
  { href: "/dashboard/editor/design", label: "تصميم", Icon: DesignIcon },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="التنقل الرئيسي"
      style={{
        position: "fixed",
        right: 0,
        bottom: 0,
        left: 0,
        zIndex: 1000,
        display: "flex",
        justifyContent: "center",
        padding: "8px 12px calc(8px + env(safe-area-inset-bottom))",
        background: "rgba(8, 9, 12, 0.92)",
        borderTop: "1px solid rgba(255,255,255,0.08)",
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "520px",
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "5px",
        }}
      >
        {items.map(({ href, label, Icon }) => {
          const active =
            pathname === href || pathname.startsWith(href + "/");

          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              style={{
                minHeight: "58px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "5px",
                borderRadius: "14px",
                color: active ? "#ffffff" : "#94a3b8",
                background: active
                  ? "rgba(255,255,255,0.08)"
                  : "transparent",
                textDecoration: "none",
                transition: "none",
                WebkitTapHighlightColor: "transparent",
              }}
            >
              <Icon active={active} />

              <span
                style={{
                  fontSize: "11px",
                  fontWeight: active ? 800 : 600,
                  lineHeight: 1,
                }}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
