import { NextResponse } from "next/server";
import { db } from "@/app/lib/db";
import {
  getSessionCookieName,
  verifySessionToken,
} from "@/lib/auth-session";

export async function GET(request: Request) {
  try {
    const cookieHeader = request.headers.get("cookie") || "";

    const cookies = Object.fromEntries(
      cookieHeader
        .split(";")
        .map((item) => item.trim())
        .filter(Boolean)
        .map((item) => {
          const index = item.indexOf("=");

          if (index === -1) {
            return [item, ""];
          }

          return [
            item.slice(0, index),
            decodeURIComponent(item.slice(index + 1)),
          ];
        })
    );

    const sessionToken = cookies[getSessionCookieName()];

    if (!sessionToken) {
      return NextResponse.json(
        {
          success: false,
          authenticated: false,
          message: "غير مسجل الدخول",
        },
        { status: 401 }
      );
    }

    const session = verifySessionToken(sessionToken);

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          authenticated: false,
          message: "جلسة الدخول غير صالحة أو منتهية",
        },
        { status: 401 }
      );
    }

    const result = await db.query(
      `SELECT
         id,
         full_name,
         email,
         phone,
         email_verified
       FROM users
       WHERE id = $1
       LIMIT 1`,
      [session.userId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          authenticated: false,
          message: "المستخدم غير موجود",
        },
        { status: 401 }
      );
    }

    const user = result.rows[0];

    return NextResponse.json({
      success: true,
      authenticated: true,
      user: {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        phone: user.phone,
        emailVerified: user.email_verified,
      },
    });
  } catch (error) {
    console.error("Auth ME API error:", error);

    return NextResponse.json(
      {
        success: false,
        authenticated: false,
        message: "حدث خطأ أثناء التحقق من جلسة الدخول",
      },
      { status: 500 }
    );
  }
}
