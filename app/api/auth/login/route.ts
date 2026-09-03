import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/app/lib/db";
import {
  createSessionToken,
  getSessionCookieName,
  getSessionMaxAge,
} from "@/lib/auth-session";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const login = String(body?.email ?? "").trim();
    const email = login.toLowerCase();

    const password = String(body?.password ?? "");

    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "البريد الإلكتروني وكلمة المرور مطلوبان",
        },
        { status: 400 }
      );
    }

    const result = await db.query(
      `SELECT
         id,
         full_name,
         email,
         password_hash,
         phone,
         email_verified
       FROM users
       WHERE LOWER(email) = LOWER($1)
          OR LOWER(full_name) = LOWER($1)
       LIMIT 1`,
      [email]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "البريد الإلكتروني أو كلمة المرور غير صحيحة",
        },
        { status: 401 }
      );
    }

    const user = result.rows[0];

    const passwordValid = await bcrypt.compare(
      password,
      user.password_hash
    );

    if (!passwordValid) {
      return NextResponse.json(
        {
          success: false,
          message: "البريد الإلكتروني أو كلمة المرور غير صحيحة",
        },
        { status: 401 }
      );
    }

    if (!user.email_verified) {
      return NextResponse.json(
        {
          success: false,
          message: "يجب التحقق من البريد الإلكتروني أولاً",
        },
        { status: 403 }
      );
    }

    const sessionToken = createSessionToken(user.id);

    const response = NextResponse.json({
      success: true,
      message: "تم تسجيل الدخول بنجاح",
      user: {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        phone: user.phone,
        emailVerified: user.email_verified,
      },
    });

    response.cookies.set({
      name: getSessionCookieName(),
      value: sessionToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: getSessionMaxAge(),
    });

    return response;
  } catch (error) {
    console.error("Login API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "حدث خطأ أثناء تسجيل الدخول",
      },
      { status: 500 }
    );
  }
}
