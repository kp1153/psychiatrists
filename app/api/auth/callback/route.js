import { google } from "@/lib/google.js";
import { db } from "@/lib/db.js";
import { clinics } from "@/lib/schema.js";
import { createSession, setSessionCookieOnResponse } from "@/lib/session.js";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");

  const cookieStore = await cookies();
  const savedState = cookieStore.get("google_state")?.value;
  const codeVerifier = cookieStore.get("google_code_verifier")?.value;

  if (!code || !state || !savedState || state !== savedState) {
    return NextResponse.redirect(new URL("/login?error=invalid", request.url));
  }

  try {
    const tokens = await google.validateAuthorizationCode(code, codeVerifier);
    const accessToken = tokens.accessToken();

    // सुधारा हुआ fetch यहाँ है
    const userRes = await fetch(
      "https://openidconnect.googleapis.com/v1/userinfo",
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );

    const user = await userRes.json();

    let [clinic] = await db
      .select()
      .from(clinics)
      .where(eq(clinics.google_id, user.id || user.sub)); // Google ID अक्सर 'sub' फील्ड में होती है

    if (!clinic) {
      const expiry = new Date();
      expiry.setDate(expiry.getDate() + 7);
      await db.insert(clinics).values({
        name: user.name,
        email: user.email,
        google_id: user.id || user.sub,
        status: "trial",
        expiry_date: expiry.toISOString(),
        active: 0,
      });
      [clinic] = await db
        .select()
        .from(clinics)
        .where(eq(clinics.google_id, user.id || user.sub));
    }

    const token = await createSession({
      clinic_id: clinic.id,
      name: clinic.name,
      email: clinic.email,
      active: clinic.active,
      status: clinic.status,
      expiry_date: clinic.expiry_date,
      role: "doctor",
    });

    if (clinic.email === "prasad.kamta@gmail.com") {
      const response = NextResponse.redirect(new URL("/doctor", request.url));
      return setSessionCookieOnResponse(response, token);
    }

    if (clinic.active) {
      const response = NextResponse.redirect(new URL("/doctor", request.url));
      return setSessionCookieOnResponse(response, token);
    }

    const expiry = clinic.expiry_date ? new Date(clinic.expiry_date) : null;
    if (expiry && new Date() < expiry) {
      const response = NextResponse.redirect(new URL("/doctor", request.url));
      return setSessionCookieOnResponse(response, token);
    }

    const response = NextResponse.redirect(new URL("/expired", request.url));
    return setSessionCookieOnResponse(response, token);
  } catch (e) {
    console.error("Auth Callback Error:", e);
    return NextResponse.redirect(new URL("/login?error=failed", request.url));
  }
}
