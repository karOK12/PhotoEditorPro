"use client";

import { FormEvent, useEffect, useState } from "react";

export default function Home() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [registrationCompleted, setRegistrationCompleted] = useState(false);
  const [authStateLoaded, setAuthStateLoaded] = useState(false);

  useEffect(() => {
    async function loadAuthState() {
      try {
        const response = await fetch("/api/auth/me", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });

        const data = await response.json();

        const localRegistrationCompleted =
          localStorage.getItem("photoeditorpro_registration_completed") === "true";

        if (
          localRegistrationCompleted ||
          (
            response.ok &&
            data?.authenticated === true &&
            data?.user?.registrationCompleted === true
          )
        ) {
          setRegistrationCompleted(true);
        } else {
          setRegistrationCompleted(false);
        }
      } catch (error) {
        console.error("Auth state error:", error);
        setRegistrationCompleted(false);
      } finally {
        setAuthStateLoaded(true);
      }
    }

    loadAuthState();
  }, []);
  const [message, setMessage] = useState("");

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (!email.trim() || !password) {
      setMessage("يرجى إدخال اسم المستخدم والبريد الإلكتروني وكلمة المرور");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data?.success) {
        setMessage(data?.message || "تعذر تسجيل الدخول");
        return;
      }

      setMessage("تم تسجيل الدخول بنجاح");
      window.location.href = "/";
    } catch (error) {
      console.error("Login error:", error);
      setMessage("تعذر الاتصال بالخادم");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      dir="rtl"
      style={{
        minHeight: "100vh",
        width: "100%",
        background: "linear-gradient(135deg, #ffffff 0%, #f3f3f3 22%, #171717 58%, #050505 100%)",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        boxSizing: "border-box",
        fontFamily:
          "Arial, Tahoma, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
        position: "relative",
        overflow: "hidden",
        visibility: "visible",
      }}
    >
      <div
        style={{
          position: "absolute",
          width: "420px",
          height: "420px",
          borderRadius: "50%",
          background: "rgba(37,99,235,.08)",
          filter: "blur(70px)",
          top: "-180px",
          right: "-120px",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "absolute",
          width: "380px",
          height: "380px",
          borderRadius: "50%",
          background: "rgba(139,92,246,.07)",
          filter: "blur(80px)",
          bottom: "-180px",
          left: "-120px",
          pointerEvents: "none",
        }}
      />

      <section
        style={{
          width: "100%",
          maxWidth: "380px",
          position: "relative",
          zIndex: 2,
          background: "linear-gradient(145deg, #ffffff 0%, #f8fbff 55%, #eaf3ff 100%)",
          border: "1px solid rgba(255,255,255,.12)",
          borderRadius: "18px",
          padding: "21px",
          boxSizing: "border-box",
          boxShadow:
            "0 18px 55px rgba(0,0,0,.38), inset 0 1px 0 rgba(255,255,255,.025)",
          backdropFilter: "blur(18px)",
        }}
      >
        <div
          style={{
            textAlign: "center",
            marginBottom: "17px",
          }}
        >
          <div
            style={{
              width: "58px",
              height: "58px",
              margin: "0 auto 9px",
              borderRadius: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background:
                "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)",
              boxShadow: "0 8px 24px rgba(37,99,235,.25)",
              overflow: "hidden",
            }}
          >
            <img
              src="/assets/images/logo.png"
              alt="Photo Editor Pro"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                padding: "8px",
                boxSizing: "border-box",
              }}
              onError={(event) => {
                event.currentTarget.style.display = "none";
              }}
            />

            <span
              style={{
                position: "absolute",
                fontSize: "27px",
                fontWeight: "900",
                color: "#fff",
                pointerEvents: "none",
              }}
            >
              P
            </span>
          </div>

          <h1
            style={{
              color: "#173b8f",
              margin: 0,
              fontSize: "22px",
              fontWeight: "800",
              letterSpacing: "-.4px",
            }}
          >
            Photo Editor Pro
          </h1>

          <div
            style={{
              width: "36px",
              height: "2px",
              borderRadius: "10px",
              background: "linear-gradient(90deg,#2563eb,#8b5cf6)",
              margin: "8px auto 0",
            }}
          />
        </div>

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: "12px" }}>
            <label
              htmlFor="email"
              style={{
                display: "block",
                fontSize: "13px",
                fontWeight: "600",
                color: "#173b8f",
                marginBottom: "8px",
              }}
            >
              اسم المستخدم أو البريد الإلكتروني
            </label>

            <div style={{ position: "relative" }}>
              <span
                style={{
                  position: "absolute",
                  right: "13px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#64748b",
                  fontSize: "18px",
                  pointerEvents: "none",
                }}
              >
                👤
              </span>

              <input
                id="email"
                name="email"
                type="text"
                autoComplete="username"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="اسم المستخدم أو البريد الإلكتروني"
                style={{
                  width: "100%",
                  height: "47px",
                  boxSizing: "border-box",
                  borderRadius: "11px",
                  border: "1px solid #273449",
                  background: "#0b1220",
                  color: "#fff",
                  padding: "0 44px 0 13px",
                  outline: "none",
                  fontSize: "13px",
                }}
                onFocus={(event) => {
                  event.currentTarget.style.borderColor = "#3b82f6";
                  event.currentTarget.style.boxShadow =
                    "0 0 0 3px rgba(59,130,246,.12)";
                }}
                onBlur={(event) => {
                  event.currentTarget.style.borderColor = "#273449";
                  event.currentTarget.style.boxShadow = "none";
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: "7px" }}>
            <label
              htmlFor="password"
              style={{
                display: "block",
                fontSize: "13px",
                fontWeight: "600",
                color: "#173b8f",
                marginBottom: "8px",
              }}
            >
              كلمة المرور
            </label>

            <div style={{ position: "relative" }}>
              <span
                style={{
                  position: "absolute",
                  right: "13px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#64748b",
                  fontSize: "17px",
                  pointerEvents: "none",
                }}
              >
                🔒
              </span>

              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="أدخل كلمة المرور"
                style={{
                  width: "100%",
                  height: "47px",
                  boxSizing: "border-box",
                  borderRadius: "11px",
                  border: "1px solid #273449",
                  background: "#0b1220",
                  color: "#fff",
                  padding: "0 44px 0 46px",
                  outline: "none",
                  fontSize: "13px",
                }}
                onFocus={(event) => {
                  event.currentTarget.style.borderColor = "#3b82f6";
                  event.currentTarget.style.boxShadow =
                    "0 0 0 3px rgba(59,130,246,.12)";
                }}
                onBlur={(event) => {
                  event.currentTarget.style.borderColor = "#273449";
                  event.currentTarget.style.boxShadow = "none";
                }}
              />

              <button
                type="button"
                aria-label={
                  showPassword
                    ? "إخفاء كلمة المرور"
                    : "إظهار كلمة المرور"
                }
                onClick={() => setShowPassword((value) => !value)}
                style={{
                  position: "absolute",
                  left: "8px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: "32px",
                  height: "32px",
                  border: "none",
                  background: "transparent",
                  color: "#64748b",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg
                  width="19"
                  height="19"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {showPassword ? (
                    <>
                      <path d="M3 3l18 18" />
                      <path d="M10.58 10.58a2 2 0 0 0 2.83 2.83" />
                      <path d="M9.88 4.24A10.94 10.94 0 0 1 12 4c5 0 9.27 3.11 11 8-0.67 1.88-1.72 3.5-3.08 4.75" />
                      <path d="M6.61 6.61C4.62 7.84 3.07 9.68 2 12c1.73 4.89 6 8 10 8 1.61 0 3.16-.42 4.54-1.17" />
                    </>
                  ) : (
                    <>
                      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
                      <circle cx="12" cy="12" r="3" />
                    </>
                  )}
                </svg>
              </button>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "flex-start",
              marginBottom: "13px",
            }}
          >
            <button
              type="button"
              onClick={() => {
                alert("سيتم بناء استعادة كلمة المرور ضمن نظام الحسابات.");
              }}
              style={{
              color: "#173b8f",
                border: "none",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: "700",
                padding: "3px 0",
              }}
            >
              نسيت كلمة المرور؟
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              height: "48px",
              border: "none",
              borderRadius: "11px",
              background: loading
                ? "#334155"
                : "linear-gradient(135deg,#2563eb,#4f46e5)",
              color: "#fff",
              fontSize: "14px",
              fontWeight: "800",
              cursor: loading ? "not-allowed" : "pointer",
              boxShadow: loading
                ? "none"
                : "0 8px 20px rgba(37,99,235,.22)",
            }}
          >
            {loading ? "جارِ تسجيل الدخول..." : "تسجيل الدخول"}
          </button>
        </form>

        {message && (
          <div
            role="alert"
            style={{
              marginTop: "11px",
              padding: "9px 11px",
              borderRadius: "10px",
              background: message.includes("نجاح")
                ? "rgba(34,197,94,.10)"
                : "rgba(239,68,68,.10)",
              border: message.includes("نجاح")
                ? "1px solid rgba(34,197,94,.20)"
                : "1px solid rgba(239,68,68,.20)",
              color: message.includes("نجاح")
                ? "#86efac"
                : "#fca5a5",
              textAlign: "center",
              fontSize: "12px",
            }}
          >
            {message}
          </div>
        )}

          {authStateLoaded && !registrationCompleted && (
            <>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
            marginTop: "14px",
            fontSize: "12px",
            color: "#94a3b8",
          }}
        >
          <span>ليس لديك حساب؟</span>

          <button
            type="button"
            onClick={() => {
              localStorage.removeItem(
                "photoeditorpro_registration_completed"
              );
              window.location.href = "/user-data";
            }}
            style={{
              border: "none",
              background: "transparent",
              color: "#173b8f",
              cursor: "pointer",
              fontSize: "12px",
              fontWeight: "800",
              padding: "2px",
            }}
          >
            إنشاء حساب
          </button>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            margin: "16px 0 11px",
            color: "#64748b",
            fontSize: "13px",
          }}
        >
          <div
            style={{
              flex: 1,
              height: "1px",
              background: "#263244",
            }}
          />

          <span>أو المتابعة باستخدام</span>

          <div
            style={{
              flex: 1,
              height: "1px",
              background: "#263244",
            }}
          />
        </div>

        <button
          type="button"
          onClick={() => {
            window.location.href = "/api/auth/google";
          }}

          style={{
            width: "100%",
            height: "43px",
            borderRadius: "10px",
            border: "1px solid #334155",
            background: "#ffffff",
            color: "#1f2937",
            cursor: "not-allowed",
            fontSize: "13px",
            fontWeight: "700",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "9px",
          }}
        >
          <span
            style={{
              width: "20px",
              height: "20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "17px",
              fontWeight: "900",
              fontFamily: "Arial, sans-serif",
            }}
          >
            <span style={{ color: "#4285F4" }}>G</span>
          </span>

          <span>متابعة باستخدام Google</span>
        </button>
            </>

          )}
        <div
          style={{
            textAlign: "center",
            marginTop: "15px",
            color: "#475569",
            fontSize: "10px",
          }}
        >
          Photo Editor Pro
        </div>
      </section>
    </main>
  );
}
