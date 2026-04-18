import { db } from '@/lib/db.js';
import { prescriptions, clinics, patients } from '@/lib/schema.js';
import { eq } from 'drizzle-orm';
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
  const status = searchParams.get('status');
  const patient_id = searchParams.get('patient_id');

  const rows = await db.select({
    id: prescriptions.id,
    clinic_id: prescriptions.clinic_id,
    patient_id: prescriptions.patient_id,
    visit_date: prescriptions.visit_date,
    complaints: prescriptions.complaints,
    tests: prescriptions.tests,
    medicines: prescriptions.medicines,
    notes: prescriptions.notes,
    followup_date: prescriptions.followup_date,
    status: prescriptions.status,
    patient_name: patients.name,
    patient_phone: patients.phone,
  })
    .from(prescriptions)
    .innerJoin(patients, eq(prescriptions.patient_id, patients.id))
    .where(eq(prescriptions.clinic_id, clinic_id));

  let filtered = rows;
  if (status) filtered = filtered.filter(r => r.status === status);
  if (patient_id) filtered = filtered.filter(r => r.patient_id === parseInt(patient_id));

  return NextResponse.json(filtered);
}

export async function POST(request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  if (!(await checkExpiry(session))) return NextResponse.json({ error: 'expired' }, { status: 403 });

  const clinic_id = session.clinic_id;
  const { patient_id, complaints } = await request.json();

  if (!patient_id) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  const result = await db.insert(prescriptions)
    .values({ patient_id, complaints: complaints || '', clinic_id });

  return NextResponse.json({ id: Number(result.lastInsertRowid), patient_id, complaints: complaints || '', clinic_id });
}