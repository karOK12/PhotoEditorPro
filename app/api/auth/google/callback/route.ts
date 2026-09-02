import { NextResponse } from "next/server";
import { OAuth2Client } from "google-auth-library";
import crypto from "crypto";
import { db } from "@/app/lib/db";
import {
  createSessionToken,
  getSessionCookieName,
  getSessionMaxAge,
} from "@/lib/auth-session";

const REDIRECT_URI =
  "https://www.photoeditorpro.click/api/auth/google/callback";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");

  if (error) {
    return NextResponse.redirect(
      new URL("/?google_error=cancelled", request.url)
    );
  }

  if (!code) {
    return NextResponse.redirect(
      new URL("/?google_error=missing_code", request.url)
    );
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.error("Google OAuth credentials are not configured");

    return NextResponse.redirect(
      new URL("/?google_error=server_config", request.url)
    );
  }

  const oauthClient = new OAuth2Client(
    clientId,
    clientSecret,
    REDIRECT_URI
  );

  try {
    const { tokens } = await oauthClient.getToken(code);

    if (!tokens.id_token) {
      throw new Error("Google did not return an ID token");
    }

    const ticket = await oauthClient.verifyIdToken({
      idToken: tokens.id_token,
      audience: clientId,
    });

    const payload = ticket.getPayload();

    if (!payload?.sub || !payload.email) {
      throw new Error("Invalid Google account data");
    }

    const googleId = payload.sub;
    const googleEmail = payload.email.trim().toLowerCase();

    const googleName =
      payload.name?.trim() ||
      payload.email.split("@")[0] ||
      "Google User";

    const googleEmailVerified =
      payload.email_verified === true;

    const client = await db.connect();

    try {
      await client.query("BEGIN");

      // البحث عن حساب Google مربوط مسبقاً
      const oauthResult = await client.query(
        `SELECT user_id
         FROM user_oauth_accounts
         WHERE provider = 'google'
           AND provider_account_id = $1
         LIMIT 1`,
        [googleId]
      );

      let userId: string;

      if (oauthResult.rows.length > 0) {
        // الحساب مربوط مسبقاً
        userId = oauthResult.rows[0].user_id;

        await client.query(
          `UPDATE user_oauth_accounts
           SET provider_email = $1,
               updated_at = NOW()
           WHERE provider = 'google'
             AND provider_account_id = $2`,
          [googleEmail, googleId]
        );
      } else {
        // البحث عن مستخدم موجود بنفس البريد
        const existingUser = await client.query(
          `SELECT id
           FROM users
           WHERE LOWER(email) = $1
           LIMIT 1`,
          [googleEmail]
        );

        if (existingUser.rows.length > 0) {
          // ربط Google بالحساب الموجود
          userId = existingUser.rows[0].id;

          await client.query(
            `UPDATE users
             SET email_verified = CASE
               WHEN $2 = TRUE THEN TRUE
               ELSE email_verified
             END,
             updated_at = NOW()
             WHERE id = $1`,
            [userId, googleEmailVerified]
          );
        } else {
          // إنشاء حساب جديد بواسطة Google
          const randomPassword = crypto
            .randomBytes(32)
            .toString("hex");

          const userResult = await client.query(
            `INSERT INTO users (
               full_name,
               email,
               password_hash,
               phone,
               email_verified
             )
             VALUES ($1, $2, $3, NULL, $4)
             RETURNING id`,
            [
              googleName,
              googleEmail,
              randomPassword,
              googleEmailVerified,
            ]
          );

          userId = userResult.rows[0].id;

          // إنشاء ملف شخصي فارغ
          await client.query(
            `INSERT INTO user_profiles (user_id)
             VALUES ($1)
             ON CONFLICT (user_id) DO NOTHING`,
            [userId]
          );
        }

        // ربط حساب Google بالمستخدم
        await client.query(
          `INSERT INTO user_oauth_accounts (
             user_id,
             provider,
             provider_account_id,
             provider_email
           )
           VALUES ($1, 'google', $2, $3)
           ON CONFLICT (provider, provider_account_id)
           DO UPDATE SET
             provider_email = EXCLUDED.provider_email,
             updated_at = NOW()`,
          [userId, googleId, googleEmail]
        );
      }

      await client.query("COMMIT");

      // إنشاء Session بنفس نظام تسجيل الدخول العادي
      const sessionToken = createSessionToken(userId);

      const response = NextResponse.redirect(
        new URL("/", request.url)
      );

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
    } catch (dbError) {
      await client.query("ROLLBACK");
      throw dbError;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Google OAuth callback error:", error);

    return NextResponse.redirect(
      new URL("/?google_error=oauth_failed", request.url)
    );
  }
}