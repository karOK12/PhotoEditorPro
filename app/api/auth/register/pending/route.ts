import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/app/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const fullName = String(body?.fullName ?? "").trim();
    const lastName = String(body?.lastName ?? "").trim();
    const email = String(body?.email ?? "").trim().toLowerCase();
    const password = String(body?.password ?? "");

    const birthDay = Number(body?.birthDay);
    const birthMonth = Number(body?.birthMonth);
    const birthYear = Number(body?.birthYear);

    const country = String(body?.country ?? "").trim();
    const phone = String(body?.phone ?? "").trim();
    const city = String(body?.city ?? "").trim();
    const state = String(body?.state ?? "").trim();
    const zip = String(body?.zip ?? "").trim();

    const idType = String(body?.idType ?? "").trim();
    const idName = String(body?.idName ?? "").trim();
    const idNumber = String(body?.idNumber ?? "").trim();

    const profileImage = String(body?.profileImage ?? "").trim();
    const idImage = String(body?.idImage ?? "").trim();

    if (
      !fullName ||
      !lastName ||
      !email ||
      !password ||
      !country ||
      !phone ||
      !city ||
      !state ||
      !idType ||
      !idName ||
      !idNumber ||
      !profileImage ||
      !idImage
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "بيانات التسجيل غير مكتملة",
        },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        {
          success: false,
          message: "البريد الإلكتروني غير صالح",
        },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        {
          success: false,
          message: "كلمة المرور يجب أن تتكون من 8 أحرف أو أرقام على الأقل",
        },
        { status: 400 }
      );
    }

    if (
      !Number.isInteger(birthDay) ||
      !Number.isInteger(birthMonth) ||
      !Number.isInteger(birthYear)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "تاريخ الميلاد غير صالح",
        },
        { status: 400 }
      );
    }

    if (birthDay < 1 || birthDay > 31) {
      return NextResponse.json(
        {
          success: false,
          message: "اليوم غير صالح",
        },
        { status: 400 }
      );
    }

    if (birthMonth < 1 || birthMonth > 12) {
      return NextResponse.json(
        {
          success: false,
          message: "الشهر غير صالح",
        },
        { status: 400 }
      );
    }

    if (birthYear < 1900 || birthYear > new Date().getFullYear()) {
      return NextResponse.json(
        {
          success: false,
          message: "سنة الميلاد غير صالحة",
        },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await db.query(
      `INSERT INTO pending_registrations
       (
         full_name,
         last_name,
         email,
         password_hash,
         phone,
         country_code,
         birth_day,
         birth_month,
         birth_year,
         city,
         state,
         zip,
         id_type,
         id_name,
         id_number,
         profile_image,
         id_image
       )
       VALUES
       (
         $1, $2, $3, $4, $5, $6, $7, $8, $9,
         $10, $11, $12, $13, $14, $15, $16, $17
       )
       ON CONFLICT (email)
       DO UPDATE SET
         full_name = EXCLUDED.full_name,
         last_name = EXCLUDED.last_name,
         password_hash = EXCLUDED.password_hash,
         phone = EXCLUDED.phone,
         country_code = EXCLUDED.country_code,
         birth_day = EXCLUDED.birth_day,
         birth_month = EXCLUDED.birth_month,
         birth_year = EXCLUDED.birth_year,
         city = EXCLUDED.city,
         state = EXCLUDED.state,
         zip = EXCLUDED.zip,
         id_type = EXCLUDED.id_type,
         id_name = EXCLUDED.id_name,
         id_number = EXCLUDED.id_number,
         profile_image = EXCLUDED.profile_image,
         id_image = EXCLUDED.id_image,
         email_verified = FALSE,
         updated_at = NOW()`,
      [
        fullName,
        lastName,
        email,
        passwordHash,
        phone,
        country,
        birthDay,
        birthMonth,
        birthYear,
        city,
        state,
        zip || null,
        idType,
        idName,
        idNumber,
        profileImage,
        idImage,
      ]
    );

    return NextResponse.json(
      {
        success: true,
        message: "تم حفظ بيانات التسجيل، بانتظار التحقق من البريد الإلكتروني",
        email,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Pending registration API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "حدث خطأ أثناء حفظ بيانات التسجيل",
      },
      { status: 500 }
    );
  }
}
