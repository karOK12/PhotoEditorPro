import { NextResponse } from "next/server";
import { db } from "@/app/lib/db";
import {
  getSessionCookieName,
  verifySessionToken,
} from "@/lib/auth-session";
import {
  COOKIE_NAME as REGISTRATION_COOKIE_NAME,
  verifyRegistrationStatusToken,
} from "@/lib/registration-status";

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

    const registrationToken = cookies[REGISTRATION_COOKIE_NAME];
    const registrationUserId = registrationToken
      ? verifyRegistrationStatusToken(registrationToken)
      : null;

    if (!sessionToken) {
      return NextResponse.json({
        success: true,
        authenticated: false,
        registrationCompleted: Boolean(registrationUserId),
      });
    }

    const session = verifySessionToken(sessionToken);

    if (!session) {
      return NextResponse.json({
        success: true,
        authenticated: false,
        registrationCompleted: Boolean(registrationUserId),
      });
    }

    const result = await db.query(
      `SELECT
         id,
         full_name,
         email,
         phone,
         email_verified,
         registration_completed
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
      registrationCompleted:
        user.registration_completed === true ||
        registrationUserId === user.id,
      user: {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        phone: user.phone,
        emailVerified: user.email_verified,
        registrationCompleted: user.registration_completed,
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
