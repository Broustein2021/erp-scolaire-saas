import Link from "next/link";
import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { getCurrentProfile } from "@/lib/auth/profile";
import { db } from "@/lib/db";
import { invoices, payments, students } from "@/lib/db/schema";
import { PaymentForm } from "../../../payment-form";
import { updatePayment } from "../../../../actions";

export default async function EditPaymentPage({
  params,
}: {
  params: Promise<{ id: string; paymentId: string }>;
}) {
  const { id, paymentId } = await params;
  const profile = await getCurrentProfile();
  if (!profile.schoolId) notFound();

  const [invoice] = await db
    .select({ id: invoices.id, amount: invoices.amount })
    .from(invoices)
    .innerJoin(students, eq(students.id, invoices.studentId))
    .where(and(eq(invoices.id, id), eq(students.schoolId, profile.schoolId)));
  if (!invoice) notFound();

  const [payment] = await db
    .select()
    .from(payments)
    .where(and(eq(payments.id, paymentId), eq(payments.invoiceId, id)));
  if (!payment) notFound();

  const allPaymentsRows = await db
    .select({ amount: payments.amount })
    .from(payments)
    .where(eq(payments.invoiceId, id));
  const totalPaid = allPaymentsRows.reduce((acc, p) => acc + Number(p.amount), 0);
  const otherPaid = totalPaid - Number(payment.amount);
  const maxAmount = Number(invoice.amount) - otherPaid;

  return (
    <main className="mx-auto max-w-lg space-y-6 p-8">
      <Link href={`/invoices/${id}`} className="text-sm text-zinc-500 underline">
        ← Retour à la facture
      </Link>
      <div className="rounded-2xl border bg-white p-6 shadow-sm space-y-4">
        <h1 className="text-xl font-semibold">Modifier le versement</h1>
        <PaymentForm
          maxAmount={maxAmount}
          defaultValues={{
            amount: Number(payment.amount),
            method: payment.method,
            reference: payment.reference,
          }}
          submitLabel="Enregistrer les modifications"
          onSubmit={updatePayment.bind(null, id, paymentId)}
        />
      </div>
    </main>
  );
}
