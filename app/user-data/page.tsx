"use client";

import { useEffect, useRef, useState } from "react";

type RegistrationData = {
  fullName?: string;
  lastName?: string;
  birthDay?: string;
  birthMonth?: string;
  birthYear?: string;
  country?: string;
  phone?: string;
  city?: string;
  state?: string;
  zip?: string;
  idType?: string;
  idName?: string;
  idNumber?: string;
  email?: string;
  password?: string;
  profileImage?: string | null;
  idImage?: string | null;
};

export default function UserDataPage() {
  const profileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [idImage, setIdImage] = useState<string | null>(null);

  const [birthDay, setBirthDay] = useState("");
  const [birthMonth, setBirthMonth] = useState("");
  const [birthYear, setBirthYear] = useState("");

  const [country, setCountry] = useState("");
  const [idType, setIdType] = useState("");

  const [showWarning, setShowWarning] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [serverMessage, setServerMessage] = useState("");
  const [serverError, setServerError] = useState("");

  const [isVerified, setIsVerified] = useState(false);
  const [savedRegistration, setSavedRegistration] =
    useState<RegistrationData | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const months = [
    "يناير",
    "فبراير",
    "مارس",
    "أبريل",
    "مايو",
    "يونيو",
    "يوليو",
    "أغسطس",
    "سبتمبر",
    "أكتوبر",
    "نوفمبر",
    "ديسمبر",
  ];

  const countries = [
    { code: "+964", name: "العراق" },
    { code: "+20", name: "مصر" },
    { code: "+966", name: "السعودية" },
    { code: "+971", name: "الإمارات" },
    { code: "+965", name: "الكويت" },
    { code: "+974", name: "قطر" },
    { code: "+961", name: "لبنان" },
    { code: "+962", name: "الأردن" },
    { code: "+963", name: "سوريا" },
    { code: "+212", name: "المغرب" },
    { code: "+216", name: "تونس" },
    { code: "+967", name: "اليمن" },
  ];

  /*
   * استرجاع بيانات التسجيل بعد الرجوع من صفحة OTP.
   */
  useEffect(() => {
    try {
      const saved =
        sessionStorage.getItem("photoEditorProRegistration");

      const verifiedData =
        sessionStorage.getItem("photoEditorProVerifiedRegistration");

      const otpVerified =
        sessionStorage.getItem("photoEditorProOtpVerified") === "true";

      const originalData: RegistrationData = saved
        ? JSON.parse(saved)
        : {};

      const serverData: RegistrationData = verifiedData
        ? JSON.parse(verifiedData)
        : {};

      /*
       * بيانات الخادم لها الأولوية،
       * لكن كلمة المرور تبقى من بيانات التسجيل الأصلية.
       */
      const merged: RegistrationData = {
        ...originalData,
        ...serverData,
        password: originalData.password,
      };

      if (merged.email) {
        setSavedRegistration(merged);
      }

      if (otpVerified) {
        setIsVerified(true);
      }

      if (merged.profileImage) {
        setProfileImage(merged.profileImage);
      }

      if (merged.idImage) {
        setIdImage(merged.idImage);
      }

      if (merged.birthDay) {
        setBirthDay(String(merged.birthDay));
      }

      if (merged.birthMonth) {
        setBirthMonth(String(merged.birthMonth));
      }

      if (merged.birthYear) {
        setBirthYear(String(merged.birthYear));
      }

      if (merged.country) {
        setCountry(String(merged.country));
      }

      if (merged.idType) {
        setIdType(String(merged.idType));
      }

      setIsLoaded(true);
    } catch (error) {
      console.error("Registration restore error:", error);
      setIsLoaded(true);
    }
  }, []);

  /*
   * تعبئة الحقول النصية المحفوظة تلقائيًا.
   * الحقول نفسها Uncontrolled، لذلك نضع القيم مباشرة داخلها.
   */
  useEffect(() => {
    if (!isLoaded || !savedRegistration || !formRef.current) {
      return;
    }

    const form = formRef.current;

    const setValue = (name: string, value?: string) => {
      const element = form.elements.namedItem(name);

      if (
        element instanceof HTMLInputElement ||
        element instanceof HTMLTextAreaElement
      ) {
        element.value = value ?? "";
      }
    };

    setValue("fullName", savedRegistration.fullName);
    setValue("lastName", savedRegistration.lastName);
    setValue("phone", savedRegistration.phone);
    setValue("city", savedRegistration.city);
    setValue("state", savedRegistration.state);
    setValue("zip", savedRegistration.zip);
    setValue("idName", savedRegistration.idName);
    setValue("idNumber", savedRegistration.idNumber);
    setValue("email", savedRegistration.email);
    setValue("password", savedRegistration.password);
    setValue("confirmPassword", savedRegistration.password);
  }, [isLoaded, savedRegistration, idType]);

  async function compressImage(
    file: File,
    maxWidth: number,
    maxHeight: number,
    quality: number
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        const image = new Image();

        image.onload = () => {
          let width = image.width;
          let height = image.height;

          const scale = Math.min(
            1,
            maxWidth / width,
            maxHeight / height
          );

          width = Math.max(1, Math.round(width * scale));
          height = Math.max(1, Math.round(height * scale));

          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;

          const context = canvas.getContext("2d");

          if (!context) {
            reject(new Error("تعذر معالجة الصورة"));
            return;
          }

          context.drawImage(image, 0, 0, width, height);

          const result = canvas.toDataURL("image/jpeg", quality);

          URL.revokeObjectURL(image.src);
          resolve(result);
        };

        image.onerror = () => {
          reject(new Error("تعذر قراءة الصورة"));
        };

        image.src = reader.result as string;
      };

      reader.onerror = () => {
        reject(new Error("تعذر قراءة ملف الصورة"));
      };

      reader.readAsDataURL(file);
    });
  }

  async function handleProfileImage(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("يرجى اختيار صورة صالحة.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("حجم صورة الملف الشخصي يجب ألا يتجاوز 5 ميجابايت.");
      return;
    }

    try {
      const compressed = await compressImage(
        file,
        900,
        900,
        0.65
      );

      setProfileImage(compressed);
    } catch (error) {
      console.error("Profile image compression error:", error);
      alert("تعذر معالجة صورة الملف الشخصي.");
    }
  }

  async function handleIdImage(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("يرجى اختيار صورة صالحة.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert("حجم صورة الهوية يجب ألا يتجاوز 10 ميجابايت.");
      return;
    }

    try {
      const compressed = await compressImage(
        file,
        1200,
        1200,
        0.65
      );

      setIdImage(compressed);
    } catch (error) {
      console.error("ID image compression error:", error);
      alert("تعذر معالجة صورة الهوية.");
    }
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (isSendingOtp) return;

    const form = event.currentTarget;
    const formData = new FormData(form);

    const fullName = String(
      formData.get("fullName") || ""
    ).trim();

    const lastName = String(
      formData.get("lastName") || ""
    ).trim();

    const phone = String(
      formData.get("phone") || ""
    ).trim();

    const city = String(
      formData.get("city") || ""
    ).trim();

    const state = String(
      formData.get("state") || ""
    ).trim();

    const email = String(
      formData.get("email") || ""
    ).trim().toLowerCase();

    const idName = String(
      formData.get("idName") || ""
    ).trim();

    const idNumber = String(
      formData.get("idNumber") || ""
    ).trim();

    const zip = String(
      formData.get("zip") || ""
    ).trim();

    const password = String(
      formData.get("password") || ""
    );

    const confirmPassword = String(
      formData.get("confirmPassword") || ""
    );

    /*
     * إذا تم التحقق مسبقًا:
     * لا نرسل OTP مرة ثانية.
     * نطلب من الخادم إكمال إنشاء الحساب.
     */
    if (isVerified) {
      if (!email) {
        setServerError("لم يتم العثور على البريد الإلكتروني");
        return;
      }

      setShowWarning(false);
      setServerMessage("");
      setServerError("");
      setIsSendingOtp(true);

      try {
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
          }),
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.message || "تعذر إنشاء الحساب"
          );
        }

        sessionStorage.removeItem(
          "photoEditorProRegistration"
        );

        sessionStorage.removeItem(
          "photoEditorProVerifiedRegistration"
        );

        sessionStorage.removeItem(
          "photoEditorProOtpEmail"
        );

        sessionStorage.removeItem(
          "photoEditorProOtpVerified"
        );

        setServerMessage(
          result.message || "تم إنشاء حسابك بنجاح"
        );

        setTimeout(() => {
          window.location.href = "/";
        }, 1000);
      } catch (error) {
        console.error("Final registration error:", error);

        setServerError(
          error instanceof Error
            ? error.message
            : "حدث خطأ أثناء إنشاء الحساب"
        );
      } finally {
        setIsSendingOtp(false);
      }

      return;
    }

    /*
     * التسجيل الأولي قبل التحقق.
     */
    if (password.length < 8) {
      setShowWarning(true);
      setServerMessage("");
      setServerError(
        "كلمة المرور يجب أن تتكون من 8 أحرف أو أرقام على الأقل"
      );
      return;
    }

    if (password !== confirmPassword) {
      setShowWarning(true);
      setServerMessage("");
      setServerError("كلمتا المرور غير متطابقتين");
      return;
    }

    const hasMissingData =
      !profileImage ||
      !fullName ||
      !lastName ||
      !birthDay ||
      !birthMonth ||
      !birthYear ||
      !country ||
      !phone ||
      !city ||
      !state ||
      !idType ||
      !idName ||
      !idNumber ||
      !idImage ||
      !email;

    if (hasMissingData) {
      setShowWarning(true);
      setServerMessage("");
      setServerError("");
      return;
    }

    setShowWarning(false);
    setServerMessage("");
    setServerError("");
    setIsSendingOtp(true);

    try {
      const registrationData = {
        fullName,
        lastName,
        birthDay,
        birthMonth,
        birthYear,
        country,
        phone,
        city,
        state,
        zip,
        idType,
        idName,
        idNumber,
        email,
        password,
        profileImage,
        idImage,
      };

      /*
       * أولًا نحفظ البيانات في pending_registrations.
       */
      const pendingResponse = await fetch(
        "/api/auth/register/pending",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(registrationData),
        }
      );

      const pendingResult = await pendingResponse.json();

      if (
        !pendingResponse.ok ||
        !pendingResult.success
      ) {
        throw new Error(
          pendingResult.message ||
            "تعذر حفظ بيانات التسجيل"
        );
      }

      /*
       * بعدها نرسل OTP.
       */
      const response = await fetch("/api/otp/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            "تعذر إرسال رمز التحقق"
        );
      }

      sessionStorage.setItem(
        "photoEditorProRegistration",
        JSON.stringify(registrationData)
      );

      sessionStorage.setItem(
        "photoEditorProOtpEmail",
        email
      );

      sessionStorage.removeItem(
        "photoEditorProOtpVerified"
      );

      sessionStorage.removeItem(
        "photoEditorProVerifiedRegistration"
      );

      setServerMessage(
        "تم إرسال رمز التحقق إلى بريدك الإلكتروني"
      );

      window.location.href =
        "/user-data/verify?email=" +
        encodeURIComponent(email);
    } catch (error) {
      console.error("OTP send error:", error);

      setServerError(
        error instanceof Error
          ? error.message
          : "حدث خطأ أثناء إرسال رمز التحقق"
      );
    } finally {
      setIsSendingOtp(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#0b0b0f] px-4 py-8 text-white sm:px-6">
      <div className="mx-auto w-full max-w-2xl">

        {/* البطاقة */}
        <section className="rounded-3xl border border-white/10 bg-[#15151b] p-5 shadow-2xl sm:p-8">

          {/* تنبيه النقص */}
          {showWarning && (
            <div
              role="alert"
              className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-center text-sm font-medium text-red-300"
            >
              أكمل بياناتك الشخصية
            </div>
          )}

          {serverError && (
            <div
              role="alert"
              className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-center text-sm font-medium text-red-300"
            >
              {serverError}
            </div>
          )}

          {serverMessage && (
            <div
              role="status"
              className="mb-6 rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-3 text-center text-sm font-medium text-green-300"
            >
              {serverMessage}
            </div>
          )}

          {/* صورة الملف الشخصي */}
          <div className="mb-8 flex flex-col items-center">

            <button
              type="button"
              onClick={() => profileInputRef.current?.click()}
              className="group relative flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-[#0e0e13] shadow-lg transition hover:scale-[1.03]"
            >
              {profileImage ? (
                <img
                  src={profileImage}
                  alt="صورة الملف الشخصي"
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-4xl text-gray-500">
                  👤
                </span>
              )}

              <span className="absolute bottom-1 left-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#15151b] bg-white text-lg font-bold text-black">
                +
              </span>
            </button>

            <input
              ref={profileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              onChange={handleProfileImage}
              className="hidden"
            />

            <p className="mt-3 text-xs text-gray-500">
              إضافة صورة الملف الشخصي
            </p>
          </div>

          <form
            ref={formRef}
            onSubmit={handleSubmit}
            className="space-y-5"
          >

            {/* الاسم */}
            <div className="grid gap-4 sm:grid-cols-2">

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-200">
                  الاسم الكامل
                </label>

                <input
                  type="text"
                  name="fullName"
                  placeholder="أدخل اسمك الكامل"
                  autoComplete="name"
                  className="w-full rounded-xl border border-white/10 bg-[#0e0e13] px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-white/30"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-200">
                  اللقب
                </label>

                <input
                  type="text"
                  name="lastName"
                  placeholder="أدخل اللقب"
                  autoComplete="family-name"
                  className="w-full rounded-xl border border-white/10 bg-[#0e0e13] px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-white/30"
                />
              </div>

            </div>

            {/* تاريخ الميلاد */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-200">
                تاريخ الميلاد
              </label>

              <div className="grid grid-cols-3 gap-3">

                <select
                  name="birthDay"
                  value={birthDay}
                  onChange={(e) =>
                    setBirthDay(e.target.value)
                  }
                  className="rounded-xl border border-white/10 bg-[#0e0e13] px-3 py-3 text-sm text-white outline-none focus:border-white/30"
                >
                  <option value="">اليوم</option>

                  {Array.from(
                    { length: 31 },
                    (_, index) => (
                      <option
                        key={index + 1}
                        value={index + 1}
                      >
                        {index + 1}
                      </option>
                    )
                  )}
                </select>

                <select
                  name="birthMonth"
                  value={birthMonth}
                  onChange={(e) =>
                    setBirthMonth(e.target.value)
                  }
                  className="rounded-xl border border-white/10 bg-[#0e0e13] px-3 py-3 text-sm text-white outline-none focus:border-white/30"
                >
                  <option value="">الشهر</option>

                  {months.map((month, index) => (
                    <option
                      key={month}
                      value={index + 1}
                    >
                      {month}
                    </option>
                  ))}
                </select>

                <select
                  name="birthYear"
                  value={birthYear}
                  onChange={(e) =>
                    setBirthYear(e.target.value)
                  }
                  className="rounded-xl border border-white/10 bg-[#0e0e13] px-3 py-3 text-sm text-white outline-none focus:border-white/30"
                >
                  <option value="">السنة</option>

                  {Array.from(
                    { length: 71 },
                    (_, index) => {
                      const year = 2010 - index;

                      return (
                        <option
                          key={year}
                          value={year}
                        >
                          {year}
                        </option>
                      );
                    }
                  )}
                </select>

              </div>
            </div>

            {/* الهاتف */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-200">
                رقم الهاتف
              </label>

              <div className="flex gap-3">

                <select
                  name="country"
                  value={country}
                  onChange={(e) =>
                    setCountry(e.target.value)
                  }
                  className="w-[38%] rounded-xl border border-white/10 bg-[#0e0e13] px-3 py-3 text-sm text-white outline-none focus:border-white/30"
                >
                  <option value="">الدولة</option>

                  {countries.map((item) => (
                    <option
                      key={item.code}
                      value={item.code}
                    >
                      {item.name} ({item.code})
                    </option>
                  ))}
                </select>

                <input
                  type="tel"
                  name="phone"
                  placeholder="رقم الهاتف"
                  autoComplete="tel"
                  className="flex-1 rounded-xl border border-white/10 bg-[#0e0e13] px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-white/30"
                />

              </div>
            </div>

            {/* الموقع */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-200">
                الموقع
              </label>

              <div className="grid gap-3 sm:grid-cols-3">

                <input
                  type="text"
                  name="city"
                  placeholder="المدينة"
                  className="rounded-xl border border-white/10 bg-[#0e0e13] px-4 py-3 text-sm text-white outline-none placeholder:text-gray-600 focus:border-white/30"
                />

                <input
                  type="text"
                  name="state"
                  placeholder="المحافظة"
                  className="rounded-xl border border-white/10 bg-[#0e0e13] px-4 py-3 text-sm text-white outline-none placeholder:text-gray-600 focus:border-white/30"
                />

                <input
                  type="text"
                  name="zip"
                  placeholder="الرمز البريدي"
                  className="rounded-xl border border-white/10 bg-[#0e0e13] px-4 py-3 text-sm text-white outline-none placeholder:text-gray-600 focus:border-white/30"
                />

              </div>
            </div>

            {/* كلمة المرور */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-200">
                كلمة المرور
              </label>

              <input
                type="password"
                name="password"
                placeholder="أدخل كلمة المرور"
                autoComplete="new-password"
                minLength={8}
                className="w-full rounded-xl border border-white/10 bg-[#0e0e13] px-4 py-3.5 text-base text-white outline-none transition placeholder:text-gray-600 focus:border-white/30"
              />

              <p className="mt-2 text-xs text-gray-500">
                يجب أن تتكون كلمة المرور من 8 أحرف أو أرقام على الأقل.
              </p>
            </div>

            {/* تأكيد كلمة المرور */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-200">
                تأكيد كلمة المرور
              </label>

              <input
                type="password"
                name="confirmPassword"
                placeholder="أعد إدخال كلمة المرور"
                autoComplete="new-password"
                minLength={8}
                className="w-full rounded-xl border border-white/10 bg-[#0e0e13] px-4 py-3.5 text-base text-white outline-none transition placeholder:text-gray-600 focus:border-white/30"
              />
            </div>

            {/* الهوية */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-200">
                بيانات الهوية
              </label>

              <select
                name="idType"
                value={idType}
                onChange={(e) =>
                  setIdType(e.target.value)
                }
                className="mb-3 w-full rounded-xl border border-white/10 bg-[#0e0e13] px-4 py-3 text-sm text-white outline-none focus:border-white/30"
              >
                <option value="">
                  اختر نوع الهوية
                </option>

                <option value="national">
                  البطاقة الوطنية
                </option>

                <option value="passport">
                  جواز السفر
                </option>

                <option value="license">
                  رخصة القيادة
                </option>
              </select>

              {idType && (
                <div className="grid gap-3 sm:grid-cols-2">

                  <input
                    type="text"
                    name="idName"
                    placeholder="اسم صاحب الهوية"
                    className="w-full min-h-[58px] rounded-xl border border-white/10 bg-[#0e0e13] px-4 py-4 text-base text-white outline-none transition placeholder:text-gray-600 focus:border-white/30 focus:ring-1 focus:ring-white/20"
                  />

                  <input
                    type="text"
                    name="idNumber"
                    placeholder="رقم الهوية"
                    className="w-full min-h-[58px] rounded-xl border border-white/10 bg-[#0e0e13] px-4 py-4 text-base text-white outline-none transition placeholder:text-gray-600 focus:border-white/30 focus:ring-1 focus:ring-white/20"
                  />

                </div>
              )}
            </div>

            {/* رفع الهوية */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-200">
                صورة الهوية
              </label>

              <label className="flex cursor-pointer items-center justify-between rounded-xl border border-dashed border-white/15 bg-[#0e0e13] px-4 py-4 transition hover:border-white/30">

                <span className="text-sm text-gray-400">
                  {idImage
                    ? "✓ تم اختيار صورة الهوية"
                    : "اختر صورة الهوية"}
                </span>

                <span className="rounded-lg bg-white px-3 py-2 text-xs font-bold text-black">
                  رفع صورة
                </span>

                <input
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  onChange={handleIdImage}
                  className="hidden"
                />

              </label>
            </div>

            {/* البريد الإلكتروني */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-200">
                البريد الإلكتروني
              </label>

              <input
                type="email"
                name="email"
                placeholder="أدخل بريدك الإلكتروني"
                autoComplete="email"
                className="w-full rounded-xl border border-white/10 bg-[#0e0e13] px-4 py-3 text-sm text-white outline-none placeholder:text-gray-600"
              />

              <p className="mt-2 text-xs text-gray-500">
                سيُستخدم البريد الإلكتروني للتحقق من الحساب.
              </p>
            </div>

            {/* زر التسجيل */}
            <button
              type="submit"
              disabled={isSendingOtp}
              className="w-full rounded-xl bg-white py-3.5 text-sm font-bold text-black transition hover:bg-gray-200 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSendingOtp
                ? isVerified
                  ? "جاري إنشاء الحساب..."
                  : "جاري إرسال كود التحقق..."
                : isVerified
                  ? "إنشاء الحساب"
                  : "إرسال كود التحقق"}
            </button>

          </form>
        </section>

      </div>
    </main>
  );
}
