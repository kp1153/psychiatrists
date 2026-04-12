import { db } from '@/lib/db';
import { prescriptions, patients } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const patient_id = searchParams.get('patient_id');

  let query = db
    .select({
      id: prescriptions.id,
      patient_id: prescriptions.patient_id,
      visit_date: prescriptions.visit_date,
      complaints: prescriptions.complaints,
      tests: prescriptions.tests,
      medicines: prescriptions.medicines,
      notes: prescriptions.notes,
      status: prescriptions.status,
      patient_name: patients.name,
      patient_phone: patients.phone,
    })
    .from(prescriptions)
    .innerJoin(patients, eq(prescriptions.patient_id, patients.id));

  const rows = await query;

  let filtered = rows;
  if (status) filtered = filtered.filter(r => r.status === status);
  if (patient_id) filtered = filtered.filter(r => r.patient_id === parseInt(patient_id));

  return NextResponse.json(filtered);
}

export async function POST(request) {
  const body = await request.json();
  const { patient_id, complaints } = body;

  if (!patient_id) {
    return NextResponse.json({ error: 'patient_id required' }, { status: 400 });
  }

  const inserted = await db
    .insert(prescriptions)
    .values({ patient_id, complaints: complaints || '' })
    .returning();

  return NextResponse.json(inserted[0]);
}