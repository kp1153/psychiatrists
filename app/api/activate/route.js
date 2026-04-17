import { db } from "@/lib/db.js";
import { clinics } from "@/lib/schema.js";
import { eq } from "drizzle-orm";

export async function POST(request) {
  const { email, name, secret } = await request.json();

  if (secret !== process.env.HUB_SECRET) {
    return Response.json({ success: false }, { status: 401 });
  }

  const expiry = new Date();
  expiry.setFullYear(expiry.getFullYear() + 1);

  const existing = await db.select().from(clinics).where(eq(clinics.email, email));

  if (existing.length === 0) {
    return Response.json({ error: "clinic not found" }, { status: 404 });
  }

  await db.update(clinics).set({
    status: "active",
    expiry_date: expiry.toISOString(),
    active: 1,
    reminder_sent: 0,
  }).where(eq(clinics.email, email));

  return Response.json({ success: true });
}