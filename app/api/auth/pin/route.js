import { db } from '@/lib/db.js';
import { clinics } from '@/lib/schema.js';
import { eq } from 'drizzle-orm';
import { SignJWT } from 'jose';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

export async function POST(request) {
  const { clinic_id, pin, role } = await request.json();

  if (!clinic_id || !pin || !role) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  const result = await db.select().from(clinics).where(eq(clinics.id, parseInt(clinic_id)));
  if (result.length === 0) {
    return NextResponse.json({ error: 'Clinic not found' }, { status: 404 });
  }

  const clinic = result[0];

  if (!clinic.active) {
    return NextResponse.json({ error: 'Clinic inactive' }, { status: 403 });
  }

  const field = role === 'receptionist' ? 'pin_receptionist' : 'pin_pharmacy';
  if (clinic[field] !== pin) {
    return NextResponse.json({ error: 'Wrong PIN' }, { status: 401 });
  }

  const token = await new SignJWT({ clinic_id: clinic.id, role })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('12h')
    .sign(SECRET);

  const cookieStore = await cookies();
  const cookieName = role === 'receptionist' ? 'receptionist_session' : 'pharmacy_session';
  cookieStore.set(cookieName, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 12,
    path: '/',
  });

  return NextResponse.json({ success: true });
}