import { cookies } from "next/headers";
import HomeClient from "./HomeClient";
import { db } from "@/app/lib/db";
import {
  getSessionCookieName,
  verifySessionToken,
} from "@/lib/auth-session";

export const dynamic = "force-dynamic";

export default async function Home() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(getSessionCookieName())?.value;

  let registrationCompleted = false;

  if (sessionToken) {
    const session = verifySessionToken(sessionToken);

    if (session) {
      try {
        const result = await db.query(
          `SELECT registration_completed
           FROM users
           WHERE id = $1
           LIMIT 1`,
          [session.userId]
        );

        registrationCompleted =
          result.rows.length > 0 &&
          result.rows[0].registration_completed === true;
      } catch (error) {
        console.error("Home auth state error:", error);
        registrationCompleted = false;
      }
    }
  }

  return (
    <HomeClient
      initialRegistrationCompleted={registrationCompleted}
    />
  );
}
