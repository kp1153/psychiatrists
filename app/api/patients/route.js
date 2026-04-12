import { db } from '@/lib/db.js';
import { patients } from '@/lib/schema.js';
import { eq, and } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const clinic_id = parseInt(searchParams.get('clinic_id'));
  const phone = searchParams.get('phone');

  if (!clinic_id) return NextResponse.json({ error: 'clinic_id required' }, { status: 400 });

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
  const { name, phone, clinic_id } = await request.json();

  if (!name || !phone || !clinic_id) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  const existing = await db.select().from(patients)
    .where(and(eq(patients.clinic_id, clinic_id), eq(patients.phone, phone)));

  let patient;
  if (existing.length > 0) {
    patient = existing[0];
  } else {
    const inserted = await db.insert(patients)
      .values({ name, phone, clinic_id })
      .returning();
    patient = inserted[0];
  }

  return NextResponse.json(patient);
}