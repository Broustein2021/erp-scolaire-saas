import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  integer,
  numeric,
  date,
  primaryKey,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ── Organizations ────────────────────────────────────────────────
// Le client SaaS qui paie l'abonnement (peut gérer 1 ou plusieurs écoles).
export const organizations = pgTable("organizations", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  plan: text("plan").notNull().default("free"), // free | starter | pro | enterprise
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// ── Schools ──────────────────────────────────────────────────────
// Un établissement physique rattaché à une organisation.
export const schools = pgTable("schools", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  type: text("type").notNull(), // primaire | college | lycee | universite
  city: text("city"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// ── Users ────────────────────────────────────────────────────────
// id = même UUID que auth.users (Supabase Auth), lien fait au niveau SQL.
export const users = pgTable("users", {
  id: uuid("id").primaryKey(), // = auth.users.id
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  schoolId: uuid("school_id").references(() => schools.id, { onDelete: "set null" }),
  fullName: text("full_name").notNull(),
  phone: text("phone"),
  email: text("email"),
  studentId: uuid("student_id"), // rempli si role = parent (référence future table "students")
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// ── Roles ────────────────────────────────────────────────────────
// Rôles définis par organisation (permet de personnaliser par client SaaS).
export const roles = pgTable("roles", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  name: text("name").notNull(), // admin | comptable | censeur | enseignant | parent ...
  label: text("label").notNull(), // nom lisible affiché à l'écran
}, (table) => [
  uniqueIndex("roles_org_name_uq").on(table.organizationId, table.name),
]);

// ── Permissions ──────────────────────────────────────────────────
// Catalogue global des permissions possibles dans l'application.
export const permissions = pgTable("permissions", {
  id: uuid("id").defaultRandom().primaryKey(),
  code: text("code").notNull().unique(), // ex: "students.read", "finance.write"
  description: text("description"),
});

// ── Role <-> Permission (many-to-many) ──────────────────────────
export const rolePermissions = pgTable("role_permissions", {
  roleId: uuid("role_id").notNull().references(() => roles.id, { onDelete: "cascade" }),
  permissionId: uuid("permission_id").notNull().references(() => permissions.id, { onDelete: "cascade" }),
}, (table) => [
  primaryKey({ columns: [table.roleId, table.permissionId] }),
]);

// ── User <-> Role (many-to-many, un user peut avoir plusieurs rôles) ─
export const userRoles = pgTable("user_roles", {
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  roleId: uuid("role_id").notNull().references(() => roles.id, { onDelete: "cascade" }),
}, (table) => [
  primaryKey({ columns: [table.userId, table.roleId] }),
]);

// ── Relations (pour les requêtes Drizzle avec .query) ───────────
export const organizationsRelations = relations(organizations, ({ many }) => ({
  schools: many(schools),
  users: many(users),
  roles: many(roles),
}));

export const schoolsRelations = relations(schools, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [schools.organizationId],
    references: [organizations.id],
  }),
  users: many(users),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [users.organizationId],
    references: [organizations.id],
  }),
  school: one(schools, {
    fields: [users.schoolId],
    references: [schools.id],
  }),
  userRoles: many(userRoles),
}));

export const rolesRelations = relations(roles, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [roles.organizationId],
    references: [organizations.id],
  }),
  rolePermissions: many(rolePermissions),
  userRoles: many(userRoles),
}));

export const permissionsRelations = relations(permissions, ({ many }) => ({
  rolePermissions: many(rolePermissions),
}));

export const rolePermissionsRelations = relations(rolePermissions, ({ one }) => ({
  role: one(roles, { fields: [rolePermissions.roleId], references: [roles.id] }),
  permission: one(permissions, { fields: [rolePermissions.permissionId], references: [permissions.id] }),
}));

export const userRolesRelations = relations(userRoles, ({ one }) => ({
  user: one(users, { fields: [userRoles.userId], references: [users.id] }),
  role: one(roles, { fields: [userRoles.roleId], references: [roles.id] }),
}));

// ── Classes ──────────────────────────────────────────────────────
// Une classe rattachée à une école (ex: "CP1 A", "Terminale D").
export const classes = pgTable("classes", {
  id: uuid("id").defaultRandom().primaryKey(),
  schoolId: uuid("school_id").notNull().references(() => schools.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  level: text("level").notNull(), // ex: CP1, 6e, Terminale, L1
  academicYear: text("academic_year").notNull(), // ex: "2025-2026"
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// ── Students ─────────────────────────────────────────────────────
export const students = pgTable("students", {
  id: uuid("id").defaultRandom().primaryKey(),
  schoolId: uuid("school_id").notNull().references(() => schools.id, { onDelete: "cascade" }),
  classId: uuid("class_id").references(() => classes.id, { onDelete: "set null" }),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  birthDate: date("birth_date"),
  matricule: text("matricule"), // numéro d'inscription interne à l'établissement
  parentUserId: uuid("parent_user_id").references(() => users.id, { onDelete: "set null" }),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// ── Grades (notes) ───────────────────────────────────────────────
export const grades = pgTable("grades", {
  id: uuid("id").defaultRandom().primaryKey(),
  studentId: uuid("student_id").notNull().references(() => students.id, { onDelete: "cascade" }),
  subject: text("subject").notNull(),
  term: text("term").notNull(), // ex: "Trimestre 1", "Semestre 2"
  score: numeric("score", { precision: 4, scale: 2 }).notNull(), // ex: 15.50
  classAverage: numeric("class_average", { precision: 4, scale: 2 }),
  rank: integer("rank"),
  remark: text("remark"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// ── Invoices (échéances / factures de scolarité) ────────────────
export const invoices = pgTable("invoices", {
  id: uuid("id").defaultRandom().primaryKey(),
  studentId: uuid("student_id").notNull().references(() => students.id, { onDelete: "cascade" }),
  label: text("label").notNull(), // ex: "Scolarité — Octobre"
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  dueDate: date("due_date").notNull(),
  status: text("status").notNull().default("pending"), // pending | partial | paid | overdue
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// ── Payments (paiements reçus contre une invoice) ───────────────
// Un invoice peut être réglé en plusieurs fois (paiement partiel).
export const payments = pgTable("payments", {
  id: uuid("id").defaultRandom().primaryKey(),
  invoiceId: uuid("invoice_id").notNull().references(() => invoices.id, { onDelete: "cascade" }),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  method: text("method").notNull(), // wave | orange_money | mtn_money | moov_money | carte | especes
  paidAt: timestamp("paid_at", { withTimezone: true }).defaultNow().notNull(),
  reference: text("reference"), // référence de transaction de l'opérateur
});

// ── Relations ────────────────────────────────────────────────────
export const classesRelations = relations(classes, ({ one, many }) => ({
  school: one(schools, { fields: [classes.schoolId], references: [schools.id] }),
  students: many(students),
}));

export const studentsRelations = relations(students, ({ one, many }) => ({
  school: one(schools, { fields: [students.schoolId], references: [schools.id] }),
  class: one(classes, { fields: [students.classId], references: [classes.id] }),
  parent: one(users, { fields: [students.parentUserId], references: [users.id] }),
  grades: many(grades),
  invoices: many(invoices),
}));

export const gradesRelations = relations(grades, ({ one }) => ({
  student: one(students, { fields: [grades.studentId], references: [students.id] }),
}));

export const invoicesRelations = relations(invoices, ({ one, many }) => ({
  student: one(students, { fields: [invoices.studentId], references: [students.id] }),
  payments: many(payments),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  invoice: one(invoices, { fields: [payments.invoiceId], references: [invoices.id] }),
}));

export const teachers = pgTable("teachers", {
  id: uuid("id").defaultRandom().primaryKey(),
  schoolId: uuid("school_id").notNull().references(() => schools.id, { onDelete: "cascade" }),
  fullName: text("full_name").notNull(),
  subject: text("subject"),
  phone: text("phone"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const teachersRelations = relations(teachers, ({ one }) => ({
  school: one(schools, { fields: [teachers.schoolId], references: [schools.id] }),
}));

export const feeStructures = pgTable("fee_structures", {
  id: uuid("id").defaultRandom().primaryKey(),
  schoolId: uuid("school_id").notNull().references(() => schools.id, { onDelete: "cascade" }),
  level: text("level").notNull(),
  installmentLabel: text("installment_label").notNull(),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const feeStructuresRelations = relations(feeStructures, ({ one }) => ({
  school: one(schools, { fields: [feeStructures.schoolId], references: [schools.id] }),
}));