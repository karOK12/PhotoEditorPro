"use client";

import { useEffect, useRef, useState } from "react";

export default function ProfilePage() {
  const profileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const [profileImage, setProfileImage] = useState("/assets/images/profile.jpg");
  const [coverImage, setCoverImage] = useState("");
  const [fullName, setFullName] = useState("");
  const [nickname, setNickname] = useState("");
  const [bio, setBio] = useState("");
  const [gender, setGender] = useState("");
  const [education, setEducation] = useState("");
  const [job, setJob] = useState("");
  const [dob, setDob] = useState("");
  const [family, setFamily] = useState("");
  const [facebook, setFacebook] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [instagram, setInstagram] = useState("");
  const [email, setEmail] = useState("");
  const [currentLocation, setCurrentLocation] = useState("");
  const [originLocation, setOriginLocation] = useState("");
  const [hobbies, setHobbies] = useState<string[]>([]);

  const [showCoverMenu, setShowCoverMenu] = useState(false);
  const [coverLocked, setCoverLocked] = useState(false);
  const [coverTop, setCoverTop] = useState(0);
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef(0);

  const hobbyList = [
    "كاتب",
    "مصور فوتوغرافي",
    "السفر",
    "تصميم مونتاج",
    "مخرج سينمائي",
    "مؤلف",
    "منتج",
    "القراءة",
    "مقدم",
    "إعلامي",
  ];

  useEffect(() => {
    setFullName(localStorage.getItem("fullName") || "");
    setNickname(localStorage.getItem("nickname") || "");
    setBio(localStorage.getItem("bio") || "");
    setGender(localStorage.getItem("gender") || "");
    setEducation(localStorage.getItem("education") || "");
    setJob(localStorage.getItem("job") || "");
    setDob(localStorage.getItem("dob") || "");
    setFamily(localStorage.getItem("familyCount") || "");
    setFacebook(localStorage.getItem("facebook") || "");
    setWhatsapp(localStorage.getItem("whatsapp") || "");
    setInstagram(localStorage.getItem("instagram") || "");
    setEmail(localStorage.getItem("email") || "");
    setCurrentLocation(localStorage.getItem("currentLocation") || "");
    setOriginLocation(localStorage.getItem("originLocation") || "");

    const savedProfile = localStorage.getItem("profileImage");
    const savedCover = localStorage.getItem("profileCover");
    const savedHobbies = localStorage.getItem("hobbies");

    if (savedProfile) setProfileImage(savedProfile);
    if (savedCover) {
      setCoverImage(savedCover);
      setCoverLocked(true);
    }
    if (savedHobbies) {
      try {
        setHobbies(JSON.parse(savedHobbies));
      } catch {}
    }
  }, []);

  function save(key: string, value: string) {
    localStorage.setItem(key, value);
  }

  function handleProfileUpload(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;

    const reader = new FileReader();

    reader.onload = () => {
      const image = String(reader.result);
      setProfileImage(image);
      localStorage.setItem("profileImage", image);
    };

    reader.readAsDataURL(file);
  }

  function handleCoverUpload(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;

    const reader = new FileReader();

    reader.onload = () => {
      const image = String(reader.result);
      setCoverImage(image);
      setCoverTop(0);
      setCoverLocked(false);
    };

    reader.readAsDataURL(file);
  }

  function startDrag(clientY: number) {
    if (coverLocked) return;

    setDragging(true);
    dragStart.current = clientY - coverTop;
  }

  function moveDrag(clientY: number) {
    if (!dragging || coverLocked) return;

    setCoverTop(clientY - dragStart.current);
  }

  function finishDrag() {
    setDragging(false);
  }

  function saveCover() {
    if (!coverImage) return;

    localStorage.setItem("profileCover", coverImage);
    setCoverLocked(true);
    setShowCoverMenu(false);
  }

  function toggleHobby(hobby: string) {
    const next = hobbies.includes(hobby)
      ? hobbies.filter((item) => item !== hobby)
      : [...hobbies, hobby];

    setHobbies(next);
    localStorage.setItem("hobbies", JSON.stringify(next));
  }

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-[#0b1120] px-3 py-3 text-white"
    >
      <div className="mx-auto w-full max-w-[500px]">

        {/* الغلاف */}
        <div
          className="relative h-[240px] overflow-hidden rounded-xl bg-[#1f2937]"
          onMouseMove={(e) => moveDrag(e.clientY)}
          onMouseUp={finishDrag}
          onMouseLeave={finishDrag}
          onTouchMove={(e) => moveDrag(e.touches[0].clientY)}
          onTouchEnd={finishDrag}
        >
          {coverImage && (
            <img
              src={coverImage}
              alt="الغلاف"
              className="absolute left-0 w-full select-none object-cover"
              style={{ top: coverTop }}
              draggable={false}
              onMouseDown={(e) => startDrag(e.clientY)}
              onTouchStart={(e) => startDrag(e.touches[0].clientY)}
            />
          )}

          <button
            type="button"
            onClick={() => coverInputRef.current?.click()}
            className="absolute bottom-2 left-2 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/60"
          >
            📷
          </button>

          <input
            ref={coverInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleCoverUpload}
          />
        </div>

        {/* خيارات الغلاف */}
        <div className="relative mt-2 inline-block">
          <button
            type="button"
            onClick={() => setShowCoverMenu(!showCoverMenu)}
            className="rounded-lg border border-gray-700 bg-[#1f2937] px-3 py-1.5 text-xs"
          >
            ⚙️ عرض الخيارات ▼
          </button>

          {showCoverMenu && (
            <div className="absolute right-0 top-full z-50 mt-1 flex gap-1.5 rounded-lg border border-gray-700 bg-[#111827] p-2">
              <button
                type="button"
                onClick={() => {
                  setCoverLocked(false);
                  setCoverTop(0);
                }}
                className="rounded-md bg-amber-500 px-2.5 py-1 text-xs font-semibold text-black"
              >
                ✏️ تعديل
              </button>

              <button
                type="button"
                onClick={saveCover}
                className="rounded-md bg-green-500 px-2.5 py-1 text-xs font-semibold"
              >
                💾 حفظ
              </button>
            </div>
          )}
        </div>

        {/* البروفايل */}
        <div className="relative z-10 -mt-[55px] flex flex-col items-center">
          <div className="relative">
            <div className="h-[115px] w-[115px] overflow-hidden rounded-full border-[5px] border-[#111827] bg-[#374151] shadow-lg">
              <img
                src={profileImage}
                alt="الصورة الشخصية"
                className="h-full w-full object-cover"
              />
            </div>

            <button
              type="button"
              onClick={() => profileInputRef.current?.click()}
              className="absolute bottom-0 left-0 flex h-9 w-9 items-center justify-center rounded-full border-[3px] border-[#111827] bg-blue-600 text-2xl"
            >
              +
            </button>

            <input
              ref={profileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleProfileUpload}
            />
          </div>

          <h1 className="mt-2 text-[22px] font-bold">
            {fullName || "الملف الشخصي"}
          </h1>
        </div>

        {/* المعلومات */}
        <section className="mt-5 rounded-xl bg-[#111827] p-4">

          <h2 className="mb-4 text-lg font-bold">
            المعلومات الشخصية
          </h2>

          <label className="mb-4 block">
            <span className="text-xs text-gray-400">
              الاسم الكامل
            </span>
            <input
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                save("fullName", e.target.value);
              }}
              className="mt-1 w-full rounded-lg border border-gray-700 bg-[#1f2937] px-3 py-2 text-sm outline-none"
              placeholder="اكتب الاسم الكامل"
            />
          </label>

          <label className="mb-4 block">
            <span className="text-xs text-gray-400">
              اللقب
            </span>
            <input
              value={nickname}
              onChange={(e) => {
                setNickname(e.target.value);
                save("nickname", e.target.value);
              }}
              className="mt-1 w-full rounded-lg border border-gray-700 bg-[#1f2937] px-3 py-2 text-sm outline-none"
              placeholder="اكتب اللقب"
            />
          </label>

          <label className="mb-4 block">
            <span className="text-xs text-gray-400">
              تاريخ الميلاد
            </span>
            <input
              value={dob}
              onChange={(e) => {
                setDob(e.target.value);
                save("dob", e.target.value);
              }}
              className="mt-1 w-full rounded-lg border border-gray-700 bg-[#1f2937] px-3 py-2 text-sm outline-none"
              placeholder="مثال: 15/8/2000"
            />
          </label>

          <div className="mb-4">
            <span className="text-xs text-gray-400">
              الجنس
            </span>

            <div className="mt-2 flex gap-2">
              {["ذكر", "أنثى"].map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => {
                    setGender(item);
                    save("gender", item);
                  }}
                  className={`rounded-lg border px-4 py-2 text-sm ${
                    gender === item
                      ? "border-blue-500 bg-blue-600"
                      : "border-gray-700 bg-[#1f2937]"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* الهوايات */}
          <div className="mb-4">
            <span className="text-xs text-gray-400">
              الهوايات
            </span>

            <div className="mt-2 flex flex-wrap gap-2">
              {hobbyList.map((hobby) => (
                <button
                  key={hobby}
                  type="button"
                  onClick={() => toggleHobby(hobby)}
                  className={`rounded-full border px-3 py-1.5 text-xs ${
                    hobbies.includes(hobby)
                      ? "border-blue-500 bg-blue-600"
                      : "border-gray-700 bg-[#1f2937]"
                  }`}
                >
                  {hobby}
                </button>
              ))}
            </div>
          </div>

          <label className="mb-4 block">
            <span className="text-xs text-gray-400">
              التعليم
            </span>
            <input
              value={education}
              onChange={(e) => {
                setEducation(e.target.value);
                save("education", e.target.value);
              }}
              className="mt-1 w-full rounded-lg border border-gray-700 bg-[#1f2937] px-3 py-2 text-sm outline-none"
              placeholder="مثال: كلية"
            />
          </label>

          <label className="mb-4 block">
            <span className="text-xs text-gray-400">
              المهنة
            </span>
            <input
              value={job}
              onChange={(e) => {
                setJob(e.target.value);
                save("job", e.target.value);
              }}
              className="mt-1 w-full rounded-lg border border-gray-700 bg-[#1f2937] px-3 py-2 text-sm outline-none"
              placeholder="مثال: مبرمج"
            />
          </label>

          <h2 className="mb-3 mt-6 text-lg font-bold">
            معلومات التواصل
          </h2>

          {[
            ["فيسبوك", facebook, setFacebook, "facebook"],
            ["واتساب", whatsapp, setWhatsapp, "whatsapp"],
            ["انستكرام", instagram, setInstagram, "instagram"],
            ["البريد الإلكتروني", email, setEmail, "email"],
          ].map(([label, value, setter, key]) => (
            <label key={key as string} className="mb-3 block">
              <span className="text-xs text-gray-400">
                {label as string}
              </span>
              <input
                value={value as string}
                onChange={(e) => {
                  (setter as React.Dispatch<React.SetStateAction<string>>)(
                    e.target.value
                  );
                  save(key as string, e.target.value);
                }}
                className="mt-1 w-full rounded-lg border border-gray-700 bg-[#1f2937] px-3 py-2 text-sm outline-none"
              />
            </label>
          ))}

          <h2 className="mb-3 mt-6 text-lg font-bold">
            الموقع
          </h2>

          <label className="mb-3 block">
            <span className="text-xs text-gray-400">
              الموقع الحالي
            </span>
            <input
              value={currentLocation}
              onChange={(e) => {
                setCurrentLocation(e.target.value);
                save("currentLocation", e.target.value);
              }}
              className="mt-1 w-full rounded-lg border border-gray-700 bg-[#1f2937] px-3 py-2 text-sm outline-none"
            />
          </label>

          <label className="mb-3 block">
            <span className="text-xs text-gray-400">
              مكان المنشأ
            </span>
            <input
              value={originLocation}
              onChange={(e) => {
                setOriginLocation(e.target.value);
                save("originLocation", e.target.value);
              }}
              className="mt-1 w-full rounded-lg border border-gray-700 bg-[#1f2937] px-3 py-2 text-sm outline-none"
            />
          </label>

          <label className="mb-3 block">
            <span className="text-xs text-gray-400">
              عدد أفراد العائلة
            </span>
            <input
              type="number"
              value={family}
              onChange={(e) => {
                setFamily(e.target.value);
                save("familyCount", e.target.value);
              }}
              className="mt-1 w-full rounded-lg border border-gray-700 bg-[#1f2937] px-3 py-2 text-sm outline-none"
            />
          </label>

          <label className="block">
            <span className="text-xs text-gray-400">
              السيرة الذاتية
            </span>
            <textarea
              value={bio}
              onChange={(e) => {
                setBio(e.target.value);
                save("bio", e.target.value);
              }}
              className="mt-1 min-h-[120px] w-full resize-y rounded-lg border border-gray-700 bg-[#1f2937] px-3 py-2 text-sm outline-none"
              placeholder="اكتب نبذة عن نفسك..."
            />
          </label>

        </section>
      </div>
    </main>
  );
}
