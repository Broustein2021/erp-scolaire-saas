import { eq } from "drizzle-orm";
import { getCurrentProfile } from "@/lib/auth/profile";
import { db } from "@/lib/db";
import { students } from "@/lib/db/schema";
import { InvoiceForm } from "../invoice-form";
import { createInvoice } from "../actions";

export default async function NewInvoicePage() {
  const profile = await getCurrentProfile();

  const studentRows = profile.schoolId
    ? await db
        .select({ id: students.id, firstName: students.firstName, lastName: students.lastName })
        .from(students)
        .where(eq(students.schoolId, profile.schoolId))
    : [];

  const studentOptions = studentRows.map((s) => ({
    id: s.id,
    label: `${s.lastName.toUpperCase()} ${s.firstName}`,
  }));

  return (
    <main className="mx-auto max-w-lg p-8 space-y-6">
      <h1 className="text-xl font-semibold">Nouvelle facture</h1>
      <InvoiceForm studentOptions={studentOptions} onSubmit={createInvoice} submitLabel="Créer la facture" />
    </main>
  );
}
