"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

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

function ProfileIcon({
  active,
  profileImage,
}: {
  active: boolean;
  profileImage?: string | null;
}) {
  if (profileImage) {
    return (
      <img
        src={profileImage}
        alt="صورة الحساب"
        width={23}
        height={23}
        style={{
          width: "23px",
          height: "23px",
          borderRadius: "50%",
          objectFit: "cover",
          display: "block",
          border: active
            ? "2px solid #ffffff"
            : "2px solid rgba(255,255,255,0.18)",
        }}
      />
    );
  }

  return (
    <svg width="23" height="23" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle
        cx="12"
        cy="8"
        r="3.2"
        fill={active ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M5 21c.7-4 3.1-6 7-6s6.3 2 7 6"
        fill={active ? "currentColor" : "none"}
        fillOpacity={active ? 0.16 : 0}
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

const items = [
  { href: "/dashboard", label: "الرئيسية", Icon: HomeIcon },
  { href: "/tools", label: "الأدوات", Icon: ToolsIcon },
  { href: "/projects", label: "مشاريعي", Icon: ProjectsIcon },
  { href: "/profile", label: "حسابي", Icon: ProfileIcon },
];

export default function BottomNav() {
  const pathname = usePathname();
  const [profileImage, setProfileImage] = useState<string | null>(null);

  useEffect(() => {
    const loadProfileImage = () => {
      setProfileImage(localStorage.getItem("profileImage"));
    };

    loadProfileImage();

    window.addEventListener("profileUpdated", loadProfileImage);

    return () => {
      window.removeEventListener("profileUpdated", loadProfileImage);
    };
  }, []);

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
                transition:
                  "color .2s ease, background .2s ease, transform .2s ease",
                WebkitTapHighlightColor: "transparent",
              }}
            >
              {href === "/profile" ? (
                <ProfileIcon
                  active={active}
                  profileImage={profileImage}
                />
              ) : (
                <Icon active={active} />
              )}
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
