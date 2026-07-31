import { notFound } from "next/navigation";
import { and, desc, eq } from "drizzle-orm";
import { getCurrentProfile } from "@/lib/auth/profile";
import { db } from "@/lib/db";
import { invoices, payments, students } from "@/lib/db/schema";
import { computeInvoiceStatus } from "@/lib/invoice-status";
import { PAYMENT_METHODS } from "@/lib/constants";
import { StatusBadge } from "@/components/shared/status-badge";
import { BackButton } from "@/components/shared/back-button";
import { Btn } from "@/components/shared/btn";
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
  const boundRecordPayment = recordPayment.bind(null, row.id);

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <BackButton href="/invoices" label="Retour aux factures" />

      <div className="space-y-4 rounded-2xl border border-cream-dark bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-zinc-900">{row.label}</h1>
            <p className="text-sm text-zinc-500">
              {row.studentLastName.toUpperCase()} {row.studentFirstName}
            </p>
          </div>
          <StatusBadge status={status} />
        </div>

        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <div className="text-zinc-400">Montant dû</div>
            <div className="font-mono font-semibold text-zinc-900">{fmt(Number(row.amount))}</div>
          </div>
          <div>
            <div className="text-zinc-400">Versé</div>
            <div className="font-mono font-semibold text-green-700">{fmt(totalPaid)}</div>
          </div>
          <div>
            <div className="text-zinc-400">Solde</div>
            <div className={`font-mono font-semibold ${balance > 0 ? "text-red-700" : "text-green-700"}`}>
              {balance > 0 ? fmt(balance) : "Soldé"}
            </div>
          </div>
        </div>

        <div className="text-xs text-zinc-400">Date limite : {row.dueDate}</div>

        <div className="flex items-center gap-3">
          <Btn variant="secondary" small href={`/invoices/${row.id}/edit`}>
            Modifier
          </Btn>
          <DeleteInvoiceButton invoiceId={row.id} redirectTo="/invoices" />
        </div>
      </div>

      {balance > 0 && (
        <div className="space-y-4 rounded-2xl border border-cream-dark bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-zinc-900">Enregistrer un versement</h2>
          <PaymentForm maxAmount={balance} onSubmit={boundRecordPayment} />
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-cream-dark bg-white shadow-sm">
        <div className="border-b border-cream-dark px-6 py-4">
          <h2 className="text-sm font-semibold text-zinc-900">Historique des versements</h2>
        </div>
        {paymentRows.length === 0 ? (
          <p className="px-6 py-4 text-sm text-zinc-400">Aucun versement enregistré.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-cream text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">
                <th className="px-4 py-2">Date</th>
                <th className="px-4 py-2">Montant</th>
                <th className="px-4 py-2">Moyen</th>
                <th className="px-4 py-2">Référence</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {paymentRows.map((p, i) => (
                <tr key={p.id} className={`border-t border-cream ${i % 2 === 1 ? "bg-cream/30" : "bg-white"}`}>
                  <td className="px-4 py-2 text-zinc-500">
                    {new Date(p.paidAt).toLocaleDateString("fr-FR")}
                  </td>
                  <td className="px-4 py-2 font-mono text-zinc-900">{fmt(Number(p.amount))}</td>
                  <td className="px-4 py-2">
                    <span className="rounded-full bg-forest-faint px-2 py-0.5 text-xs text-forest">
                      {methodLabel(p.method)}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-zinc-500">{p.reference ?? "—"}</td>
                  <td className="px-4 py-2 text-right space-x-3">
                    <a href={`/invoices/${row.id}/payments/${p.id}/edit`} className="text-zinc-700 underline">
                      Modifier
                    </a>
                    <a href={`/invoices/${row.id}/receipt/${p.id}`} className="text-zinc-700 underline">
                      Reçu
                    </a>
                    <DeletePaymentButton invoiceId={row.id} paymentId={p.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
