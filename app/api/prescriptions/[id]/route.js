import { db } from '@/lib/db.js';
import { prescriptions, clinics } from '@/lib/schema.js';
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

export async function GET(request, { params }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  if (!(await checkExpiry(session))) return NextResponse.json({ error: 'expired' }, { status: 403 });

  const { id } = await params;
  const pid = parseInt(id);
  if (!pid) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });

  const result = await db.select().from(prescriptions)
    .where(and(
      eq(prescriptions.id, pid),
      eq(prescriptions.clinic_id, session.clinic_id)
    ));
  if (result.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(result[0]);
}

export async function PATCH(request, { params }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  if (!(await checkExpiry(session))) return NextResponse.json({ error: 'expired' }, { status: 403 });

  const { id } = await params;
  const pid = parseInt(id);
  if (!pid) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });

  const body = await request.json();
  const allowed = ['tests', 'mse', 'medicines', 'notes', 'followup_date', 'status'];
  const update = {};
  for (const key of allowed) {
    if (body[key] !== undefined) update[key] = body[key];
  }

  await db.update(prescriptions)
    .set(update)
    .where(and(
      eq(prescriptions.id, pid),
      eq(prescriptions.clinic_id, session.clinic_id)
    ));

  const [updated] = await db.select().from(prescriptions)
    .where(and(
      eq(prescriptions.id, pid),
      eq(prescriptions.clinic_id, session.clinic_id)
    ));

  if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(updated);
}