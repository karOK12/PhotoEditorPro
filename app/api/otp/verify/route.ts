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

    /*
     * البحث عن أحدث رمز تسجيل غير مستخدم.
     */
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
       LIMIT 1`,
      [email, "register"]
    );

    if (otpResult.rows.length === 0) {
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
      return NextResponse.json(
        {
          success: false,
          message: "انتهت صلاحية رمز التحقق، اطلب رمزًا جديدًا",
        },
        { status: 400 }
      );
    }

    if (otpRecord.attempts >= 5) {
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

      return NextResponse.json(
        {
          success: false,
          message: "رمز التحقق غير صحيح",
        },
        { status: 400 }
      );
    }

    /*
     * جلب بيانات التسجيل المعلّق.
     */
    const pendingResult = await client.query(
      `SELECT
         id,
         full_name,
         last_name,
         email,
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
       WHERE LOWER(email) = LOWER($1)
       LIMIT 1`,
      [email]
    );

    if (pendingResult.rows.length === 0) {
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

    /*
     * التأكد من أن البريد غير مستخدم بحساب حقيقي.
     */
    const existingUser = await client.query(
      `SELECT id
       FROM users
       WHERE LOWER(email) = LOWER($1)
       LIMIT 1`,
      [email]
    );

    if (existingUser.rows.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: "هذا البريد الإلكتروني مستخدم مسبقًا",
        },
        { status: 409 }
      );
    }

    /*
     * تحديث حالة التحقق فقط.
     * لا يتم إنشاء الحساب هنا.
     */
    await client.query("BEGIN");

    await client.query(
      `UPDATE pending_registrations
       SET email_verified = TRUE,
           updated_at = NOW()
       WHERE id = $1`,
      [pending.id]
    );

    /*
     * اعتبار OTP مستخدمًا بعد نجاح التحقق.
     */
    await client.query(
      `UPDATE otp_codes
       SET used_at = NOW()
       WHERE id = $1`,
      [otpRecord.id]
    );

    await client.query("COMMIT");

    /*
     * إعادة بيانات التسجيل للواجهة.
     * كلمة المرور لا يتم إرسالها من الخادم.
     */
    return NextResponse.json(
      {
        success: true,
        message: "تم التحقق من البريد الإلكتروني بنجاح",
        verified: true,
        registration: {
          fullName: pending.full_name,
          lastName: pending.last_name,
          phone: pending.phone,
          country: pending.country_code,
          birthDay: pending.birth_day,
          birthMonth: pending.birth_month,
          birthYear: pending.birth_year,
          city: pending.city,
          state: pending.state,
          zip: pending.zip || "",
          idType: pending.id_type,
          idName: pending.id_name,
          idNumber: pending.id_number,
          profileImage: pending.profile_image || "",
          idImage: pending.id_image || "",
          email: pending.email,
          emailVerified: true,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    try {
      await client.query("ROLLBACK");
    } catch {}

    console.error("OTP verify error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "حدث خطأ أثناء التحقق من البريد الإلكتروني",
      },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
