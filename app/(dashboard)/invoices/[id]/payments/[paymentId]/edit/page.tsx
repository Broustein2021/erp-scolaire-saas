import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { getCurrentProfile } from "@/lib/auth/profile";
import { db } from "@/lib/db";
import { invoices, payments, students } from "@/lib/db/schema";
import { BackButton } from "@/components/shared/back-button";
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
    <div className="mx-auto max-w-lg space-y-6 p-6">
      <BackButton href={`/invoices/${id}`} label="Retour à la facture" />
      <div className="space-y-4 rounded-2xl border border-cream-dark bg-white p-6 shadow-sm">
        <h1 className="text-xl font-bold text-zinc-900">Modifier le versement</h1>
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
    </div>
  );
}
