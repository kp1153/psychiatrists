import { db } from '@/lib/db.js';
import { prescriptions, patients, clinics } from '@/lib/schema.js';
import { eq, and } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function GET(request) {
  const secret = request.headers.get('x-cron-secret');
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const today = new Date().toISOString().slice(0, 10);

  const due = await db.select({
    prescription_id: prescriptions.id,
    followup_date: prescriptions.followup_date,
    patient_name: patients.name,
    patient_phone: patients.phone,
    clinic_name: clinics.name,
  })
    .from(prescriptions)
    .innerJoin(patients, eq(prescriptions.patient_id, patients.id))
    .innerJoin(clinics, eq(prescriptions.clinic_id, clinics.id))
    .where(
      and(
        eq(prescriptions.followup_date, today),
        eq(prescriptions.reminder_sent, 0)
      )
    );

  for (const row of due) {
    // TODO: replace with Fast2SMS API call
    console.log(`SMS to ${row.patient_phone}: Dear ${row.patient_name}, your follow-up at ${row.clinic_name} is today.`);

    await db.update(prescriptions)
      .set({ reminder_sent: 1 })
      .where(eq(prescriptions.id, row.prescription_id));
  }

  return NextResponse.json({ sent: due.length, date: today });
}