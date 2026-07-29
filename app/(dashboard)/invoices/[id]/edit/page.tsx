import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { getCurrentProfile } from "@/lib/auth/profile";
import { db } from "@/lib/db";
import { invoices, students } from "@/lib/db/schema";
import { InvoiceForm } from "../../invoice-form";
import { updateInvoice } from "../../actions";

export default async function EditInvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await getCurrentProfile();
  if (!profile.schoolId) notFound();

  const [invoice] = await db
    .select({
      id: invoices.id,
      label: invoices.label,
      amount: invoices.amount,
      dueDate: invoices.dueDate,
      studentId: invoices.studentId,
    })
    .from(invoices)
    .innerJoin(students, eq(students.id, invoices.studentId))
    .where(and(eq(invoices.id, id), eq(students.schoolId, profile.schoolId)));

  if (!invoice) notFound();

  const studentRows = await db
    .select({ id: students.id, firstName: students.firstName, lastName: students.lastName })
    .from(students)
    .where(eq(students.schoolId, profile.schoolId));

  const studentOptions = studentRows.map((s) => ({
    id: s.id,
    label: `${s.lastName.toUpperCase()} ${s.firstName}`,
  }));

  return (
    <main className="mx-auto max-w-lg p-8 space-y-6">
      <h1 className="text-xl font-semibold">Modifier la facture</h1>
      <InvoiceForm
        studentOptions={studentOptions}
        defaultValues={{
          studentId: invoice.studentId,
          label: invoice.label,
          amount: invoice.amount,
          dueDate: invoice.dueDate,
        }}
        onSubmit={updateInvoice.bind(null, id)}
        submitLabel="Enregistrer"
      />
    </main>
  );
}
