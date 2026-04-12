import { db } from '@/lib/db.js';
import { prescriptions, patients } from '@/lib/schema.js';
import { eq, and } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const clinic_id = parseInt(searchParams.get('clinic_id'));
  const status = searchParams.get('status');
  const patient_id = searchParams.get('patient_id');

  if (!clinic_id) return NextResponse.json({ error: 'clinic_id required' }, { status: 400 });

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
  const { patient_id, complaints, clinic_id } = await request.json();

  if (!patient_id || !clinic_id) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  const inserted = await db.insert(prescriptions)
    .values({ patient_id, complaints: complaints || '', clinic_id })
    .returning();

  return NextResponse.json(inserted[0]);
}