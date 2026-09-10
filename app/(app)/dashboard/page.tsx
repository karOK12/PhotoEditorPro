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

        {/* أدوات التحرير */}
        <section
          style={{
            marginTop: 24,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 14,
          }}
        >
          <a
            href="/editor/photo"
            style={{
              minHeight: 150,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
              padding: 20,
              borderRadius: 18,
              border: "1px solid rgba(255,255,255,.10)",
              background: "linear-gradient(145deg, rgba(255,255,255,.08), rgba(255,255,255,.035))",
              color: "#fff",
              textDecoration: "none",
              boxSizing: "border-box",
            }}
          >
            <svg
              width="34"
              height="34"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="3" width="18" height="18" rx="3" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="m21 15-5-5L5 21" />
            </svg>

            <span style={{ fontSize: 16, fontWeight: 850 }}>
              تحرير الصور
            </span>

            <span
              style={{
                fontSize: 12,
                color: "rgba(255,255,255,.58)",
              }}
            >
              تعديل وتحسين الصور
            </span>
          </a>
        </section>

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
