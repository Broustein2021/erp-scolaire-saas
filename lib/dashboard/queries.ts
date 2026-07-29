import { desc, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  students,
  classes,
  teachers,
  grades,
  invoices,
  payments,
  schools,
} from "@/lib/db/schema";
import { computeInvoiceStatus } from "@/lib/invoice-status";

export type DashboardData = {
  schoolName: string | null;
  schoolCity: string | null;
  studentCount: number;
  classCount: number;
  teacherCount: number;
  gradeCount: number;
  invoiceCount: number;
  paidInvoiceCount: number;
  overdueCount: number;
  totalCollected: number;
  monthCollected: number;
  outstanding: number;
  revenueByClass: { name: string; total: number }[];
  monthlyRevenue: { month: string; revenus: number }[];
  recentPayments: {
    id: string;
    amount: number;
    method: string;
    paidAt: string;
    reference: string | null;
    studentName: string;
    invoiceLabel: string;
    invoiceId: string;
  }[];
  overdueInvoices: {
    id: string;
    label: string;
    amount: number;
    paid: number;
    dueDate: string;
    studentName: string;
  }[];
};

const EMPTY: DashboardData = {
  schoolName: null,
  schoolCity: null,
  studentCount: 0,
  classCount: 0,
  teacherCount: 0,
  gradeCount: 0,
  invoiceCount: 0,
  paidInvoiceCount: 0,
  overdueCount: 0,
  totalCollected: 0,
  monthCollected: 0,
  outstanding: 0,
  revenueByClass: [],
  monthlyRevenue: [],
  recentPayments: [],
  overdueInvoices: [],
};

export async function getDashboardData(schoolId: string | null): Promise<DashboardData> {
  if (!schoolId) return EMPTY;

  const [school] = await db
    .select({ name: schools.name, city: schools.city })
    .from(schools)
    .where(eq(schools.id, schoolId));

  const [studentRows, classRows, teacherRows, gradeRows] = await Promise.all([
    db
      .select({ count: sql<number>`count(*)`.mapWith(Number) })
      .from(students)
      .where(eq(students.schoolId, schoolId)),
    db
      .select({ count: sql<number>`count(*)`.mapWith(Number) })
      .from(classes)
      .where(eq(classes.schoolId, schoolId)),
    db
      .select({ count: sql<number>`count(*)`.mapWith(Number) })
      .from(teachers)
      .where(eq(teachers.schoolId, schoolId)),
    db
      .select({ count: sql<number>`count(*)`.mapWith(Number) })
      .from(grades)
      .innerJoin(students, eq(students.id, grades.studentId))
      .where(eq(students.schoolId, schoolId)),
  ]);

  const invoiceRows = await db
    .select({
      id: invoices.id,
      amount: invoices.amount,
      dueDate: invoices.dueDate,
      label: invoices.label,
      studentId: invoices.studentId,
      studentFirstName: students.firstName,
      studentLastName: students.lastName,
      classId: students.classId,
    })
    .from(invoices)
    .innerJoin(students, eq(students.id, invoices.studentId))
    .where(eq(students.schoolId, schoolId));

  const invoiceIds = invoiceRows.map((r) => r.id);

  const paymentRows =
    invoiceIds.length > 0
      ? await db
          .select({
            id: payments.id,
            invoiceId: payments.invoiceId,
            amount: payments.amount,
            method: payments.method,
            paidAt: payments.paidAt,
            reference: payments.reference,
          })
          .from(payments)
          .orderBy(desc(payments.paidAt))
      : [];

  // Filtrer uniquement les paiements des factures de cette école
  const schoolPaymentRows = paymentRows.filter((p) => invoiceIds.includes(p.invoiceId));

  const paidByInvoice = new Map<string, number>();
  let totalCollected = 0;
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  let monthCollected = 0;

  for (const p of schoolPaymentRows) {
    const amt = Number(p.amount);
    paidByInvoice.set(p.invoiceId, (paidByInvoice.get(p.invoiceId) ?? 0) + amt);
    totalCollected += amt;
    if (new Date(p.paidAt) >= monthStart) monthCollected += amt;
  }

  let outstanding = 0;
  let overdueCount = 0;
  let paidInvoiceCount = 0;
  const overdueInvoices: DashboardData["overdueInvoices"] = [];

  for (const inv of invoiceRows) {
    const paid = paidByInvoice.get(inv.id) ?? 0;
    const amount = Number(inv.amount);
    outstanding += Math.max(amount - paid, 0);
    const status = computeInvoiceStatus(amount, paid, inv.dueDate);
    if (status === "paid") paidInvoiceCount += 1;
    if (status === "overdue") {
      overdueCount += 1;
      overdueInvoices.push({
        id: inv.id,
        label: inv.label,
        amount,
        paid,
        dueDate: inv.dueDate,
        studentName: `${inv.studentLastName.toUpperCase()} ${inv.studentFirstName}`,
      });
    }
  }

  // Revenus par classe
  const classList = await db
    .select({ id: classes.id, name: classes.name })
    .from(classes)
    .where(eq(classes.schoolId, schoolId));

  const classNameById = new Map(classList.map((c) => [c.id, c.name]));
  const revenueByClassMap = new Map<string, number>();

  for (const inv of invoiceRows) {
    const paid = paidByInvoice.get(inv.id) ?? 0;
    if (paid <= 0) continue;
    const key = inv.classId ? (classNameById.get(inv.classId) ?? "Sans classe") : "Sans classe";
    revenueByClassMap.set(key, (revenueByClassMap.get(key) ?? 0) + paid);
  }

  const revenueByClass = Array.from(revenueByClassMap.entries())
    .map(([name, total]) => ({ name, total }))
    .sort((a, b) => b.total - a.total);

  // Flux mensuel (12 derniers mois) — revenus uniquement
  const monthlyMap = new Map<string, number>();
  for (let i = 11; i >= 0; i--) {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    monthlyMap.set(key, 0);
  }
  for (const p of schoolPaymentRows) {
    const d = new Date(p.paidAt);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (monthlyMap.has(key)) {
      monthlyMap.set(key, (monthlyMap.get(key) ?? 0) + Number(p.amount));
    }
  }
  const monthlyRevenue = Array.from(monthlyMap.entries()).map(([month, revenus]) => ({
    month,
    revenus,
  }));

  // Transactions récentes (8 max)
  const invoiceMeta = new Map(
    invoiceRows.map((r) => [
      r.id,
      {
        label: r.label,
        studentName: `${r.studentLastName.toUpperCase()} ${r.studentFirstName}`,
      },
    ]),
  );

  const recentPayments = schoolPaymentRows.slice(0, 8).map((p) => {
    const meta = invoiceMeta.get(p.invoiceId);
    return {
      id: p.id,
      amount: Number(p.amount),
      method: p.method,
      paidAt: p.paidAt instanceof Date ? p.paidAt.toISOString() : String(p.paidAt),
      reference: p.reference,
      studentName: meta?.studentName ?? "—",
      invoiceLabel: meta?.label ?? "—",
      invoiceId: p.invoiceId,
    };
  });

  return {
    schoolName: school?.name ?? null,
    schoolCity: school?.city ?? null,
    studentCount: studentRows[0]?.count ?? 0,
    classCount: classRows[0]?.count ?? 0,
    teacherCount: teacherRows[0]?.count ?? 0,
    gradeCount: gradeRows[0]?.count ?? 0,
    invoiceCount: invoiceRows.length,
    paidInvoiceCount,
    overdueCount,
    totalCollected,
    monthCollected,
    outstanding,
    revenueByClass,
    monthlyRevenue,
    recentPayments,
    overdueInvoices: overdueInvoices.slice(0, 6),
  };
}