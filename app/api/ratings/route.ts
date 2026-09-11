import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/app/lib/db";
import {
  getSessionCookieName,
  verifySessionToken,
} from "@/lib/auth-session";

async function getAuthenticatedUserId() {
  const cookieStore = await cookies();
  const token = cookieStore.get(getSessionCookieName())?.value;

  if (!token) {
    return null;
  }

  const session = verifySessionToken(token);
  return session?.userId ?? null;
}

export async function GET() {
  try {
    const userId = await getAuthenticatedUserId();

    if (!userId) {
      return NextResponse.json(
        { error: "غير مصرح" },
        { status: 401 }
      );
    }

    const result = await db.query(
      `
        SELECT
          rating,
          comment,
          created_at,
          updated_at
        FROM app_ratings
        WHERE user_id = $1
        LIMIT 1
      `,
      [userId]
    );

    return NextResponse.json({
      rating: result.rows[0] ?? null,
    });
  } catch (error) {
    console.error("GET /api/ratings error:", error);

    return NextResponse.json(
      { error: "حدث خطأ أثناء جلب التقييم" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getAuthenticatedUserId();

    if (!userId) {
      return NextResponse.json(
        { error: "غير مصرح" },
        { status: 401 }
      );
    }

    const body = await request.json();

    const rating = Number(body?.rating);
    const comment =
      typeof body?.comment === "string"
        ? body.comment.trim()
        : "";

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "التقييم يجب أن يكون بين 1 و5 نجوم" },
        { status: 400 }
      );
    }

    if (comment.length > 2000) {
      return NextResponse.json(
        { error: "التعليق طويل جدًا" },
        { status: 400 }
      );
    }

    const result = await db.query(
      `
        INSERT INTO app_ratings (
          user_id,
          rating,
          comment
        )
        VALUES ($1, $2, $3)
        ON CONFLICT (user_id)
        DO UPDATE SET
          rating = EXCLUDED.rating,
          comment = EXCLUDED.comment,
          updated_at = now()
        RETURNING
          rating,
          comment,
          created_at,
          updated_at
      `,
      [userId, rating, comment || null]
    );

    return NextResponse.json({
      success: true,
      rating: result.rows[0],
    });
  } catch (error) {
    console.error("POST /api/ratings error:", error);

    return NextResponse.json(
      { error: "حدث خطأ أثناء حفظ التقييم" },
      { status: 500 }
    );
  }
}
