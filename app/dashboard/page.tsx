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
            return;
          }
        }

        setUser(data.user);
      } catch {
        router.replace("/");
      } finally {
        setLoading(false);
      }
    }

    checkSession();
  }, [router]);

  if (loading) {
    return (
      <main
        dir="rtl"
        style={{
          minHeight: "100dvh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#08090c",
          color: "#fff",
          fontFamily: "Arial, Tahoma, sans-serif",
        }}
      >
        جارٍ تحميل التطبيق...
      </main>
    );
  }

  if (!user) return null;

  return (
    <main
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
      {/* الشريط العلوي */}
      <header
        style={{
          height: "70px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 18px",
          borderBottom: "1px solid rgba(255,255,255,.08)",
          background: "rgba(8,9,12,.88)",
          backdropFilter: "blur(16px)",
          position: "sticky",
          top: 0,
          zIndex: 20,
        }}
      >
        <div>
          <div style={{ fontSize: "20px", fontWeight: 800 }}>
            PhotoEditorPro
          </div>
          <div style={{ color: "#94a3b8", fontSize: "12px", marginTop: "3px" }}>
            أهلاً {user.fullName}
          </div>
        </div>

        <button
          type="button"
          onClick={() => router.push("/profile")}
          aria-label="الملف الشخصي"
          style={{
            width: "44px",
            height: "44px",
            borderRadius: "50%",
            border: "1px solid rgba(255,255,255,.14)",
            background: "rgba(255,255,255,.08)",
            color: "#fff",
            fontSize: "21px",
            cursor: "pointer",
            padding: 0,
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {user.profile?.profileImage ? (
            <img
              src={user.profile.profileImage}
              alt="صورة الحساب"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
              }}
            />
          ) : (
            "👤"
          )}
        </button>
      </header>

      {/* مساحة العمل */}
      <section
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          padding: "24px 16px",
        }}
      >
        <div
          style={{
            marginBottom: "22px",
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: "30px",
              fontWeight: 800,
            }}
          >
            مساحة العمل
          </h1>

          <p
            style={{
              margin: "8px 0 0",
              color: "#94a3b8",
              fontSize: "14px",
            }}
          >
            اختر الأداة التي تريد استخدامها
          </p>
        </div>

        {/* أدوات المونتاج */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "16px",
          }}
        >
          <button
            type="button"
            style={{
              minHeight: "190px",
              border: "1px solid rgba(59,130,246,.25)",
              borderRadius: "24px",
              background:
                "linear-gradient(145deg, rgba(37,99,235,.22), rgba(15,23,42,.82))",
              color: "#fff",
              padding: "24px",
              textAlign: "right",
              cursor: "pointer",
            }}
          >
            <div style={{ fontSize: "42px", marginBottom: "20px" }}>🖼️</div>

            <div style={{ fontSize: "22px", fontWeight: 800 }}>
              محرر الصور
            </div>

            <div
              style={{
                color: "#94a3b8",
                marginTop: "8px",
                fontSize: "14px",
              }}
            >
              تعديل الصور وإضافة التأثيرات والفلاتر
            </div>
          </button>

          <button
            type="button"
            style={{
              minHeight: "190px",
              border: "1px solid rgba(124,58,237,.25)",
              borderRadius: "24px",
              background:
                "linear-gradient(145deg, rgba(124,58,237,.22), rgba(15,23,42,.82))",
              color: "#fff",
              padding: "24px",
              textAlign: "right",
              cursor: "pointer",
            }}
          >
            <div style={{ fontSize: "42px", marginBottom: "20px" }}>🎬</div>

            <div style={{ fontSize: "22px", fontWeight: 800 }}>
              محرر الفيديو
            </div>

            <div
              style={{
                color: "#94a3b8",
                marginTop: "8px",
                fontSize: "14px",
              }}
            >
              قص ودمج الفيديو وإضافة النصوص والمؤثرات
            </div>
          </button>
        </div>

        {/* المشاريع */}
        <section style={{ marginTop: "30px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "14px",
            }}
          >
            <h2 style={{ margin: 0, fontSize: "20px" }}>
              مشاريعي
            </h2>

            <span
              style={{
                color: "#64748b",
                fontSize: "13px",
              }}
            >
              قريباً
            </span>
          </div>

          <div
            style={{
              minHeight: "130px",
              borderRadius: "20px",
              border: "1px dashed rgba(255,255,255,.14)",
              background: "rgba(255,255,255,.035)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              color: "#64748b",
              padding: "20px",
            }}
          >
            ستظهر مشاريعك المحفوظة هنا
          </div>
        </section>
      </section>

      {/* الشريط السفلي */}
      <nav
        style={{
          position: "fixed",
          bottom: 0,
          right: 0,
          left: 0,
          height: "74px",
          background: "rgba(8,9,12,.94)",
          borderTop: "1px solid rgba(255,255,255,.1)",
          backdropFilter: "blur(18px)",
          display: "flex",
          justifyContent: "center",
          zIndex: 30,
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "700px",
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            alignItems: "center",
          }}
        >
          <button
            type="button"
            style={{
              background: "transparent",
              border: 0,
              color: "#fff",
              cursor: "pointer",
              fontSize: "12px",
            }}
          >
            <div style={{ fontSize: "21px" }}>🏠</div>
            الرئيسية
          </button>

          <button
            type="button"
            style={{
              background: "transparent",
              border: 0,
              color: "#94a3b8",
              cursor: "pointer",
              fontSize: "12px",
            }}
          >
            <div style={{ fontSize: "21px" }}>✨</div>
            الأدوات
          </button>

          <button
            type="button"
            style={{
              background: "transparent",
              border: 0,
              color: "#94a3b8",
              cursor: "pointer",
              fontSize: "12px",
            }}
          >
            <div style={{ fontSize: "21px" }}>📁</div>
            مشاريعي
          </button>

          <button
            type="button"
            onClick={() => router.push("/profile")}
            style={{
              background: "transparent",
              border: 0,
              color: "#94a3b8",
              cursor: "pointer",
              fontSize: "12px",
            }}
          >
            <div style={{ fontSize: "21px" }}>👤</div>
            حسابي
          </button>
        </div>
      </nav>
    </main>
  );
}
