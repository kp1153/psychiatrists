import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET);
const DEVELOPER_EMAIL = 'prasad.kamta@gmail.com';

export async function createSession(payload) {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(SECRET);
  return token;
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get('session')?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, SECRET);

    // Whitelist bypass
    if (payload.email === DEVELOPER_EMAIL) return payload;

    // PIN-based roles (receptionist, pharmacy) — no expiry check
    if (payload.role !== 'doctor') return payload;

    // Doctor: check expiry
    if (payload.active) return payload;
    const expiry = payload.expiry_date ? new Date(payload.expiry_date) : null;
    if (expiry && new Date() < expiry) return payload;

    // Expired
    return { expired: true };
  } catch {
    return null;
  }
}

export async function setSessionCookie(token) {
  const cookieStore = await cookies();
  cookieStore.set('session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
    sameSite: 'lax',
  });
}

export function setSessionCookieOnResponse(response, token) {
  response.cookies.set('session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
    sameSite: 'lax',
  });
  return response;
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete('session');
}