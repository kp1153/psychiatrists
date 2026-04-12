import { db } from '@/lib/db.js';
import { prescriptions } from '@/lib/schema.js';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  const { id } = await params;
  const result = await db.select().from(prescriptions)
    .where(eq(prescriptions.id, parseInt(id)));
  if (result.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(result[0]);
}

export async function PATCH(request, { params }) {
  const { id } = await params;
  const body = await request.json();
  const updated = await db.update(prescriptions)
    .set(body)
    .where(eq(prescriptions.id, parseInt(id)))
    .returning();
  return NextResponse.json(updated[0]);
}