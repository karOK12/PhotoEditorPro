import { NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/app/lib/db";

export async function POST(request: Request) {
  const client = await db.connect();

  try {
    const body = await request.json();

    const email = String(body?.email ?? "")
      .trim()
      .toLowerCase();

    const otp = String(body?.otp ?? "").trim();

    if (!email || !otp) {
      return NextResponse.json(
        {
          success: false,
          message: "البريد الإلكتروني ورمز التحقق مطلوبان",
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

    if (!/^\d{6}$/.test(otp)) {
      return NextResponse.json(
        {
          success: false,
          message: "رمز التحقق يجب أن يتكون من 6 أرقام",
        },
        { status: 400 }
      );
    }

    await client.query("BEGIN");

    const otpResult = await client.query(
      `SELECT
         id,
         code_hash,
         attempts,
         expires_at
       FROM otp_codes
       WHERE email = $1
         AND purpose = $2
         AND used_at IS NULL
       ORDER BY created_at DESC
       LIMIT 1
       FOR UPDATE`,
      [email, "register"]
    );

    if (otpResult.rows.length === 0) {
      await client.query("ROLLBACK");

      return NextResponse.json(
        {
          success: false,
          message: "لا يوجد رمز تحقق صالح لهذا البريد",
        },
        { status: 400 }
      );
    }

    const otpRecord = otpResult.rows[0];

    if (new Date(otpRecord.expires_at).getTime() <= Date.now()) {
      await client.query("ROLLBACK");

      return NextResponse.json(
        {
          success: false,
          message: "انتهت صلاحية رمز التحقق، اطلب رمزًا جديدًا",
        },
        { status: 400 }
      );
    }

    if (otpRecord.attempts >= 5) {
      await client.query("ROLLBACK");

      return NextResponse.json(
        {
          success: false,
          message: "تم تجاوز عدد محاولات التحقق، اطلب رمزًا جديدًا",
        },
        { status: 429 }
      );
    }

    const codeHash = crypto
      .createHash("sha256")
      .update(otp)
      .digest("hex");

    if (codeHash !== otpRecord.code_hash) {
      await client.query(
        `UPDATE otp_codes
         SET attempts = attempts + 1
         WHERE id = $1`,
        [otpRecord.id]
      );

      await client.query("COMMIT");

      return NextResponse.json(
        {
          success: false,
          message: "رمز التحقق غير صحيح",
        },
        { status: 400 }
      );
    }

    const pendingResult = await client.query(
      `SELECT
         id,
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
         id_image,
         email_verified
       FROM pending_registrations
       WHERE LOWER(email) = $1
       LIMIT 1
       FOR UPDATE`,
      [email]
    );

    if (pendingResult.rows.length === 0) {
      await client.query("ROLLBACK");

      return NextResponse.json(
        {
          success: false,
          message:
            "لم يتم العثور على بيانات التسجيل المعلّقة، يرجى إعادة التسجيل",
        },
        { status: 400 }
      );
    }

    const pending = pendingResult.rows[0];

    const existingUser = await client.query(
      `SELECT id
       FROM users
       WHERE LOWER(email) = $1
       LIMIT 1
       FOR UPDATE`,
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

    const userResult = await client.query(
      `INSERT INTO users
       (
         full_name,
         email,
         password_hash,
         phone,
         email_verified
       )
       VALUES ($1, $2, $3, $4, true)
       RETURNING
         id,
         full_name,
         email,
         phone,
         email_verified,
         created_at`,
      [
        pending.full_name,
        pending.email,
        pending.password_hash,
        pending.phone,
      ]
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
         $1,
         $2,
         $3,
         $4,
         $5,
         $6,
         $7,
         $8,
         $9,
         $10,
         $11,
         $12,
         $13
       )`,
      [
        user.id,
        pending.birth_day,
        pending.birth_month,
        pending.birth_year,
        pending.country_code,
        pending.city,
        pending.state,
        pending.zip || null,
        pending.id_type,
        pending.id_name,
        pending.id_number,
        pending.profile_image || null,
        pending.id_image || null,
      ]
    );

    await client.query(
      `UPDATE otp_codes
       SET used_at = NOW()
       WHERE id = $1`,
      [otpRecord.id]
    );

    await client.query(
      `DELETE FROM pending_registrations
       WHERE id = $1`,
      [pending.id]
    );

    await client.query("COMMIT");

    return NextResponse.json(
      {
        success: true,
        verified: true,
        accountCreated: true,
        message: "تم إنشاء حسابك بنجاح",
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

    console.error("OTP verify and account creation error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "حدث خطأ أثناء التحقق وإنشاء الحساب",
      },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
