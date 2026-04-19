import { db } from '@/lib/db.js';
import { clinics } from '@/lib/schema.js';
import { eq } from 'drizzle-orm';
import { getSession } from '@/lib/session.js';
import { NextResponse } from 'next/server';

async function getClinic(clinic_id) {
  const [c] = await db.select().from(clinics).where(eq(clinics.id, clinic_id));
  return c;
}

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const clinic = await getClinic(session.clinic_id);
  if (!clinic) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  let brands = {};
  try { brands = JSON.parse(clinic.brands || '{}'); } catch { brands = {}; }

  return NextResponse.json({ brands });
}

export async function PATCH(request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Only pharmacy role can update brands
  if (session.role !== 'pharmacy' && session.role !== 'doctor') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json();
  // body.brands = { "Olanzapine 5mg": "Oleanz 5", ... }
  if (!body.brands || typeof body.brands !== 'object') {
    return NextResponse.json({ error: 'Invalid brands' }, { status: 400 });
  }

  await db.update(clinics)
    .set({ brands: JSON.stringify(body.brands) })
    .where(eq(clinics.id, session.clinic_id));

  return NextResponse.json({ ok: true, brands: body.brands });
}