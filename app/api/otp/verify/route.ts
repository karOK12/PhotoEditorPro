import { NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/app/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const email = String(body?.email ?? "").trim().toLowerCase();
    const otp = String(body?.otp ?? "").trim();

    if (!email || !otp) {
      return NextResponse.json(
        { success: false, message: "البريد الإلكتروني ورمز التحقق مطلوبان" },
        { status: 400 }
      );
    }

    if (!/^\d{6}$/.test(otp)) {
      return NextResponse.json(
        { success: false, message: "رمز التحقق يجب أن يتكون من 6 أرقام" },
        { status: 400 }
      );
    }

    const result = await db.query(
      `SELECT id, code_hash, attempts, expires_at
       FROM otp_codes
       WHERE email = $1
         AND purpose = $2
         AND used_at IS NULL
       ORDER BY created_at DESC
       LIMIT 1`,
      [email, "register"]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "لا يوجد رمز تحقق صالح لهذا البريد" },
        { status: 400 }
      );
    }

    const record = result.rows[0];

    if (new Date(record.expires_at).getTime() <= Date.now()) {
      return NextResponse.json(
        { success: false, message: "انتهت صلاحية رمز التحقق، اطلب رمزًا جديدًا" },
        { status: 400 }
      );
    }

    if (record.attempts >= 5) {
      return NextResponse.json(
        { success: false, message: "تم تجاوز عدد محاولات التحقق، اطلب رمزًا جديدًا" },
        { status: 429 }
      );
    }

    const codeHash = crypto
      .createHash("sha256")
      .update(otp)
      .digest("hex");

    if (codeHash !== record.code_hash) {
      await db.query(
        `UPDATE otp_codes
         SET attempts = attempts + 1
         WHERE id = $1`,
        [record.id]
      );

      return NextResponse.json(
        { success: false, message: "رمز التحقق غير صحيح" },
        { status: 400 }
      );
    }

    await db.query(
      `UPDATE otp_codes
       SET used_at = NOW()
       WHERE id = $1`,
      [record.id]
    );

    return NextResponse.json({
      success: true,
      message: "تم التحقق من رمز OTP بنجاح",
    });
  } catch (error) {
    console.error("OTP verify error:", error);

    return NextResponse.json(
      { success: false, message: "حدث خطأ أثناء التحقق من رمز OTP" },
      { status: 500 }
    );
  }
}
