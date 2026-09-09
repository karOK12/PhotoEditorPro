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
        // لا نعرض شاشة تحميل؛ الواجهة تظهر مباشرة.
      }
    }

    checkSession();
  }, [router]);

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

    </main>
  );
}
