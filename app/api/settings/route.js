import { db } from '@/lib/db.js';
import { clinics } from '@/lib/schema.js';
import { eq } from 'drizzle-orm';
import { getSession } from '@/lib/session.js';
import { NextResponse } from 'next/server';

const DEVELOPER_EMAIL = 'prasad.kamta@gmail.com';

async function checkExpiry(session) {
  if (session.expired) return false;
  if (session.email === DEVELOPER_EMAIL) return true;
  if (session.role !== 'doctor') return true;
  const [c] = await db.select().from(clinics).where(eq(clinics.id, session.clinic_id));
  if (!c) return false;
  if (c.active) return true;
  const expiry = c.expiry_date ? new Date(c.expiry_date) : null;
  if (expiry && new Date() < expiry) return true;
  return false;
}

export async function PATCH(request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!(await checkExpiry(session))) return NextResponse.json({ error: 'expired' }, { status: 403 });

  const body = await request.json();
  const allowed = [
    'pin_receptionist', 'pin_pharmacy', 'name',
    'doctor_name', 'qualification', 'clinic_address', 'clinic_phone',
    'clinic_logo',
  ];
  const update = {};
  for (const key of allowed) {
    if (body[key] !== undefined) update[key] = body[key];
  }

  await db.update(clinics).set(update).where(eq(clinics.id, session.clinic_id));
  const [updated] = await db.select().from(clinics).where(eq(clinics.id, session.clinic_id));
  return NextResponse.json(updated);
}

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!(await checkExpiry(session))) return NextResponse.json({ error: 'expired' }, { status: 403 });

  const [result] = await db.select().from(clinics).where(eq(clinics.id, session.clinic_id));
  if (!result) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(result);
}