import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const clinics = sqliteTable("clinics", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  google_id: text("google_id").notNull().unique(),
  pin_receptionist: text("pin_receptionist").default(""),
  pin_pharmacy: text("pin_pharmacy").default(""),
  pin_psychologist: text("pin_psychologist").default(""),
  has_psychologist: integer("has_psychologist").default(0),
  status: text("status").default("trial"),
  expiry_date: text("expiry_date"),
  active: integer("active").default(0),
  created_at: text("created_at").default(sql`(datetime('now','localtime'))`),
  reminder_sent: integer("reminder_sent").default(0),
  doctor_name: text("doctor_name").default(""),
  qualification: text("qualification").default(""),
  clinic_address: text("clinic_address").default(""),
  clinic_phone: text("clinic_phone").default(""),
  brands: text("brands").default("{}"),
  clinic_logo: text("clinic_logo").default(""),
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
  mse: text("mse").default(""),
  tests: text("tests").default(""),
  medicines: text("medicines").default(""),
  notes: text("notes").default(""),
  followup_date: text("followup_date").default(""),
  status: text("status").default("waiting"),
  reminder_sent: integer("reminder_sent").default(0),
  public_token: text("public_token").default(""),
});

export const assessments = sqliteTable("assessments", {
  id:              integer("id").primaryKey({ autoIncrement: true }),
  prescription_id: integer("prescription_id").notNull(),
  clinic_id:       integer("clinic_id").notNull(),
  mood:            integer("mood"),
  history:         text("history"),
  symptoms:        text("symptoms"),
  notes:           text("notes"),
  created_at:      text("created_at").default(sql`(datetime('now'))`),
  updated_at:      text("updated_at").default(sql`(datetime('now'))`),
});
export const preActivations = sqliteTable('pre_activations', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').notNull().unique(),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
})