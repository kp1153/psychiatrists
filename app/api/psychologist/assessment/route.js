import { db } from '@/lib/db.js';
import { prescriptions, patients, assessments } from '@/lib/schema.js';
import { eq, and } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session.js';

export async function GET(request) {
  const session = await getSession();
  if (!session || session.role !== 'psychologist')
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const prescription_id = parseInt(searchParams.get('prescription_id'));
  if (!prescription_id)
    return NextResponse.json({ error: 'Missing prescription_id' }, { status: 400 });

  const rows = await db.select({
    id: prescriptions.id,
    patient_id: prescriptions.patient_id,
    complaints: prescriptions.complaints,
    status: prescriptions.status,
    patient_name: patients.name,
    patient_phone: patients.phone,
  })
    .from(prescriptions)
    .innerJoin(patients, eq(prescriptions.patient_id, patients.id))
    .where(and(
      eq(prescriptions.id, prescription_id),
      eq(prescriptions.clinic_id, session.clinic_id)
    ));

  if (rows.length === 0)
    return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // Fetch existing assessment if any
  const existing = await db.select()
    .from(assessments)
    .where(and(
      eq(assessments.prescription_id, prescription_id),
      eq(assessments.clinic_id, session.clinic_id)
    ));

  return NextResponse.json({
    prescription: rows[0],
    assessment: existing.length > 0 ? existing[0] : null,
  });
}

export async function POST(request) {
  const session = await getSession();
  if (!session || session.role !== 'psychologist')
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const { prescription_id, mood, history, symptoms, notes } = await request.json();
  if (!prescription_id)
    return NextResponse.json({ error: 'Missing prescription_id' }, { status: 400 });

  // Upsert — पहले check करो exist करता है क्या
  const existing = await db.select()
    .from(assessments)
    .where(and(
      eq(assessments.prescription_id, prescription_id),
      eq(assessments.clinic_id, session.clinic_id)
    ));

  if (existing.length > 0) {
    await db.update(assessments)
      .set({ mood, history, symptoms, notes, updated_at: new Date().toISOString() })
      .where(eq(assessments.id, existing[0].id));
  } else {
    await db.insert(assessments)
      .values({
        prescription_id,
        clinic_id: session.clinic_id,
        mood,
        history,
        symptoms,
        notes,
      });
  }

  return NextResponse.json({ success: true });
}