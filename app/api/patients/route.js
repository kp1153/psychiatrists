import { db } from '@/lib/db.js';
import { patients, clinics } from '@/lib/schema.js';
import { eq, and } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session.js';

const DEVELOPER_EMAIL = 'prasad.kamta@gmail.com';

async function checkExpiry(session) {
  if (session.email === DEVELOPER_EMAIL) return true;
  if (session.role !== 'doctor') return true;
  const [c] = await db.select().from(clinics).where(eq(clinics.id, session.clinic_id));
  if (!c) return false;
  if (c.active) return true;
  const expiry = c.expiry_date ? new Date(c.expiry_date) : null;
  if (expiry && new Date() < expiry) return true;
  return false;
}

export async function GET(request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  if (!(await checkExpiry(session))) return NextResponse.json({ error: 'expired' }, { status: 403 });

  const clinic_id = session.clinic_id;
  const { searchParams } = new URL(request.url);
  const phone = searchParams.get('phone');

  if (phone) {
    const result = await db.select().from(patients)
      .where(and(eq(patients.clinic_id, clinic_id), eq(patients.phone, phone)));
    return NextResponse.json(result);
  }

  const result = await db.select().from(patients)
    .where(eq(patients.clinic_id, clinic_id));
  return NextResponse.json(result);
}

export async function POST(request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  if (!(await checkExpiry(session))) return NextResponse.json({ error: 'expired' }, { status: 403 });

  const clinic_id = session.clinic_id;
  const { name, phone } = await request.json();

  if (!name || !phone) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  const existing = await db.select().from(patients)
    .where(and(eq(patients.clinic_id, clinic_id), eq(patients.phone, phone)));

  let patient;
  if (existing.length > 0) {
    patient = existing[0];
  } else {
    const result = await db.insert(patients)
      .values({ name, phone, clinic_id });
    const [inserted] = await db.select().from(patients)
      .where(and(eq(patients.clinic_id, clinic_id), eq(patients.phone, phone)));
    patient = inserted;
  }

  return NextResponse.json(patient);
}