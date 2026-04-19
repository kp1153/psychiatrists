import { db } from '@/lib/db.js';
import { prescriptions, patients, clinics } from '@/lib/schema.js';
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

  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('mode') || 'today';

  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);

  const rows = await db.select({
    prescription_id: prescriptions.id,
    followup_date: prescriptions.followup_date,
    visit_date: prescriptions.visit_date,
    patient_id: prescriptions.patient_id,
    patient_name: patients.name,
    patient_phone: patients.phone,
    clinic_name: clinics.name,
  })
    .from(prescriptions)
    .innerJoin(patients, eq(prescriptions.patient_id, patients.id))
    .innerJoin(clinics, eq(prescriptions.clinic_id, clinics.id))
    .where(eq(prescriptions.clinic_id, session.clinic_id));

  let filtered = rows.filter((r) => r.followup_date && r.followup_date !== '');

  if (mode === 'today') {
    filtered = filtered.filter((r) => r.followup_date === todayStr);
  } else if (mode === 'upcoming') {
    filtered = filtered.filter((r) => r.followup_date >= todayStr);
  } else if (mode === 'overdue') {
    filtered = filtered.filter((r) => r.followup_date < todayStr);
  }

  filtered.sort((a, b) => (a.followup_date > b.followup_date ? 1 : -1));

  return NextResponse.json(filtered);
}