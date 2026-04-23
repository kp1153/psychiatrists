import { google } from "@/lib/google.js"
import { db } from "@/lib/db.js"
import { clinics, preActivations } from "@/lib/schema.js"
import { createSession, setSessionCookieOnResponse } from "@/lib/session.js"
import { eq } from "drizzle-orm"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get("code")
  const state = searchParams.get("state")

  const cookieStore = await cookies()
  const savedState = cookieStore.get("google_state")?.value
  const codeVerifier = cookieStore.get("google_code_verifier")?.value

  if (!code || !state || !savedState || state !== savedState) {
    return NextResponse.redirect(new URL("/login?error=invalid", request.url))
  }

  try {
    const tokens = await google.validateAuthorizationCode(code, codeVerifier)
    const accessToken = tokens.accessToken()

    const userRes = await fetch(
      "https://openidconnect.googleapis.com/v1/userinfo",
      { headers: { Authorization: `Bearer ${accessToken}` } }
    )

    const user = await userRes.json()
    const googleId = String(user.sub || user.id)

    let [clinic] = await db
      .select()
      .from(clinics)
      .where(eq(clinics.google_id, googleId))

    if (!clinic) {
      const expiry = new Date()
      expiry.setDate(expiry.getDate() + 7)

      await db.insert(clinics).values({
        name: user.name,
        email: user.email,
        google_id: googleId,
        status: 'trial',
        expiry_date: expiry.toISOString(),
        active: 0,
      })

      // pre_activations check — पहले pay किया, बाद में login
      const preAct = await db
        .select()
        .from(preActivations)
        .where(eq(preActivations.email, user.email))
        .limit(1)

      if (preAct.length > 0) {
        const newExpiry = new Date()
        newExpiry.setFullYear(newExpiry.getFullYear() + 1)

        await db.update(clinics).set({
          status: 'active',
          expiry_date: newExpiry.toISOString(),
          active: 1,
          reminder_sent: 0,
        }).where(eq(clinics.email, user.email))

        await db
          .delete(preActivations)
          .where(eq(preActivations.email, user.email))
      }

      ;[clinic] = await db
        .select()
        .from(clinics)
        .where(eq(clinics.google_id, googleId))
    }

    const token = await createSession({
      clinic_id: clinic.id,
      name: clinic.name,
      email: clinic.email,
      active: clinic.active,
      status: clinic.status,
      expiry_date: clinic.expiry_date,
      role: 'doctor',
    })

    // 1. Whitelist
    if (clinic.email === 'prasad.kamta@gmail.com') {
      const response = NextResponse.redirect(new URL('/doctor', request.url))
      return setSessionCookieOnResponse(response, token)
    }

    // 2. Active
    if (clinic.active) {
      const response = NextResponse.redirect(new URL('/doctor', request.url))
      return setSessionCookieOnResponse(response, token)
    }

    // 3. Trial
    const expiry = clinic.expiry_date ? new Date(clinic.expiry_date) : null
    if (expiry && new Date() < expiry) {
      const response = NextResponse.redirect(new URL('/doctor', request.url))
      return setSessionCookieOnResponse(response, token)
    }

    // 4. Expired
    const response = NextResponse.redirect(new URL('/expired', request.url))
    return setSessionCookieOnResponse(response, token)

  } catch (e) {
    console.error('Auth Callback Error:', e)
    return NextResponse.redirect(new URL('/login?error=failed', request.url))
  }
}