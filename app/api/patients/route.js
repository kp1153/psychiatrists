import { db } from '@/lib/db';
import { patients } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const phone = searchParams.get('phone');

  if (phone) {
    const result = await db.select().from(patients).where(eq(patients.phone, phone));
    return NextResponse.json(result);
  }

  const result = await db.select().from(patients).orderBy(patients.id);
  return NextResponse.json(result);
}

export async function POST(request) {
  const body = await request.json();
  const { name, phone } = body;

  if (!name || !phone) {
    return NextResponse.json({ error: 'Name and phone required' }, { status: 400 });
  }

  const existing = await db.select().from(patients).where(eq(patients.phone, phone));

  let patient;
  if (existing.length > 0) {
    patient = existing[0];
  } else {
    const inserted = await db.insert(patients).values({ name, phone }).returning();
    patient = inserted[0];
  }

  return NextResponse.json(patient);
}