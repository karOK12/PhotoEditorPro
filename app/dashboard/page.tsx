"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type User = {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  emailVerified: boolean;
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
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#050505",
          color: "#fff",
          fontFamily: "Arial, Tahoma, sans-serif",
        }}
      >
        جارٍ التحقق من تسجيل الدخول...
      </main>
    );
  }

  if (!user) return null;

  return (
    <main
      dir="rtl"
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #050505 0%, #111827 55%, #172554 100%)",
        color: "#fff",
        padding: "30px 20px",
        boxSizing: "border-box",
        fontFamily: "Arial, Tahoma, sans-serif",
      }}
    >
      <section
        style={{
          maxWidth: "900px",
          margin: "0 auto",
        }}
      >
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "20px",
            marginBottom: "30px",
          }}
        >
          <div>
            <h1 style={{ margin: 0, fontSize: "28px" }}>
              Photo Editor Pro
            </h1>
            <p style={{ margin: "8px 0 0", color: "#cbd5e1" }}>
              لوحة التحكم
            </p>
          </div>

          <div
            style={{
              width: "52px",
              height: "52px",
              borderRadius: "14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background:
                "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)",
              fontSize: "24px",
              fontWeight: "800",
            }}
          >
            P
          </div>
        </header>

        <div
          style={{
            background: "rgba(255,255,255,.06)",
            border: "1px solid rgba(255,255,255,.1)",
            borderRadius: "20px",
            padding: "25px",
            marginBottom: "20px",
          }}
        >
          <h2 style={{ marginTop: 0 }}>أهلاً بك، {user.fullName}</h2>

          <p style={{ color: "#cbd5e1" }}>
            تم تسجيل دخولك بنجاح.
          </p>

          <div style={{ marginTop: "20px", lineHeight: 2 }}>
            <div>
              <strong>البريد الإلكتروني:</strong> {user.email}
            </div>

            <div>
              <strong>حالة البريد:</strong>{" "}
              {user.emailVerified ? "تم التحقق ✓" : "غير متحقق"}
            </div>

            {user.phone && (
              <div>
                <strong>رقم الهاتف:</strong> {user.phone}
              </div>
            )}
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "16px",
          }}
        >
          <div
            style={{
              padding: "22px",
              borderRadius: "16px",
              background: "rgba(255,255,255,.06)",
              border: "1px solid rgba(255,255,255,.1)",
            }}
          >
            <h3>محرر الصور</h3>
            <p style={{ color: "#94a3b8" }}>
              سيتم إضافة محرر الصور هنا.
            </p>
          </div>

          <div
            style={{
              padding: "22px",
              borderRadius: "16px",
              background: "rgba(255,255,255,.06)",
              border: "1px solid rgba(255,255,255,.1)",
            }}
          >
            <h3>محرر الفيديو</h3>
            <p style={{ color: "#94a3b8" }}>
              سيتم إضافة محرر الفيديو هنا.
            </p>
          </div>

          <div
            style={{
              padding: "22px",
              borderRadius: "16px",
              background: "rgba(255,255,255,.06)",
              border: "1px solid rgba(255,255,255,.1)",
            }}
          >
            <h3>حسابي</h3>
            <p style={{ color: "#94a3b8" }}>
              إدارة بيانات الحساب والملف الشخصي.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
