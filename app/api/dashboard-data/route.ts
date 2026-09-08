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
          message: "غير مصرح بالدخول",
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
          message: "جلسة الدخول غير صالحة",
        },
        { status: 401 }
      );
    }

    const result = await db.query(
      `SELECT
         u.id,
         u.full_name,
         u.email,
         u.phone,
         u.email_verified,
         u.registration_completed,
         p.birth_day,
         p.birth_month,
         p.birth_year,
         p.country_code,
         p.city,
         p.state,
         p.zip,
         p.id_type,
         p.id_name,
         p.id_number,
         p.profile_image,
         p.id_image
       FROM users u
       LEFT JOIN user_profiles p
         ON p.user_id = u.id
       WHERE u.id = $1
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
        { status: 404 }
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
        registrationCompleted: user.registration_completed,

        profile: {
          birthDay: user.birth_day,
          birthMonth: user.birth_month,
          birthYear: user.birth_year,
          countryCode: user.country_code,
          city: user.city,
          state: user.state,
          zip: user.zip,
          idType: user.id_type,
          idName: user.id_name,
          idNumber: user.id_number,
          profileImage: user.profile_image,
          idImage: user.id_image,
        },
      },
    });
  } catch (error) {
    console.error("Dashboard Data API error:", error);

    return NextResponse.json(
      {
        success: false,
        authenticated: false,
        message: "حدث خطأ أثناء جلب بيانات المستخدم",
      },
      { status: 500 }
    );
  }
}
