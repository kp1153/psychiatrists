import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const clinics = sqliteTable("clinics", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  google_id: text("google_id").notNull().unique(),
  pin_receptionist: text("pin_receptionist").default("1234"),
  pin_pharmacy: text("pin_pharmacy").default("5678"),
  status: text("status").default("trial"),
  expiry_date: text("expiry_date"),
  active: integer("active").default(0),
  created_at: text("created_at").default(sql`(datetime('now','localtime'))`),
  reminder_sent: integer("reminder_sent").default(0),
});

export const patients = sqliteTable("patients", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  clinic_id: integer("clinic_id")
    .notNull()
    .references(() => clinics.id),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  created_at: text("created_at").default(sql`(datetime('now','localtime'))`),
});

export const prescriptions = sqliteTable("prescriptions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  clinic_id: integer("clinic_id")
    .notNull()
    .references(() => clinics.id),
  patient_id: integer("patient_id")
    .notNull()
    .references(() => patients.id),
  visit_date: text("visit_date").default(sql`(datetime('now','localtime'))`),
  complaints: text("complaints").default(""),
  tests: text("tests").default(""),
  medicines: text("medicines").default(""),
  notes: text("notes").default(""),
  followup_date: text("followup_date").default(""),
  status: text("status").default("pending"),
  reminder_sent: integer("reminder_sent").default(0),
});