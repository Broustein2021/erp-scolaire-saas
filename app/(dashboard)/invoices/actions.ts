"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { getCurrentProfile } from "@/lib/auth/profile";
import { db } from "@/lib/db";
import { invoices, payments, students } from "@/lib/db/schema";
import { computeInvoiceStatus } from "@/lib/invoice-status";
import { PAYMENT_METHODS } from "@/lib/constants";

const PAYMENT_METHOD_VALUES = PAYMENT_METHODS.map((m) => m.value) as string[];

function readInvoiceFields(formData: FormData) {
  return {
    studentId: String(formData.get("studentId") ?? "").trim(),
    label: String(formData.get("label") ?? "").trim(),
    amount: String(formData.get("amount") ?? "").trim(),
    dueDate: String(formData.get("dueDate") ?? "").trim(),
  };
}

async function getOwnedInvoice(invoiceId: string, schoolId: string) {
  const [row] = await db
    .select({
      id: invoices.id,
      amount: invoices.amount,
      dueDate: invoices.dueDate,
      studentId: invoices.studentId,
    })
    .from(invoices)
    .innerJoin(students, eq(students.id, invoices.studentId))
    .where(and(eq(invoices.id, invoiceId), eq(students.schoolId, schoolId)));

  return row ?? null;
}

async function recalculateStatus(invoiceId: string, amount: number, dueDate: string) {
  const paidRows = await db
    .select({ amount: payments.amount })
    .from(payments)
    .where(eq(payments.invoiceId, invoiceId));

  const totalPaid = paidRows.reduce((acc, p) => acc + Number(p.amount), 0);
  const status = computeInvoiceStatus(amount, totalPaid, dueDate);

  await db.update(invoices).set({ status }).where(eq(invoices.id, invoiceId));
  return { totalPaid, status };
}

export async function createInvoice(formData: FormData) {
  const profile = await getCurrentProfile();
  if (!profile.schoolId) return { error: "Aucune école rattachée à ton compte." };

  const fields = readInvoiceFields(formData);
  const amount = Number(fields.amount);

  if (!fields.studentId || !fields.label || !fields.dueDate || !Number.isFinite(amount) || amount <= 0) {
    return { error: "Élève, libellé, montant et date limite sont requis." };
  }

  const [student] = await db
    .select({ id: students.id })
    .from(students)
    .where(and(eq(students.id, fields.studentId), eq(students.schoolId, profile.schoolId)));
  if (!student) return { error: "Élève introuvable." };

  await db.insert(invoices).values({
    studentId: fields.studentId,
    label: fields.label,
    amount: fields.amount,
    dueDate: fields.dueDate,
    status: computeInvoiceStatus(amount, 0, fields.dueDate),
  });

  revalidatePath("/invoices");
  redirect("/invoices");
}

export async function updateInvoice(invoiceId: string, formData: FormData) {
  const profile = await getCurrentProfile();
  if (!profile.schoolId) return { error: "Aucune école rattachée à ton compte." };

  const existing = await getOwnedInvoice(invoiceId, profile.schoolId);
  if (!existing) return { error: "Facture introuvable." };

  const fields = readInvoiceFields(formData);
  const amount = Number(fields.amount);

  if (!fields.studentId || !fields.label || !fields.dueDate || !Number.isFinite(amount) || amount <= 0) {
    return { error: "Élève, libellé, montant et date limite sont requis." };
  }

  const [student] = await db
    .select({ id: students.id })
    .from(students)
    .where(and(eq(students.id, fields.studentId), eq(students.schoolId, profile.schoolId)));
  if (!student) return { error: "Élève introuvable." };

  const paidRows = await db
    .select({ amount: payments.amount })
    .from(payments)
    .where(eq(payments.invoiceId, invoiceId));
  const totalPaid = paidRows.reduce((acc, p) => acc + Number(p.amount), 0);

  await db
    .update(invoices)
    .set({
      studentId: fields.studentId,
      label: fields.label,
      amount: fields.amount,
      dueDate: fields.dueDate,
      status: computeInvoiceStatus(amount, totalPaid, fields.dueDate),
    })
    .where(eq(invoices.id, invoiceId));

  revalidatePath("/invoices");
  revalidatePath(`/invoices/${invoiceId}`);
  redirect(`/invoices/${invoiceId}`);
}

export async function deleteInvoice(invoiceId: string) {
  const profile = await getCurrentProfile();
  if (!profile.schoolId) return { error: "Aucune école rattachée à ton compte." };

  const existing = await getOwnedInvoice(invoiceId, profile.schoolId);
  if (!existing) return { error: "Facture introuvable." };

  await db.delete(invoices).where(eq(invoices.id, invoiceId));
  revalidatePath("/invoices");
}

export async function recordPayment(invoiceId: string, formData: FormData) {
  const profile = await getCurrentProfile();
  if (!profile.schoolId) return { error: "Aucune école rattachée à ton compte." };

  const invoice = await getOwnedInvoice(invoiceId, profile.schoolId);
  if (!invoice) return { error: "Facture introuvable." };

  const amountRaw = String(formData.get("amount") ?? "").trim();
  const method = String(formData.get("method") ?? "").trim();
  const reference = String(formData.get("reference") ?? "").trim();
  const amount = Number(amountRaw);

  if (!Number.isFinite(amount) || amount <= 0) {
    return { error: "Montant de versement invalide." };
  }
  if (!PAYMENT_METHOD_VALUES.includes(method)) {
    return { error: "Moyen de paiement invalide." };
  }

  await db.insert(payments).values({
    invoiceId,
    amount: amountRaw,
    method,
    reference: reference || null,
  });

  await recalculateStatus(invoiceId, Number(invoice.amount), invoice.dueDate);

  revalidatePath(`/invoices/${invoiceId}`);
  revalidatePath("/invoices");
}

export async function updatePayment(invoiceId: string, paymentId: string, formData: FormData) {
  const profile = await getCurrentProfile();
  if (!profile.schoolId) return { error: "Aucune école rattachée à ton compte." };

  const invoice = await getOwnedInvoice(invoiceId, profile.schoolId);
  if (!invoice) return { error: "Facture introuvable." };

  const [existingPayment] = await db
    .select({ id: payments.id })
    .from(payments)
    .where(and(eq(payments.id, paymentId), eq(payments.invoiceId, invoiceId)));
  if (!existingPayment) return { error: "Versement introuvable." };

  const amountRaw = String(formData.get("amount") ?? "").trim();
  const method = String(formData.get("method") ?? "").trim();
  const reference = String(formData.get("reference") ?? "").trim();
  const amount = Number(amountRaw);

  if (!Number.isFinite(amount) || amount <= 0) {
    return { error: "Montant de versement invalide." };
  }
  if (!PAYMENT_METHOD_VALUES.includes(method)) {
    return { error: "Moyen de paiement invalide." };
  }

  await db
    .update(payments)
    .set({
      amount: amountRaw,
      method,
      reference: reference || null,
    })
    .where(and(eq(payments.id, paymentId), eq(payments.invoiceId, invoiceId)));

  await recalculateStatus(invoiceId, Number(invoice.amount), invoice.dueDate);

  revalidatePath(`/invoices/${invoiceId}`);
  revalidatePath("/invoices");
  redirect(`/invoices/${invoiceId}`);
}

export async function deletePayment(invoiceId: string, paymentId: string) {
  const profile = await getCurrentProfile();
  if (!profile.schoolId) return { error: "Aucune école rattachée à ton compte." };

  const invoice = await getOwnedInvoice(invoiceId, profile.schoolId);
  if (!invoice) return { error: "Facture introuvable." };

  await db
    .delete(payments)
    .where(and(eq(payments.id, paymentId), eq(payments.invoiceId, invoiceId)));

  await recalculateStatus(invoiceId, Number(invoice.amount), invoice.dueDate);

  revalidatePath(`/invoices/${invoiceId}`);
  revalidatePath("/invoices");
}
