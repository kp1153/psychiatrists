import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const patients = sqliteTable('patients', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  phone: text('phone').notNull(),
  created_at: text('created_at').default(sql`(datetime('now','localtime'))`),
});

export const prescriptions = sqliteTable('prescriptions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  patient_id: integer('patient_id').notNull().references(() => patients.id),
  visit_date: text('visit_date').default(sql`(datetime('now','localtime'))`),
  complaints: text('complaints').default(''),
  tests: text('tests').default(''),       // doctor fills
  medicines: text('medicines').default(''), // doctor fills — JSON string
  notes: text('notes').default(''),
  status: text('status').default('pending'), // pending | doctor_done | dispensed
  reminder_sent: integer('reminder_sent').default(0),
});