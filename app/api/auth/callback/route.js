import { google } from '@/lib/google.js';
import { db } from '@/lib/db.js';
import { clinics } from '@/lib/schema.js';
import { createSession, setSessionCookie } from '@/lib/session.js';
import { eq } from 'drizzle-orm';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');

  const cookieStore = await cookies();
  const savedState = cookieStore.get('google_state')?.value;
  const codeVerifier = cookieStore.get('google_code_verifier')?.value;

  if (!code || !state || !savedState || state !== savedState) {
    return NextResponse.redirect(new URL('/login?error=invalid', request.url));
  }

  try {
    const tokens = await google.validateAuthorizationCode(code, codeVerifier);
    const accessToken = tokens.accessToken();

    const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const user = await userRes.json();

    let [clinic] = await db.select().from(clinics).where(eq(clinics.google_id, user.id));

    if (!clinic) {
      const expiry = new Date();
      expiry.setDate(expiry.getDate() + 7);
      await db.insert(clinics).values({
        name: user.name,
        email: user.email,
        google_id: user.id,
        status: 'trial',
        expiry_date: expiry.toISOString(),
        active: 0,
      });
      [clinic] = await db.select().from(clinics).where(eq(clinics.google_id, user.id));
    }

    const token = await createSession({
      clinic_id: clinic.id,
      name: clinic.name,
      email: clinic.email,
      active: clinic.active,
      status: clinic.status,
      expiry_date: clinic.expiry_date,
      role: 'doctor',
    });

    await setSessionCookie(token);

    if (clinic.email === 'prasad.kamta@gmail.com') {
      return NextResponse.redirect(new URL('/doctor', request.url));
    }

    if (clinic.active) {
      return NextResponse.redirect(new URL('/doctor', request.url));
    }

    const expiry = clinic.expiry_date ? new Date(clinic.expiry_date) : null;
    if (expiry && new Date() < expiry) {
      return NextResponse.redirect(new URL('/doctor', request.url));
    }

    return NextResponse.redirect(new URL('/expired', request.url));

  } catch (e) {
    console.error(e);
    return NextResponse.redirect(new URL('/login?error=failed', request.url));
  }
}