import Link from "next/link";
import { notFound } from "next/navigation";
import { and, desc, eq } from "drizzle-orm";
import { getCurrentProfile } from "@/lib/auth/profile";
import { db } from "@/lib/db";
import { invoices, payments, students } from "@/lib/db/schema";
import { computeInvoiceStatus } from "@/lib/invoice-status";
import { INVOICE_STATUS_LABELS, PAYMENT_METHODS } from "@/lib/constants";
import { recordPayment } from "../actions";
import { PaymentForm } from "./payment-form";
import { DeletePaymentButton } from "./delete-payment-button";
import { DeleteInvoiceButton } from "../delete-button";

function fmt(n: number) {
  return new Intl.NumberFormat("fr-FR").format(n) + " FCFA";
}

function methodLabel(value: string) {
  return PAYMENT_METHODS.find((m) => m.value === value)?.label ?? value;
}

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await getCurrentProfile();
  if (!profile.schoolId) notFound();

  const [row] = await db
    .select({
      id: invoices.id,
      label: invoices.label,
      amount: invoices.amount,
      dueDate: invoices.dueDate,
      studentFirstName: students.firstName,
      studentLastName: students.lastName,
    })
    .from(invoices)
    .innerJoin(students, eq(students.id, invoices.studentId))
    .where(and(eq(invoices.id, id), eq(students.schoolId, profile.schoolId)));

  if (!row) notFound();

  const paymentRows = await db
    .select()
    .from(payments)
    .where(eq(payments.invoiceId, id))
    .orderBy(desc(payments.paidAt));

  const totalPaid = paymentRows.reduce((acc, p) => acc + Number(p.amount), 0);
  const balance = Number(row.amount) - totalPaid;
  const status = computeInvoiceStatus(Number(row.amount), totalPaid, row.dueDate);
  const badge = INVOICE_STATUS_LABELS[status];
  const boundRecordPayment = recordPayment.bind(null, row.id);

  return (
    <main className="mx-auto max-w-2xl p-8 space-y-6">
      <Link href="/invoices" className="text-sm text-zinc-500 underline">
        ← Retour aux factures
      </Link>

      <div className="rounded-2xl border bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-semibold">{row.label}</h1>
            <p className="text-sm text-zinc-500">
              {row.studentLastName.toUpperCase()} {row.studentFirstName}
            </p>
          </div>
          <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${badge.className}`}>
            {badge.label}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <div className="text-zinc-500">Montant dû</div>
            <div className="font-mono font-semibold">{fmt(Number(row.amount))}</div>
          </div>
          <div>
            <div className="text-zinc-500">Versé</div>
            <div className="font-mono font-semibold text-green-700">{fmt(totalPaid)}</div>
          </div>
          <div>
            <div className="text-zinc-500">Solde</div>
            <div className={`font-mono font-semibold ${balance > 0 ? "text-red-700" : "text-green-700"}`}>
              {balance > 0 ? fmt(balance) : "Soldé"}
            </div>
          </div>
        </div>

        <div className="text-xs text-zinc-500">Date limite : {row.dueDate}</div>

        <div className="flex gap-3 text-sm">
          <Link href={`/invoices/${row.id}/edit`} className="text-zinc-700 underline">
            Modifier
          </Link>
          <DeleteInvoiceButton invoiceId={row.id} redirectTo="/invoices" />
        </div>
      </div>

      {balance > 0 && (
        <div className="rounded-2xl border bg-white p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-semibold">Enregistrer un versement</h2>
          <PaymentForm maxAmount={balance} onSubmit={boundRecordPayment} />
        </div>
      )}

      <div className="rounded-2xl border bg-white shadow-sm overflow-hidden">
        <div className="border-b px-6 py-4">
          <h2 className="text-sm font-semibold">Historique des versements</h2>
        </div>
        {paymentRows.length === 0 ? (
          <p className="px-6 py-4 text-sm text-zinc-500">Aucun versement enregistré.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 text-left text-zinc-500">
              <tr>
                <th className="px-4 py-2 font-medium">Date</th>
                <th className="px-4 py-2 font-medium">Montant</th>
                <th className="px-4 py-2 font-medium">Moyen</th>
                <th className="px-4 py-2 font-medium">Référence</th>
                <th className="px-4 py-2 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {paymentRows.map((p) => (
                <tr key={p.id}>
                  <td className="px-4 py-2 text-zinc-500">
                    {new Date(p.paidAt).toLocaleDateString("fr-FR")}
                  </td>
                  <td className="px-4 py-2 font-mono">{fmt(Number(p.amount))}</td>
                  <td className="px-4 py-2">{methodLabel(p.method)}</td>
                  <td className="px-4 py-2 text-zinc-500">{p.reference ?? "—"}</td>
                  <td className="px-4 py-2 text-right">
                    <DeletePaymentButton invoiceId={row.id} paymentId={p.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </main>
  );
}
