import { db } from "@/lib/db.js"
import { clinics, preActivations } from "@/lib/schema.js"
import { eq } from "drizzle-orm"

export async function POST(request) {
  try {
    const authHeader = request.headers.get('authorization')
    const { email, secret } = await request.json()

    const secretValid =
      authHeader === `Bearer ${process.env.HUB_SECRET}` ||
      secret === process.env.HUB_SECRET

    if (!secretValid) {
      return Response.json({ success: false }, { status: 401 })
    }

    if (!email) {
      return Response.json({ error: 'Email required' }, { status: 400 })
    }

    const expiry = new Date()
    expiry.setFullYear(expiry.getFullYear() + 1)

    const existing = await db
      .select()
      .from(clinics)
      .where(eq(clinics.email, email))

    if (existing.length === 0) {
      // Clinic नहीं है — pre_activations में save करो
      try {
        await db.insert(preActivations).values({ email })
      } catch (_) {
        // already exists — ignore
      }
      return Response.json({ success: true, message: 'pre-activated' })
    }

    await db.update(clinics).set({
      status: 'active',
      expiry_date: expiry.toISOString(),
      active: 1,
      reminder_sent: 0,
    }).where(eq(clinics.email, email))

    return Response.json({ success: true })

  } catch (err) {
    console.error('[activate]', err)
    return Response.json({ error: 'Server error' }, { status: 500 })
  }
}