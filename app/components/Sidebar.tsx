"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

function Icon({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <span
      style={{
        width: 78,
        height: 78,
        minWidth: 78,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {children}
    </span>
  );
}

const icons = {
  account: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c.7-4 3.4-6 8-6s7.3 2 8 6" />
    </svg>
  ),
  privacy: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3 20 6v5c0 5-3.4 8.7-8 10-4.6-1.3-8-5-8-10V6l8-3Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  ),
  terms: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 3h9l3 3v15H6z" />
      <path d="M14 3v4h4" />
      <path d="M9 12h6M9 16h6" />
    </svg>
  ),
  license: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 3h10v18H7z" />
      <path d="M10 7h4M10 11h4M10 15h4" />
    </svg>
  ),
  rating: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3Z" />
    </svg>
  ),
  help: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M9.8 9a2.4 2.4 0 1 1 4.2 1.6c-1.2 1.2-2 1.5-2 3" />
      <path d="M12 17h.01" />
    </svg>
  ),
  logout: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 4H5v16h5" />
      <path d="M14 8l4 4-4 4" />
      <path d="M8 12h10" />
    </svg>
  ),
};

const items = [
  { label: "إعدادات الحساب", href: "/profile", icon: icons.account },
  { label: "سياسات الخصوصية", href: "/privacy", icon: icons.privacy },
  { label: "الشروط والأحكام", href: "/terms", icon: icons.terms },
  { label: "اتفاقية ترخيص", href: "/license", icon: icons.license },
  { label: "تقييم التطبيق", href: "/rating", icon: icons.rating },
  { label: "مركز المساعدة", href: "/help", icon: icons.help },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
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

  async function logout() {
    if (loggingOut) return;

    setLoggingOut(true);

    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Logout failed");
      }

      localStorage.removeItem("token");
      localStorage.removeItem("auth_token");
      localStorage.removeItem("profileImage");

      router.replace("/login");
      router.refresh();
    } catch {
      setLoggingOut(false);
    }
  }

  return (
    <>


      {open && (
        <button
          type="button"
          aria-label="إغلاق القائمة"
          onClick={() => setOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1190,
            border: 0,
            background: "rgba(0,0,0,.55)",
          }}
        />
      )}

      <aside
        dir="rtl"
        className={`app-sidebar ${open ? "is-open" : ""}`}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          width: 250,
          zIndex: 1200,
          padding: "92px 14px 20px",
          background: "#0b0c10",
          borderRight: "1px solid rgba(255,255,255,.08)",
          boxSizing: "border-box",
          overflowY: "auto",
        }}
      >


        <div
          style={{
            padding: "0 10px 14px",
            marginBottom: 8,
            borderBottom: "1px solid rgba(255,255,255,.07)",
          }}
        >
          <div style={{ color: "#fff", fontWeight: 800, fontSize: 17 }}>
            PhotoEditorPro
          </div>
          <div style={{ color: "rgba(255,255,255,.48)", fontSize: 12, marginTop: 4 }}>
            الإعدادات والمساعدة
          </div>
        </div>

        <nav style={{ display: "grid", gap: 6 }}>
          {items.map((item) => {
            const active =
              pathname === item.href ||
              pathname.startsWith(item.href + "/");

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 13,
                  minHeight: 78,
                  padding: "0 13px",
                  borderRadius: 12,
                  color: active ? "#fff" : "rgba(255,255,255,.78)",
                  background: active
                    ? "rgba(255,255,255,.12)"
                    : "transparent",
                  textDecoration: "none",
                  fontSize: 13,
                  fontWeight: active ? 800 : 600,
                  transition: "background .18s ease",
                }}
              >
                <Icon>
                  {item.href === "/profile" && profileImage ? (
                    <img
                      src={profileImage}
                      alt="صورة الحساب"
                      width={78}
                      height={78}
                      style={{
                        width: 78,
                        height: 78,
                        borderRadius: "50%",
                        objectFit: "cover",
                        display: "block",
                        border: active
                          ? "2px solid #ffffff"
                          : "2px solid rgba(255,255,255,.18)",
                      }}
                    />
                  ) : (
                    item.icon
                  )}
                </Icon>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div
          style={{
            height: 1,
            background: "rgba(255,255,255,.07)",
            margin: "14px 4px",
          }}
        />

        <button
          type="button"
          onClick={logout}
          disabled={loggingOut}
          style={{
            width: "100%",
            minHeight: 78,
            display: "flex",
            alignItems: "center",
            gap: 13,
            padding: "0 13px",
            border: 0,
            borderRadius: 12,
            background: loggingOut
              ? "rgba(255,255,255,.05)"
              : "rgba(255,70,70,.07)",
            color: loggingOut ? "rgba(255,255,255,.45)" : "#ff7777",
            cursor: loggingOut ? "wait" : "pointer",
            fontSize: 13,
            fontWeight: 700,
            textAlign: "right",
          }}
        >
          <Icon>{icons.logout}</Icon>
          <span>{loggingOut ? "جاري تسجيل الخروج..." : "تسجيل الخروج"}</span>
        </button>
      </aside>
</>
  );
}
