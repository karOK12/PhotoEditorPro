import { cookies } from "next/headers";

export const dynamic = "force-dynamic";
import HomeClient from "./HomeClient";
import {
  COOKIE_NAME as REGISTRATION_COOKIE_NAME,
  verifyRegistrationStatusToken,
} from "@/lib/registration-status";

export default async function Home() {
  const cookieStore = await cookies();
  const registrationToken = cookieStore.get(REGISTRATION_COOKIE_NAME)?.value;

  const registrationUserId = registrationToken
    ? verifyRegistrationStatusToken(registrationToken)
    : null;

  return (
    <HomeClient
      initialRegistrationCompleted={Boolean(registrationUserId)}
    />
  );
}
