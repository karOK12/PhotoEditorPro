"use client";

import { FormEvent, useState } from "react";

export default function ResetRegistrationPage() {
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/dev/reset-registration", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.message || "غير مصرح");
        return;
      }

      localStorage.removeItem("photoeditorpro_registration_completed");
      window.location.href = "/";
    } catch {
      setError("تعذر الاتصال بالخادم");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      dir="rtl"
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          width: "100%",
          maxWidth: "420px",
          display: "grid",
          gap: "16px",
        }}
      >
        <h1>أداة اختبار التسجيل</h1>

        <input
          type="password"
          value={token}
          onChange={(event) => setToken(event.target.value)}
          placeholder="رمز المطوّر"
          autoComplete="off"
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "جاري التحقق..." : "بدء اختبار تسجيل حساب جديد"}
        </button>

        {error && <p>{error}</p>}
      </form>
    </main>
  );
}
