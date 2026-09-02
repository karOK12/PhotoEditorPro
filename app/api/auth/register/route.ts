import { NextResponse } from "next/server";
import { db } from "@/app/lib/db";

export async function POST(request: Request) {
  const client = await db.connect();

  try {
    const body = await request.json();

    const email = String(body?.email ?? "")
      .trim()
      .toLowerCase();

    if (!email) {
      return NextResponse.json(
        {
          success: false,
          message: "البريد الإلكتروني مطلوب",
        },
        { status: 400 }
      );
    }

    await client.query("BEGIN");

    /*
     * المصدر الحقيقي لبيانات التسجيل هو pending_registrations.
     * لا نعتمد على البيانات المرسلة من المتصفح لإنشاء الحساب.
     */
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
          message: "لم يتم العثور على بيانات التسجيل. يرجى إعادة التسجيل.",
        },
        { status: 404 }
      );
    }

    const pending = pendingResult.rows[0];

    /*
     * لا يمكن إنشاء الحساب بدون تحقق OTP محفوظ في قاعدة البيانات.
     */
    if (!pending.email_verified) {
      await client.query("ROLLBACK");

      return NextResponse.json(
        {
          success: false,
          message:
            "لم يتم التحقق من البريد الإلكتروني. يرجى إدخال رمز التحقق أولاً.",
        },
        { status: 403 }
      );
    }

    /*
     * التأكد من أن المستخدم غير موجود مسبقًا.
     */
    const existingUser = await client.query(
      `SELECT id
       FROM users
       WHERE LOWER(email) = $1
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

    /*
     * إنشاء المستخدم باستخدام password_hash الموجود
     * في pending_registrations.
     *
     * لا نعيد تشفير الـ hash مرة ثانية.
     */
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

    /*
     * نقل بيانات الملف الشخصي من pending إلى user_profiles.
     */
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

    /*
     * نحذف البيانات المعلقة فقط بعد نجاح إنشاء
     * users و user_profiles.
     */
    await client.query(
      `DELETE FROM pending_registrations
       WHERE id = $1`,
      [pending.id]
    );

    await client.query("COMMIT");

    return NextResponse.json(
      {
        success: true,
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
