import { db } from '@/lib/db.js';
import { clinics } from '@/lib/schema.js';
import { eq } from 'drizzle-orm';
import { getSession } from '@/lib/session.js';
import { NextResponse } from 'next/server';

export async function PATCH(request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const allowed = ['pin_receptionist', 'pin_pharmacy', 'name'];
  const update = {};
  for (const key of allowed) {
    if (body[key] !== undefined) update[key] = body[key];
  }

  const updated = await db.update(clinics)
    .set(update)
    .where(eq(clinics.id, session.clinic_id))
    .returning();

  return NextResponse.json(updated[0]);
}

export async function GET(request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const result = await db.select().from(clinics)
    .where(eq(clinics.id, session.clinic_id));

  return NextResponse.json(result[0]);
}