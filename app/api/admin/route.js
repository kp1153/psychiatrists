import { db } from '@/lib/db.js';
import { clinics } from '@/lib/schema.js';
import { getSession } from '@/lib/session.js';
import { NextResponse } from 'next/server';

const DEVELOPER_EMAIL = 'prasad.kamta@gmail.com';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.email !== DEVELOPER_EMAIL) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const all = await db.select({
    id: clinics.id,
    name: clinics.name,
    email: clinics.email,
    status: clinics.status,
    active: clinics.active,
    expiry_date: clinics.expiry_date,
    created_at: clinics.created_at,
  }).from(clinics);

  const total = all.length;
  const activeCount = all.filter(c => c.active === 1).length;
  const trialCount = all.filter(c => c.active === 0).length;

  return NextResponse.json({ total, activeCount, trialCount, clinics: all });
}