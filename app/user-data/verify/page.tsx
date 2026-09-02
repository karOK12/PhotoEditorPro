"use client";

import { FormEvent, useEffect, useState } from "react";

export default function VerifyOtpPage() {
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [email, setEmail] = useState("");

  useEffect(() => {
    const savedEmail =
      sessionStorage.getItem("photoEditorProOtpEmail") || "";

    setEmail(savedEmail);
  }, []);

  async function handleVerify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage("");
    setError("");

    if (!/^\d{6}$/.test(otp)) {
      setError("أدخل رمز التحقق المكوّن من 6 أرقام");
      return;
    }

    if (!email) {
      setError("لم يتم العثور على البريد الإلكتروني");
      return;
    }

    setIsVerifying(true);

    try {
      const response = await fetch("/api/otp/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          otp,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "رمز التحقق غير صحيح"
        );
      }

      /*
       * الخادم أكد أن البريد تم التحقق منه.
       * نحافظ على بيانات التسجيل الموجودة في sessionStorage
       * لأن صفحة التسجيل تحتاجها بعد العودة إليها.
       */
      localStorage.setItem(
        "photoEditorProOtpVerified",
        "true"
      );

      sessionStorage.setItem(
        "photoEditorProVerifiedRegistration",
        JSON.stringify(result.registration || {})
      );

      sessionStorage.setItem(
        "photoEditorProOtpEmail",
        email
      );

      setMessage(
        result.message || "تم التحقق من البريد الإلكتروني بنجاح"
      );

      /*
       * العودة إلى نموذج التسجيل لإكمال إنشاء الحساب.
       */
      window.location.href = "/user-data";
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "حدث خطأ أثناء التحقق"
      );
    } finally {
      setIsVerifying(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#0b0b0f] px-4 py-8 text-white sm:px-6">
      <div className="mx-auto flex min-h-screen w-full max-w-md items-center justify-center">
        <section className="w-full rounded-3xl border border-white/10 bg-[#15151b] p-6 shadow-2xl sm:p-8">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-xl font-black text-black">
              PE
            </div>

            <h1 className="text-2xl font-bold">
              التحقق من البريد الإلكتروني
            </h1>

            <p className="mt-3 text-sm text-gray-400">
              أدخل رمز التحقق المرسل إلى بريدك الإلكتروني
            </p>

            {email && (
              <p className="mt-2 break-all text-sm text-gray-300">
                {email}
              </p>
            )}
          </div>

          {error && (
            <div
              role="alert"
              className="mb-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-center text-sm text-red-300"
            >
              {error}
            </div>
          )}

          {message && (
            <div
              role="status"
              className="mb-5 rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-3 text-center text-sm text-green-300"
            >
              {message}
            </div>
          )}

          <form onSubmit={handleVerify} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-200">
                رمز التحقق
              </label>

              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                value={otp}
                onChange={(e) =>
                  setOtp(
                    e.target.value
                      .replace(/\D/g, "")
                      .slice(0, 6)
                  )
                }
                placeholder="000000"
                className="w-full rounded-xl border border-white/10 bg-[#0e0e13] px-4 py-4 text-center text-2xl font-bold tracking-[0.5em] text-white outline-none placeholder:text-gray-700 focus:border-white/30"
              />
            </div>

            <button
              type="submit"
              disabled={isVerifying}
              className="w-full rounded-xl bg-white py-3.5 text-sm font-bold text-black transition hover:bg-gray-200 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isVerifying
                ? "جاري التحقق..."
                : "تأكيد رمز التحقق"}
            </button>


          </form>
        </section>
      </div>
    </main>
  );
}
