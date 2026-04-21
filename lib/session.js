import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET);
const DEVELOPER_EMAIL = 'prasad.kamta@gmail.com';

const ROLE_COOKIES = {
  doctor:       'session',
  receptionist: 'receptionist_session',
  pharmacy:     'pharmacy_session',
  psychologist: 'psychologist_session',
};

export async function createSession(payload) {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(SECRET);
  return token;
}

export async function getSession() {
  const cookieStore = await cookies();

  for (const [role, cookieName] of Object.entries(ROLE_COOKIES)) {
    const token = cookieStore.get(cookieName)?.value;
    if (!token) continue;

    try {
      const { payload } = await jwtVerify(token, SECRET);

      if (payload.role !== role) continue;

      if (payload.email === DEVELOPER_EMAIL) return payload;

      if (role !== 'doctor') return payload;

      if (payload.active) return payload;
      const expiry = payload.expiry_date ? new Date(payload.expiry_date) : null;
      if (expiry && new Date() < expiry) return payload;

      return { expired: true };
    } catch {
      continue;
    }
  }

  return null;
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
  for (const cookieName of Object.values(ROLE_COOKIES)) {
    cookieStore.delete(cookieName);
  }
}