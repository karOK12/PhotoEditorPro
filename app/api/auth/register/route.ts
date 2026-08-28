import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/app/lib/db";

export async function POST(request: Request) {
  const client = await db.connect();

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

    const profileImage = String(body?.profileImage ?? "");
    const idImage = String(body?.idImage ?? "");

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
      !idNumber
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "بيانات التسجيل غير مكتملة",
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

    if (!Number.isInteger(birthDay) || !Number.isInteger(birthMonth) || !Number.isInteger(birthYear)) {
      return NextResponse.json(
        {
          success: false,
          message: "تاريخ الميلاد غير صالح",
        },
        { status: 400 }
      );
    }

    await client.query("BEGIN");

    const existingUser = await client.query(
      `SELECT id
       FROM users
       WHERE email = $1
       LIMIT 1`,
      [email]
    );

    if (existingUser.rows.length > 0) {
      await client.query("ROLLBACK");

      return NextResponse.json(
        {
          success: false,
          message: "هذا البريد الإلكتروني مستخدم مسبقًا",
        },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const userResult = await client.query(
      `INSERT INTO users
       (full_name, email, password_hash, phone, email_verified)
       VALUES ($1, $2, $3, $4, true)
       RETURNING id, full_name, email, phone, email_verified, created_at`,
      [fullName, email, passwordHash, phone]
    );

    const user = userResult.rows[0];

    await client.query(
      `INSERT INTO user_profiles
       (
         user_id,
         birth_day,
         birth_month,
         birth_year,
         country_code,
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
         $1, $2, $3, $4, $5, $6, $7,
         $8, $9, $10, $11, $12, $13
       )`,
      [
        user.id,
        birthDay,
        birthMonth,
        birthYear,
        country,
        city,
        state,
        zip || null,
        idType,
        idName,
        idNumber,
        profileImage || null,
        idImage || null,
      ]
    );

    await client.query("COMMIT");

    return NextResponse.json(
      {
        success: true,
        message: "تم إنشاء الحساب بنجاح",
        user: {
          id: user.id,
          fullName: user.full_name,
          email: user.email,
          phone: user.phone,
          emailVerified: user.email_verified,
          createdAt: user.created_at,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    try {
      await client.query("ROLLBACK");
    } catch {}

    console.error("Register API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "حدث خطأ أثناء إنشاء الحساب",
      },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
