"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type User = {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  emailVerified: boolean;
  registrationCompleted: boolean;
  profile?: {
    profileImage: string | null;
    birthDay: number | null;
    birthMonth: number | null;
    birthYear: number | null;
    countryCode: string | null;
    city: string | null;
    state: string | null;
    zip: string | null;
    idType: string | null;
    idName: string | null;
    idNumber: string | null;
    idImage: string | null;
  };
};

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("photos");

  useEffect(() => {
    async function checkSession() {
      try {
        const response = await fetch("/api/auth/me", {
          credentials: "include",
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok || !data?.authenticated) {
          router.replace("/");
          return;
        }

        const dashboardResponse = await fetch("/api/dashboard-data", {
          credentials: "include",
          cache: "no-store",
        });

        if (dashboardResponse.ok) {
          const dashboardData = await dashboardResponse.json();

          if (dashboardData?.success && dashboardData?.user) {
            setUser({
              ...data.user,
              ...dashboardData.user,
            });
            setLoading(false);
            return;
          }
        }

        setUser(data.user);
        setLoading(false);
      } catch {
        router.replace("/");
      }
    }

    checkSession();
  }, [router]);

  return (
    <main
      aria-busy={loading}
      dir="rtl"
      style={{
        minHeight: "100dvh",
        background:
          "radial-gradient(circle at top right, #172554 0%, #0b1020 35%, #08090c 70%)",
        color: "#fff",
        fontFamily: "Arial, Tahoma, sans-serif",
        paddingBottom: "88px",
      }}
    >


      {/* Creative Sections - Middle Content Only */}
      <section
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          padding: "24px 16px",
        }}
      >
        {/* Horizontal Sections */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            overflowX: "auto",
            paddingBottom: 12,
            marginBottom: 25,
            scrollbarWidth: "thin",
          }}
        >
          {[
            { id: "photos", title: "تحرير الصور", icon: "▧" },
            { id: "videos", title: "تحرير الفيديو", icon: "▶" },
            { id: "design", title: "التصميم", icon: "✎" },
            { id: "ai", title: "الذكاء الاصطناعي", icon: "✦" },
            { id: "tools", title: "الأدوات الإبداعية", icon: "✧" },
            { id: "projects", title: "المشاريع الأخيرة", icon: "▤" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              style={{
                flex: "0 0 auto",
                padding: "12px 19px",
                borderRadius: 12,
                border: activeSection === item.id
                  ? "1px solid #8b5cf6"
                  : "1px solid rgba(255,255,255,.10)",
                background: activeSection === item.id
                  ? "linear-gradient(135deg,#7044c8,#5033a0)"
                  : "rgba(255,255,255,.045)",
                color: "#fff",
                fontSize: 13,
                fontWeight: 750,
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              <span style={{ marginLeft: 8 }}>{item.icon}</span>
              {item.title}
            </button>
          ))}
        </div>

        {/* Section Content */}
        <div
          style={{
            minHeight: 220,
            padding: "24px",
            borderRadius: 20,
            border: "1px solid rgba(255,255,255,.09)",
            background: "rgba(255,255,255,.035)",
          }}
        >
          {activeSection === "photos" && (
            <>
              <h2 style={{ fontSize: 21, margin: "0 0 9px" }}>
                تحرير الصور
              </h2>
              <p style={{ color: "#94a3b8", fontSize: 13, marginBottom: 22 }}>
                أدوات تعديل الصور وتحسينها وإنشاء أعمال احترافية.
              </p>
              <a
                href="/editor/photo"
                style={{
                  display: "inline-block",
                  padding: "13px 23px",
                  borderRadius: 11,
                  background: "#7044c8",
                  color: "#fff",
                  textDecoration: "none",
                  fontWeight: 800,
                  fontSize: 13,
                }}
              >
                فتح محرر الصور ←
              </a>
            </>
          )}

          {activeSection === "videos" && (
            <>
              <h2 style={{ fontSize: 21, margin: "0 0 9px" }}>
                تحرير الفيديو
              </h2>
              <p style={{ color: "#94a3b8", fontSize: 13 }}>
                مساحة مخصصة لقص الفيديوهات وتحريرها وإضافة المؤثرات.
              </p>
              <span style={{ color: "#a78bfa", fontSize: 12 }}>
                قريباً
              </span>
            </>
          )}

          {activeSection === "design" && (
            <>
              <h2 style={{ fontSize: 21, margin: "0 0 9px" }}>
                التصميم الإبداعي
              </h2>
              <p style={{ color: "#94a3b8", fontSize: 13 }}>
                مساحة لإنشاء التصاميم والأعمال البصرية.
              </p>
              <span style={{ color: "#a78bfa", fontSize: 12 }}>
                قريباً
              </span>
            </>
          )}

          {activeSection === "ai" && (
            <>
              <h2 style={{ fontSize: 21, margin: "0 0 9px" }}>
                الذكاء الاصطناعي
              </h2>
              <p style={{ color: "#94a3b8", fontSize: 13 }}>
                أدوات ذكية لتحليل الصور والفيديو وإنشاء المونتاج تلقائياً.
              </p>
              <span style={{ color: "#a78bfa", fontSize: 12 }}>
                قيد التطوير
              </span>
            </>
          )}

          {activeSection === "tools" && (
            <>
              <h2 style={{ fontSize: 21, margin: "0 0 9px" }}>
                الأدوات الإبداعية
              </h2>
              <p style={{ color: "#94a3b8", fontSize: 13 }}>
                مجموعة أدوات مساعدة لإثراء أعمالك الإبداعية.
              </p>
              <span style={{ color: "#a78bfa", fontSize: 12 }}>
                قريباً
              </span>
            </>
          )}

          {activeSection === "projects" && (
            <>
              <h2 style={{ fontSize: 21, margin: "0 0 9px" }}>
                المشاريع الأخيرة
              </h2>
              <p style={{ color: "#94a3b8", fontSize: 13 }}>
                ستظهر هنا أعمالك ومشاريعك المحفوظة.
              </p>
            </>
          )}
        </div>
      </section>

      {/* الشريط السفلي */}

    </main>
  );
}
