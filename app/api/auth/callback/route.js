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

  if (!code || !state || state !== savedState) {
    return NextResponse.redirect(new URL('/login?error=invalid', request.url));
  }

  try {
    const tokens = await google.validateAuthorizationCode(code, codeVerifier);
    const accessToken = tokens.accessToken();

    const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const user = await userRes.json();

    let clinic = await db.select().from(clinics).where(eq(clinics.google_id, user.id));

    if (clinic.length === 0) {
      await db.insert(clinics).values({
        name: user.name,
        email: user.email,
        google_id: user.id,
        active: 0,
      });
      clinic = await db.select().from(clinics).where(eq(clinics.google_id, user.id));
    }

    const token = await createSession({
      clinic_id: clinic[0].id,
      name: clinic[0].name,
      email: clinic[0].email,
      active: clinic[0].active,
      role: 'doctor',
    });

    await setSessionCookie(token);

    // Whitelist — हमेशा allow
    if (clinic[0].email === 'prasad.kamta@gmail.com') {
      return NextResponse.redirect(new URL('/doctor', request.url));
    }

    if (clinic[0].active) {
      return NextResponse.redirect(new URL('/doctor', request.url));
    }

    // Trial check — created_at से 7 दिन
    const createdAt = new Date(clinic[0].created_at.replace(' ', 'T'));
    const diffDays = (new Date() - createdAt) / (1000 * 60 * 60 * 24);

    if (diffDays <= 7) {
      return NextResponse.redirect(new URL('/doctor', request.url));
    }

    return NextResponse.redirect(new URL('/expired', request.url));

  } catch (e) {
    console.error(e);
    return NextResponse.redirect(new URL('/login?error=failed', request.url));
  }
}