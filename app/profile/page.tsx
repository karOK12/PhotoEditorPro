"use client";

import { useRef, useState, useEffect } from "react";

export default function Page() {

  const imgRef = useRef<HTMLImageElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);


useEffect(() => {
  setFacebook(localStorage.getItem("facebook") || "");
  setWhatsapp(localStorage.getItem("whatsapp") || "");
  setInstagram(localStorage.getItem("instagram") || "");
  setEmail(localStorage.getItem("email") || "");

  setCurrentLocation(localStorage.getItem("currentLocation") || "");
  setOriginLocation(localStorage.getItem("originLocation") || "");

  setFamilyCount(localStorage.getItem("familyCount") || "");
  setBio(localStorage.getItem("bio") || "");

  // 👇 أضفهما هنا
  setFullName(localStorage.getItem("fullName") || "");
  setNickname(localStorage.getItem("nickname") || "");

  const savedImage = localStorage.getItem("profileImage");

if (savedImage) {
  setProfileLoading(true);

  const img = new Image();

  img.onload = () => {
    setProfileImage(savedImage);

    setProfileLoading(false);
  };

  img.onerror = () => {
    setProfileLoading(false);
  };

  img.src = savedImage;
}
  const savedHobbies = localStorage.getItem("hobbies");
  if (savedHobbies) {
    try {
      setHobbies(JSON.parse(savedHobbies));
    } catch {}
  }

  setEducation(localStorage.getItem("education") || "");
  setJob(localStorage.getItem("job") || "");
  setGender(localStorage.getItem("gender") || "");

  const savedDob = localStorage.getItem("dob");
  if (savedDob) {
    const parts = savedDob.split("/");
    if (parts.length === 3) {
      setDay(parts[0]);
      setMonth(parts[1]);
      setYear(parts[2]);
    }
  }
}, []);



  // نتائج البحث للمواقع
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const searchLocation = async (
    value: string,
    setter: any
  ) => {

    setter(value);

    if (value.length < 2) {
      setSearchResults([]);
      return;
    }

    try {

      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${value}`
      );

      const data = await res.json();

      setSearchResults(data);

    } catch {

      setSearchResults([]);

    }
  };
  
  

  const isDragging = useRef(false);
  const startY = useRef(0);
  const currentTop = useRef(0);
  const cropTop = useRef(0);

  // 🎛️ menu
  const [showMenu, setShowMenu] = useState(false);
  const [locked, setLocked] = useState(false);

  // 📅 DOB
  const [openDob, setOpenDob] = useState(false);
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");


// 🧑‍⚧️ gender 👈 هنا تضيفه
const [openGender, setOpenGender] = useState(false);
const [gender, setGender] = useState("");


// 🎓 education 👇 هنا بالضبط
const [openEdu, setOpenEdu] = useState(false);
const [education, setEducation] = useState("");


// 💼 job 👇 هنا
const [openJob, setOpenJob] = useState(false);
const [job, setJob] = useState("");


// 📞 contact
const [openContact, setOpenContact] = useState("");

const [facebook, setFacebook] = useState("");
const [whatsapp, setWhatsapp] = useState("");
const [instagram, setInstagram] = useState("");
const [email, setEmail] = useState("");

// 🌍 location
const [openLocation, setOpenLocation] = useState("");

const [currentLocation, setCurrentLocation] = useState("");
const [originLocation, setOriginLocation] = useState("");

// 👨‍👩‍👧‍👦 عدد أفراد العائلة
const [openFamily, setOpenFamily] = useState(false);
const [familyCount, setFamilyCount] = useState("");

// 📝 السيرة الذاتية
const [openBio, setOpenBio] = useState(false);
const [bio, setBio] = useState("");

// 🎯 hobbies
const [openHobbies, setOpenHobbies] = useState(false);
const [hobbies, setHobbies] = useState<string[]>([]);

// 🖼️ profile image
const [profileImage, setProfileImage] = useState("/assets/images/profile.jpg");


// 👤 الاسم الكامل
const [openFullName, setOpenFullName] = useState(false);
const [fullName, setFullName] = useState("");

// 🏷️ اللقب
const [openNickname, setOpenNickname] = useState(false);
const [nickname, setNickname] = useState("");



const [profileLoading, setProfileLoading] = useState(false);

const [profileDone, setProfileDone] = useState(false);

const [profileProgress, setProfileProgress] = useState(0);



const profileUpload = async (
  e: React.ChangeEvent<HTMLInputElement>
) => {

  const file = e.target.files?.[0];

  if (!file) return;

  const reader = new FileReader();

  reader.onload = async () => {

    // ✅ بداية التحميل
    setProfileLoading(true);

    setProfileDone(false);

    setProfileProgress(0);

    const fakeLoader = setInterval(() => {

      setProfileProgress((prev) => {

        if (prev >= 90) return prev;

        const diff = 90 - prev;

        return prev + diff * 0.12;

      });

    }, 120);

    try {

      const image = reader.result as string;

      const res = await fetch("/api/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image,
        }),
      });

      const data = await res.json();

      clearInterval(fakeLoader);

      setProfileProgress(100);

      if (!data?.ok || !data?.url) {

        alert("فشل رفع الصورة");

        return;

      }

      setProfileImage(data.url);

      localStorage.setItem(
        "profileImage",
        data.url
      );

      window.dispatchEvent(
        new Event("profileUpdated")
      );

      setProfileDone(true);

      setTimeout(() => {

        setProfileLoading(false);

        setProfileDone(false);

        setProfileProgress(0);

      }, 1200);

    } catch (err) {

      console.error(err);

      alert("حدث خطأ");

      setProfileLoading(false);

      setProfileProgress(0);

    }

  };

  reader.readAsDataURL(file);

};





function moveImage(y: number) {

  if (!imgRef.current || !frameRef.current) return;

  if (locked) return;

  let top = y - startY.current;

  if (top > 0) top = 0;

  const min =
  frameRef.current!.offsetHeight -
  imgRef.current!.offsetHeight;

  if (top < min) top = min;

  imgRef.current.style.top = top + "px";

  currentTop.current = top;

  cropTop.current = top;

}





const upload = (e: any) => {

  const file = e.target.files?.[0];

  if (!file) return;

  setLocked(false);

  const reader = new FileReader();

  reader.onload = () => {

    const frame = frameRef.current;
    const img = imgRef.current;

    if (!frame || !img) return;

    img.src = reader.result as string;

    img.style.top = "0px";

    img.style.left = "0px";

    img.style.display = "block";

    currentTop.current = 0;

    cropTop.current = 0;

    img.onload = () => {

      if (!frameRef.current || !imgRef.current)
        return;

      const ratio =
        frameRef.current.offsetWidth /
        imgRef.current.naturalWidth;

      imgRef.current.style.width =
        frameRef.current.offsetWidth + "px";

      imgRef.current.style.height =
        imgRef.current.naturalHeight *
        ratio +
        "px";

    };

  };

  reader.readAsDataURL(file);

};





 const [loading, setLoading] = useState(false);
const [progress, setProgress] = useState(0);

const saveCover = async () => {

  const frame = frameRef.current;
  const img = imgRef.current;

  if (!img || !frame) return;

  try {

    setLoading(true);

    setProgress(0);

    const fakeLoader = setInterval(() => {

      setProgress((prev) => {

        if (prev >= 90) return prev;

        const diff = 90 - prev;

        return prev + diff * 0.12;

      });

    }, 120);

    const canvas = document.createElement("canvas");

    canvas.width = frame.offsetWidth;

    canvas.height = frame.offsetHeight;

    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    const scale =
      img.offsetWidth /
      img.naturalWidth;

    const sy = -cropTop.current / scale;

    ctx.drawImage(
      img,
      0,
      sy,
      img.naturalWidth,
      frame.offsetHeight / scale,
      0,
      0,
      canvas.width,
      canvas.height
    );

    const finalImage =
      canvas.toDataURL("image/jpeg", 0.6);

    const res = await fetch("/api/upload", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        image: finalImage
      }),
    });

    const data = await res.json();

    clearInterval(fakeLoader);

    if (!data?.ok || !data?.url) {

      alert("فشل رفع الغلاف");

      return;

    }

    setProgress(100);

    localStorage.setItem(
      "profileCover",
      data.url
    );

    setLocked(true);

    setShowMenu(false);

    setTimeout(() => {

      setLoading(false);

      setProgress(0);

      alert("تم حفظ الغلاف ✔");

    }, 400);

  } catch (err) {

    console.error(err);

    alert("حدث خطأ أثناء الحفظ");

    setLoading(false);

  }

};

  const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  marginTop: "6px",
  borderRadius: "8px",
  border: "1px solid #374151",
  background: "#1f2937",
  color: "white",
  fontSize: "14px",
  outline: "none",
};

  const textareaStyle={
    ...inputStyle,
    height:"100px"
  };

  return (

<div
style={{
padding:"12px",
maxWidth:"500px",
margin:"0 auto",
color:"white"
}}
>

{/* COVER */}

<div
ref={frameRef}
style={{
width:"100%",
height:"240px",
position:"relative",
overflow:"hidden",
background:"#1f2937",
borderRadius:"12px",
touchAction:"none"
}}

onMouseMove={(e)=>{
if(!isDragging.current)return;
moveImage(e.clientY);
}}

onMouseUp={()=>
isDragging.current=false
}

onMouseLeave={()=>
isDragging.current=false
}

onTouchMove={(e)=>{
if(!isDragging.current)return;

moveImage(
e.touches[0].clientY
);

}}

onTouchEnd={()=>
isDragging.current=false
}
>
{/* ⬇️ loading overlay هنا */}
{loading && (
  <div
    style={{
      position: "absolute",
      inset: 0,
      background: "rgba(0,0,0,.55)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 9999
    }}
  >

    <p style={{ color: "#fff", marginTop: 12 }}>
      جارِ رفع الغلاف...
    </p>

  </div>
)}

<img
ref={imgRef}
draggable={false}
style={{
position:"absolute",
top:0,
left:0,
width:"100%",
display:"block",
userSelect:"none",
cursor:"grab"
}}

onMouseDown={(e)=>{

if(locked)return;

isDragging.current=true;

startY.current=
e.clientY-
currentTop.current;

}}

onTouchStart={(e)=>{

if(locked)return;

isDragging.current=true;

startY.current=
e.touches[0].clientY-
currentTop.current;

}}
/>

<label
style={{
position:"absolute",
right:10,
bottom:10,
background:"rgba(0,0,0,.6)",
width:36,
height:36,
borderRadius:"50%",
display:"flex",
alignItems:"center",
justifyContent:"center",
cursor:"pointer"
}}
>

📷

<input
type="file"
hidden
onChange={upload}
/>

</label>

</div>





{/* ACTIONS */}

<div
style={{
marginTop:8,
position:"relative",
display:"inline-block",
zIndex:99999
}}
>

<button
type="button"
onMouseDown={(e)=>e.stopPropagation()}
onTouchStart={(e)=>e.stopPropagation()}
onClick={(e)=>{
  e.stopPropagation();
  setShowMenu(prev => !prev);
}}
style={{
  padding:"6px 10px",
  borderRadius:"8px",
  background:"#1f2937",
  color:"#fff",
  border:"1px solid #374151",
  cursor:"pointer",
  fontSize:"12px",
  display:"inline-flex",
  alignItems:"center",
  gap:"5px",
  position:"relative",
  zIndex:99999
}}
>
⚙️ عرض الخيارات {showMenu ? "▲" : "▼"}
</button>

{showMenu && (

<div
style={{
position:"absolute",
top:"calc(100% + 5px)",
left:0,
display:"flex",
gap:6,
background:"#111827",
padding:"7px",
borderRadius:"9px",
border:"1px solid #374151",
zIndex:99999,
boxShadow:"0 4px 12px rgba(0,0,0,.35)"
}}
>

<button
type="button"
onMouseDown={(e)=>e.stopPropagation()}
onTouchStart={(e)=>e.stopPropagation()}
onClick={(e)=>{
  e.stopPropagation();

  if(!imgRef.current) return;

  imgRef.current.style.top="0px";

  currentTop.current=0;
  cropTop.current=0;

  setLocked(false);
}}
style={{
padding:"5px 10px",
borderRadius:"7px",
background:"#f59e0b",
color:"#000",
border:"none",
cursor:"pointer",
fontWeight:"600",
fontSize:"11px"
}}
>
✏️ تعديل
</button>

<button
type="button"
onMouseDown={(e)=>e.stopPropagation()}
onTouchStart={(e)=>e.stopPropagation()}
onClick={(e)=>{
  e.stopPropagation();
  saveCover();
}}
style={{
padding:"5px 10px",
borderRadius:"7px",
background:"#22c55e",
color:"#fff",
border:"none",
cursor:"pointer",
fontWeight:"600",
fontSize:"11px"
}}
>
💾 حفظ
</button>

</div>

)}

</div>





{profileLoading && (

  <div
    style={{
      position:"fixed",
      top:0,
      left:0,
      width:"100%",
      height:"4px",
      background:"rgba(255,255,255,.12)",
      zIndex:999999
    }}
  >

    <div
      style={{
        height:"100%",
        width:`${profileProgress}%`,
        background:"#22c55e",
        transition:"width .2s linear"
      }}
    />

  </div>

)}

{/* PROFILE IMAGE */}

<div
style={{
display:"flex",
flexDirection:"column",
alignItems:"center",
marginTop:"-55px",
position:"relative",
zIndex:10
}}
>

<div
style={{
position:"relative"
}}
>

<div
style={{
width:"115px",
height:"115px",
borderRadius:"50%",
overflow:"hidden",
border:"5px solid #111827",
background:"#374151",
boxShadow:
"0 4px 15px rgba(0,0,0,.4)"
}}
>

<img
src={profileImage}
style={{
width:"100%",
height:"100%",
objectFit:"cover"
}}
/>

</div>

<label
style={{
position:"absolute",
bottom:"0",
right:"0",
width:"35px",
height:"35px",
borderRadius:"50%",
background:"#1877f2",
display:"flex",
alignItems:"center",
justifyContent:"center",
fontSize:"24px",
cursor:"pointer",
border:"3px solid #111827"
}}
>

+

<input
type="file"
hidden
accept="image/*"
onChange={profileUpload}
/>

</label>

</div>

<h2
style={{
marginTop:"10px",
fontSize:"22px",
fontWeight:"bold"
}}
>

الملف الشخصي

</h2>

</div>

{/* المعلومات */}

<div
style={{
background:"#111827",
padding:"15px",
borderRadius:"12px",
marginTop:"20px"
}}
>

<h3>المعلومات الشخصية</h3>

{/* ================= الاسم الكامل ================= */}

<h3>الاسم الكامل</h3>

<div style={{ marginTop: "10px" }}>

  <div
    onClick={() => setOpenFullName(true)}
    style={{
      padding: "10px 12px",
      background: "#1f2937",
      border: "1px solid #374151",
      borderRadius: "8px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      cursor: "pointer",
    }}
  >
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "2px",
        flex: 1,
        overflow: "hidden",
      }}
    >
      <span
        style={{
          fontSize: "12px",
          color: "#9ca3af",
        }}
      >
        الاسم الكامل
      </span>

      <span
        style={{
          fontSize: "14px",
          color: fullName ? "#fff" : "#9ca3af",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {fullName || "غير مضاف"}
      </span>
    </div>

    <span style={{ color: "#9ca3af" }}>
      {openFullName ? "▲" : "▼"}
    </span>
  </div>

  {openFullName && (
    <div
      onClick={() => setOpenFullName(false)}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "90%",
          maxWidth: "400px",
          background: "#111827",
          padding: "20px",
          borderRadius: "12px",
        }}
      >
        <h3>الاسم الكامل</h3>

        <input
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="اكتب الاسم الكامل"
          style={inputStyle}
        />

        <button
          onClick={() => {
            localStorage.setItem("fullName", fullName);
            setOpenFullName(false);
          }}
          style={{
            marginTop: "10px",
            width: "100%",
            padding: "10px",
            background: "#1877f2",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          حفظ
        </button>
      </div>
    </div>
  )}

</div>

{/* ================= اللقب ================= */}

<h3>اللقب</h3>

<div style={{ marginTop: "10px" }}>

  <div
    onClick={() => setOpenNickname(true)}
    style={{
      padding: "10px 12px",
      background: "#1f2937",
      border: "1px solid #374151",
      borderRadius: "8px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      cursor: "pointer",
    }}
  >
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "2px",
        flex: 1,
        overflow: "hidden",
      }}
    >
      <span
        style={{
          fontSize: "12px",
          color: "#9ca3af",
        }}
      >
        اللقب
      </span>

      <span
        style={{
          fontSize: "14px",
          color: nickname ? "#fff" : "#9ca3af",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {nickname || "غير مضاف"}
      </span>
    </div>

    <span style={{ color: "#9ca3af" }}>
      {openNickname ? "▲" : "▼"}
    </span>
  </div>

  {openNickname && (
    <div
      onClick={() => setOpenNickname(false)}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "90%",
          maxWidth: "400px",
          background: "#111827",
          padding: "20px",
          borderRadius: "12px",
        }}
      >
        <h3>اللقب</h3>

        <input
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder="اكتب اللقب"
          style={inputStyle}
        />

        <button
          onClick={() => {
            localStorage.setItem("nickname", nickname);
            setOpenNickname(false);
          }}
          style={{
            marginTop: "10px",
            width: "100%",
            padding: "10px",
            background: "#1877f2",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          حفظ
        </button>
      </div>
    </div>
  )}

</div>
<h3>تاريخ الميلاد</h3>

<div style={{ position: "relative", marginTop: "10px" }}>

  {/* الزر الرئيسي */}
 <div
  onClick={() => setOpenDob(prev => !prev)}
  style={{
    width: "100%",
    padding: "10px 12px",
    borderRadius: "8px",
    background: "#1f2937",
    border: "1px solid #374151",
    cursor: "pointer",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  }}
>
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      gap: "2px",
    }}
  >
    <span
      style={{
        fontSize: "12px",
        color: "#9ca3af",
      }}
    >
      تاريخ الميلاد
    </span>

    <span
      style={{
        color: day && month && year ? "#fff" : "#9ca3af",
        fontSize: "14px",
      }}
    >
      {day && month && year
        ? `${day}/${month}/${year}`
        : "غير مضاف"}
    </span>
  </div>

  <span
    style={{
      color: "#9ca3af",
      fontSize: "12px",
    }}
  >
    {openDob ? "▲" : "▼"}
  </span>
</div>

  {/* القائمة */}
  {openDob && (
    <div
      style={{
        marginTop: "8px",
        display: "flex",
        gap: "8px",
        background: "#111827",
        padding: "10px",
        borderRadius: "8px",
      }}
    >

      {/* اليوم */}
      <select style={inputStyle} onChange={(e) => setDay(e.target.value)}>
        <option>اليوم</option>
        {Array.from({ length: 31 }, (_, i) => (
          <option key={i}>{i + 1}</option>
        ))}
      </select>

      {/* الشهر */}
      <select style={inputStyle} onChange={(e) => setMonth(e.target.value)}>
        <option>الشهر</option>
        {Array.from({ length: 12 }, (_, i) => (
          <option key={i}>{i + 1}</option>
        ))}
      </select>

      {/* السنة */}
      <select style={inputStyle} onChange={(e) => setYear(e.target.value)}>
        <option>السنة</option>
        {Array.from({ length: 80 }, (_, i) => 2026 - i).map(year => (
          <option key={year}>{year}</option>
        ))}
      </select>

    </div>
  )}
</div>





<h3>الجنس</h3>

<div style={{ position: "relative", marginTop: "10px" }}>

  {/* الزر الرئيسي */}
 <div
  onClick={() => setOpenGender(prev => !prev)}
  style={{
    width: "100%",
    padding: "10px 12px",
    borderRadius: "8px",
    background: "#1f2937",
    border: "1px solid #374151",
    cursor: "pointer",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  }}
>
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      gap: "2px",
    }}
  >
    <span
      style={{
        fontSize: "12px",
        color: "#9ca3af",
      }}
    >
      الجنس
    </span>

    <span
      style={{
        fontSize: "14px",
        color: gender ? "#ffffff" : "#9ca3af",
      }}
    >
      {gender || "غير مضاف"}
    </span>
  </div>

  <span
    style={{
      fontSize: "12px",
      color: "#9ca3af",
    }}
  >
    {openGender ? "▲" : "▼"}
  </span>
</div>

  {/* القائمة */}
  {openGender && (
    <div
      style={{
        marginTop: "8px",
        background: "#111827",
        padding: "10px",
        borderRadius: "8px",
        display: "flex",
        flexDirection: "column",
        gap: "8px",
      }}
    >
      {["ذكر", "أنثى"].map(item => (
        <button
          key={item}
          type="button"
          onClick={() => {
            setGender(item);
            setOpenGender(false);
          }}
          style={{
            padding: "10px",
            borderRadius: "8px",
            border: "1px solid #374151",
            background: gender === item ? "#1877f2" : "#1f2937",
            color: "white",
            cursor: "pointer",
            textAlign: "left",
          }}
        >
          {item}
        </button>
      ))}
    </div>
  )}
</div>




<h3 style={{ marginTop: "10px" }}>الهوايات</h3>

<div
  onClick={() => setOpenHobbies(prev => !prev)}
  style={{
    width: "100%",
    padding: "10px 12px",
    marginTop: "10px",
    borderRadius: "8px",
    background: "#1f2937",
    border: "1px solid #374151",
    cursor: "pointer",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  }}
>
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      gap: "2px",
      flex: 1,
      overflow: "hidden",
    }}
  >
    <span
      style={{
        fontSize: "12px",
        color: "#9ca3af",
      }}
    >
      الهوايات
    </span>

    <span
      style={{
        fontSize: "14px",
        color: hobbies.length ? "#ffffff" : "#9ca3af",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
      }}
    >
      {hobbies.length
        ? hobbies.join(" • ")
        : "غير مضاف"}
    </span>
  </div>

  <span
    style={{
      fontSize: "12px",
      color: "#9ca3af",
      marginLeft: "10px",
      transition: "0.25s",
      transform: openHobbies ? "rotate(180deg)" : "rotate(0deg)",
    }}
  >
    ▼
  </span>
</div>

<div
  style={{
    marginTop: "6px",
    background: "#111827",
    padding: openHobbies ? "10px" : "0px",
    borderRadius: "8px",
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    maxHeight: openHobbies ? "200px" : "0px",
    overflow: "hidden",
    opacity: openHobbies ? 1 : 0,
    transition: "all 0.25s ease",
  }}
>
  {[
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
  ].map(item => (
    <button
      key={item}
      type="button"
      onClick={() => {
        setHobbies(prev =>
          prev.includes(item)
            ? prev.filter(i => i !== item)
            : [...prev, item]
        );
      }}
      style={{
        padding: "6px 10px",
        borderRadius: "16px",
        border: "1px solid #374151",
        cursor: "pointer",
        background: hobbies.includes(item)
          ? "#1877f2"
          : "#1f2937",
        color: "white",
        fontSize: "12px",
        transition: "0.2s",
      }}
    >
      {item}
    </button>
  ))}
</div>





<h3>التعليم</h3>

<div style={{ position: "relative", marginTop: "10px" }}>

<div
  onClick={() => setOpenEdu(prev => !prev)}
  style={{
    width: "100%",
    padding: "10px 12px",
    borderRadius: "8px",
    background: "#1f2937",
    border: "1px solid #374151",
    cursor: "pointer",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  }}
>
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      gap: "2px",
      flex: 1,
      overflow: "hidden",
    }}
  >
    <span
      style={{
        fontSize: "12px",
        color: "#9ca3af",
      }}
    >
      التعليم
    </span>

    <span
      style={{
        fontSize: "14px",
        color: education ? "#ffffff" : "#9ca3af",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
      }}
    >
      {education || "غير مضاف"}
    </span>
  </div>

  <span
    style={{
      fontSize: "12px",
      color: "#9ca3af",
      marginLeft: "10px",
    }}
  >
    {openEdu ? "▲" : "▼"}
  </span>
</div>

  {openEdu && (
    <div style={{
      marginTop: "8px",
      background: "#111827",
      padding: "10px",
      borderRadius: "8px",
      display: "flex",
      flexDirection: "column",
      gap: "8px",
    }}>
      {["ابتدائي", "متوسط", "إعدادي", "ثانوي", "كلية", "دراسات عليا"].map(item => (
        <button
          key={item}
          type="button"
          onClick={() => {
            setEducation(item);
            setOpenEdu(false);
          }}
          style={{
            padding: "10px",
            borderRadius: "8px",
            border: "1px solid #374151",
            background: education === item ? "#1877f2" : "#1f2937",
            color: "white",
            cursor: "pointer",
            textAlign: "left",
          }}
        >
          {item}
        </button>
      ))}
    </div>
  )}
</div>




<h3>المهنة</h3>

<div style={{ position: "relative", marginTop: "10px" }}>

<div
  onClick={() => setOpenJob(prev => !prev)}
  style={{
    width: "100%",
    padding: "10px 12px",
    borderRadius: "8px",
    background: "#1f2937",
    border: "1px solid #374151",
    cursor: "pointer",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  }}
>
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      gap: "2px",
      flex: 1,
      overflow: "hidden",
    }}
  >
    <span
      style={{
        fontSize: "12px",
        color: "#9ca3af",
      }}
    >
      المهنة
    </span>

    <span
      style={{
        fontSize: "14px",
        color: job ? "#ffffff" : "#9ca3af",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
      }}
    >
      {job || "غير مضاف"}
    </span>
  </div>

  <span
    style={{
      fontSize: "12px",
      color: "#9ca3af",
      marginLeft: "10px",
    }}
  >
    {openJob ? "▲" : "▼"}
  </span>
</div>

  {openJob && (
    <div
      style={{
        marginTop: "8px",
        background: "#111827",
        padding: "10px",
        borderRadius: "8px",
        display: "flex",
        flexDirection: "column",
        gap: "8px",
      }}
    >
      {[
        "طالب",
        "مبرمج",
        "مصمم",
        "مصور",
        "إعلامي",
        "موظف",
        "حر"
      ].map(item => (
        <button
          key={item}
          type="button"
          onClick={() => {
            setJob(item);
            setOpenJob(false);
          }}
          style={{
            padding: "10px",
            borderRadius: "8px",
            border: "1px solid #374151",
            background:
              job === item
                ? "#1877f2"
                : "#1f2937",
            color: "white",
            cursor: "pointer",
          }}
        >
          {item}
        </button>
      ))}
    </div>
  )}

</div>

<h3>معلومات التواصل</h3>

{[
  {
    name: "facebook",
    label: "فيسبوك",
    value: facebook,
    setter: setFacebook,
  },
  {
    name: "whatsapp",
    label: "واتساب",
    value: whatsapp,
    setter: setWhatsapp,
  },
  {
    name: "instagram",
    label: "انستكرام",
    value: instagram,
    setter: setInstagram,
  },
  {
    name: "email",
    label: "البريد الإلكتروني",
    value: email,
    setter: setEmail,
  },
].map((item) => (
  <div key={item.name} style={{ marginTop: "10px" }}>
    
    {/* 🔘 الزر الرئيسي */}
<div
  onClick={() =>
    setOpenContact(
      openContact === item.name ? "" : item.name
    )
  }
  style={{
    padding: "10px 12px",
    background: "#1f2937",
    border: "1px solid #374151",
    borderRadius: "8px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    cursor: "pointer",
  }}
>
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      gap: "2px",
      flex: 1,
      overflow: "hidden",
    }}
  >
    <span
      style={{
        fontSize: "12px",
        color: "#9ca3af",
      }}
    >
      {item.label}
    </span>

    <span
      style={{
        fontSize: "14px",
        color: item.value ? "#ffffff" : "#9ca3af",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
      }}
    >
      {item.value || "غير مضاف"}
    </span>
  </div>

  <span
    style={{
      fontSize: "12px",
      color: "#9ca3af",
      marginLeft: "10px",
    }}
  >
    {openContact === item.name ? "▲" : "▼"}
  </span>
</div>

    {/* 🪟 Modal */}
    {openContact === item.name && (
      <div
        onClick={() => setOpenContact("")} // 👈 الضغط خارج يغلق
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: "rgba(0,0,0,0.6)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999,
        }}
      >
        <div
          onClick={(e) => e.stopPropagation()} // 👈 يمنع الإغلاق داخل الصندوق
          style={{
            width: "90%",
            maxWidth: "400px",
            background: "#111827",
            padding: "20px",
            borderRadius: "12px",
          }}
        >
          <h3 style={{ marginBottom: "10px" }}>{item.label}</h3>

          {/* ✍️ الحقل */}
          <input
            value={item.value}
            onChange={(e) => {
              item.setter(e.target.value);
            }}
            placeholder={`أدخل ${item.label}`}
            style={inputStyle}
          />

          {/* 💾 حفظ */}
          <button
            onClick={() => {
              localStorage.setItem(item.name, item.value);
              setOpenContact("");
            }}
            style={{
              marginTop: "10px",
              width: "100%",
              padding: "10px",
              background: "#1877f2",
              color: "white",
              borderRadius: "8px",
              border: "none",
              cursor: "pointer",
            }}
          >
            حفظ
          </button>
        </div>
      </div>
    )}
  </div>
))}



<h3>الموقع</h3>

<>
  {[
    {
      name: "current",
      label: "الموقع الحالي",
      value: currentLocation,
      setter: setCurrentLocation,
    },
    {
      name: "origin",
      label: "مكان المنشأ",
      value: originLocation,
      setter: setOriginLocation,
    },
  ].map((item) => (
    <div key={item.name} style={{ marginTop: "10px" }}>

      {/* زر الفتح */}
  <div
  onClick={() =>
    setOpenLocation(
      openLocation === item.name ? "" : item.name
    )
  }
  style={{
    padding: "10px 12px",
    background: "#1f2937",
    border: "1px solid #374151",
    borderRadius: "8px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    cursor: "pointer",
  }}
>
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      gap: "2px",
      flex: 1,
      overflow: "hidden",
    }}
  >
    <span
      style={{
        fontSize: "12px",
        color: "#9ca3af",
      }}
    >
      {item.label}
    </span>

    <span
      style={{
        fontSize: "14px",
        color: item.value ? "#ffffff" : "#9ca3af",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
      }}
    >
      {item.value || "غير مضاف"}
    </span>
  </div>

  <span
    style={{
      fontSize: "12px",
      color: "#9ca3af",
      marginLeft: "10px",
    }}
  >
    {openLocation === item.name ? "▲" : "▼"}
  </span>
</div>

      {/* Modal */}
      {openLocation === item.name && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
          onClick={() => {
            setOpenLocation("");
            setSearchResults([]);
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "90%",
              maxWidth: "420px",
              background: "#111827",
              padding: "20px",
              borderRadius: "12px",
            }}
          >
            <h3>{item.label}</h3>

            <input
              value={item.value}
              onChange={(e) =>
                searchLocation(
                  e.target.value,
                  item.setter
                )
              }
              placeholder="ابحث عن مدينة أو منطقة..."
              style={inputStyle}
            />

            {searchResults.length > 0 && (
              <div
                style={{
                  marginTop: "10px",
                  background: "#1f2937",
                  borderRadius: "8px",
                  overflow: "hidden",
                  maxHeight: "220px",
                  overflowY: "auto",
                }}
              >
                {searchResults.map(
                  (place: any, index) => (
                    <div
                      key={index}
                      onClick={() => {

                        item.setter(
                          place.display_name
                        );

                        localStorage.setItem(
                          item.name,
                          place.display_name
                        );

                        setSearchResults([]);

                      }}
                      style={{
                        padding: "10px",
                        cursor: "pointer",
                        borderBottom:
                          "1px solid #374151",
                      }}
                    >
                      {place.display_name}
                    </div>
                  )
                )}
              </div>
            )}

            <div
              style={{
                marginTop:"10px",
                fontSize:"12px",
                color:"#9ca3af"
              }}
            >
              مثال: بغداد، البصرة، الموصل
            </div>

            <button
              onClick={() => {

                localStorage.setItem(
                  item.name,
                  item.value
                );

                setOpenLocation("");

              }}
              style={{
                marginTop:"10px",
                width:"100%",
                padding:"10px",
                background:"#1877f2",
                color:"white",
                border:"none",
                borderRadius:"8px",
                cursor:"pointer",
              }}
            >
              حفظ
            </button>

          </div>
        </div>
      )}

    </div>
  ))}
</>





<h3>عدد أفراد العائلة</h3>

<div style={{ marginTop: "10px" }}>

  {/* الزر الرئيسي */}
<div
  onClick={() => {
    setOpenFamily(prev => !prev);

    const saved = localStorage.getItem("familyCount");
    if (saved && !familyCount) setFamilyCount(saved);
  }}
  style={{
    padding: "10px 12px",
    background: "#1f2937",
    border: "1px solid #374151",
    borderRadius: "8px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    cursor: "pointer",
  }}
>
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      gap: "2px",
    }}
  >
    <span
      style={{
        fontSize: "12px",
        color: "#9ca3af",
      }}
    >
      عدد أفراد العائلة
    </span>

    <span
      style={{
        fontSize: "14px",
        color: familyCount ? "#ffffff" : "#9ca3af",
      }}
    >
      {familyCount ? `${familyCount} أفراد` : "غير مضاف"}
    </span>
  </div>

  <span
    style={{
      fontSize: "12px",
      color: "#9ca3af",
    }}
  >
    {openFamily ? "▲" : "▼"}
  </span>
</div>

  {/* modal */}
  {openFamily && (
    <div
      onClick={() => setOpenFamily(false)}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "90%",
          maxWidth: "400px",
          background: "#111827",
          padding: "20px",
          borderRadius: "12px",
        }}
      >
        <h3>عدد أفراد العائلة</h3>

        <input
          type="number"
          value={familyCount}
          onChange={(e) => setFamilyCount(e.target.value)}
          placeholder="مثال: 5"
          style={inputStyle}
        />

        <button
          onClick={() => {
            localStorage.setItem("familyCount", familyCount || "");
            setOpenFamily(false);
          }}
          style={{
            marginTop: "10px",
            width: "100%",
            padding: "10px",
            background: "#1877f2",
            color: "white",
            borderRadius: "8px",
            border: "none",
            cursor: "pointer",
          }}
        >
          حفظ
        </button>
      </div>
    </div>
  )}
</div>





<h3>السيرة الذاتية</h3>

<div style={{ marginTop: "10px" }}>

  {/* الزر الرئيسي */}
 <div
  onClick={() => setOpenBio(prev => !prev)}
  style={{
    padding: "10px 12px",
    background: "#1f2937",
    border: "1px solid #374151",
    borderRadius: "8px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    cursor: "pointer",
  }}
>
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      gap: "2px",
      flex: 1,
      overflow: "hidden",
    }}
  >
    <span
      style={{
        fontSize: "12px",
        color: "#9ca3af",
      }}
    >
      السيرة الذاتية
    </span>

    <span
      style={{
        fontSize: "14px",
        color: bio ? "#ffffff" : "#9ca3af",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
      }}
    >
      {bio || "غير مضاف"}
    </span>
  </div>

  <span
    style={{
      fontSize: "12px",
      color: "#9ca3af",
      marginLeft: "10px",
    }}
  >
    {openBio ? "▲" : "▼"}
  </span>
</div>

  {/* modal */}
  {openBio && (
    <div
      onClick={() => setOpenBio(false)}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "90%",
          maxWidth: "400px",
          background: "#111827",
          padding: "20px",
          borderRadius: "12px",
        }}
      >
        <h3>السيرة الذاتية</h3>

        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="اكتب نبذة عن نفسك..."
          style={{
            ...textareaStyle,
            resize: "none",
            minHeight: "120px",
          }}
        />

        <button
          onClick={() => {
            localStorage.setItem("bio", bio || "");
            setOpenBio(false);
          }}
          style={{
            marginTop: "10px",
            width: "100%",
            padding: "10px",
            background: "#1877f2",
            color: "white",
            borderRadius: "8px",
            border: "none",
            cursor: "pointer",
          }}
        >حفظ
        </button>
      </div>
    </div>
  )}
</div>
{loading && (
  <div
    style={{
      position: "absolute",
      inset: 0,
      background: "rgba(0,0,0,.35)",
      zIndex: 9999
    }}
  >

    <div
      style={{
        position: "absolute",
        top: 0,
        right: 0,
        height: "4px",
        width: `${progress}%`,
        background: "#22c55e",
        transition: "width .2s linear"
      }}
    />

  </div>
)}

</div>

</div>
);
}