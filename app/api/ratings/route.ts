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

  if (!token) return null;

  const session = verifySessionToken(token);
  return session?.userId ?? null;
}

export async function GET() {
  try {
    const userId = await getAuthenticatedUserId();

    if (!userId) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const [userRatingResult, ratingsResult, statsResult] = await Promise.all([
      db.query(
        `
        SELECT
          r.id,
          r.rating,
          r.comment,
          r.created_at,
          r.updated_at,
          u.full_name
        FROM app_ratings r
        INNER JOIN users u ON u.id = r.user_id
        WHERE r.user_id = $1
        LIMIT 1
        `,
        [userId]
      ),

      db.query(
        `
        SELECT
          r.id,
          r.rating,
          r.comment,
          r.created_at,
          r.updated_at,
          u.full_name,
          CASE WHEN r.user_id = $1 THEN true ELSE false END AS is_owner
        FROM app_ratings r
        INNER JOIN users u ON u.id = r.user_id
        ORDER BY r.created_at DESC
        `,
        [userId]
      ),

      db.query(
        `
        SELECT
          COUNT(*)::int AS total,
          COALESCE(ROUND(AVG(rating)::numeric, 1), 0) AS average,
          COUNT(*) FILTER (WHERE rating = 5)::int AS five,
          COUNT(*) FILTER (WHERE rating = 4)::int AS four,
          COUNT(*) FILTER (WHERE rating = 3)::int AS three,
          COUNT(*) FILTER (WHERE rating = 2)::int AS two,
          COUNT(*) FILTER (WHERE rating = 1)::int AS one
        FROM app_ratings
        `
      ),
    ]);

    return NextResponse.json({
      rating: userRatingResult.rows[0] ?? null,
      ratings: ratingsResult.rows,
      stats: statsResult.rows[0] ?? {
        total: 0,
        average: 0,
        five: 0,
        four: 0,
        three: 0,
        two: 0,
        one: 0,
      },
    });
  } catch (error) {
    console.error("GET /api/ratings error:", error);

    return NextResponse.json(
      { error: "حدث خطأ أثناء جلب التقييمات" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getAuthenticatedUserId();

    if (!userId) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
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
        id,
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

export async function DELETE() {
  try {
    const userId = await getAuthenticatedUserId();

    if (!userId) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const result = await db.query(
      `
      DELETE FROM app_ratings
      WHERE user_id = $1
      RETURNING id
      `,
      [userId]
    );

    if (result.rowCount === 0) {
      return NextResponse.json(
        { error: "لا يوجد تقييم لحذفه" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("DELETE /api/ratings error:", error);

    return NextResponse.json(
      { error: "حدث خطأ أثناء حذف التقييم" },
      { status: 500 }
    );
  }
}
