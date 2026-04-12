import { clearSession } from '@/lib/session.js';
import { NextResponse } from 'next/server';

export async function GET(request) {
  await clearSession();
  return NextResponse.redirect(new URL('/login', request.url));
}