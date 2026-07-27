import Link from "next/link";
import { eq } from "drizzle-orm";
import { getCurrentProfile } from "@/lib/auth/profile";
import { db } from "@/lib/db";
import { invoices, payments, students } from "@/lib/db/schema";
import { computeInvoiceStatus } from "@/lib/invoice-status";
import { INVOICE_STATUS_LABELS } from "@/lib/constants";
import { DeleteInvoiceButton } from "./delete-button";

function fmt(n: number) {
  return new Intl.NumberFormat("fr-FR").format(n) + " FCFA";
}

export default async function InvoicesPage() {
  const profile = await getCurrentProfile();

  const rows = profile.schoolId
    ? await db
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
        .where(eq(students.schoolId, profile.schoolId))
    : [];

  const allPayments = rows.length
    ? await db.select({ invoiceId: payments.invoiceId, amount: payments.amount }).from(payments)
    : [];

  const paidByInvoice = new Map<string, number>();
  for (const p of allPayments) {
    paidByInvoice.set(p.invoiceId, (paidByInvoice.get(p.invoiceId) ?? 0) + Number(p.amount));
  }

  const totalOutstanding = rows.reduce((acc, r) => {
    const paid = paidByInvoice.get(r.id) ?? 0;
    return acc + Math.max(Number(r.amount) - paid, 0);
  }, 0);

  return (
    <main className="mx-auto max-w-4xl p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Factures</h1>
          <p className="text-sm text-zinc-500">
            {rows.length} facture{rows.length > 1 ? "s" : ""}
            {rows.length > 0 && <> · {fmt(totalOutstanding)} en attente</>}
          </p>
        </div>
        <Link
          href="/invoices/new"
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white"
        >
          + Nouvelle facture
        </Link>
      </div>

      {rows.length === 0 ? (
        <p className="text-sm text-zinc-500">Aucune facture enregistrée pour l&apos;instant.</p>
      ) : (
        <div className="overflow-hidden rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 text-left text-zinc-500">
              <tr>
                <th className="px-4 py-2 font-medium">Élève</th>
                <th className="px-4 py-2 font-medium">Libellé</th>
                <th className="px-4 py-2 font-medium">Montant</th>
                <th className="px-4 py-2 font-medium">Versé</th>
                <th className="px-4 py-2 font-medium">Date limite</th>
                <th className="px-4 py-2 font-medium">Statut</th>
                <th className="px-4 py-2 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {rows.map((r) => {
                const paid = paidByInvoice.get(r.id) ?? 0;
                const status = computeInvoiceStatus(Number(r.amount), paid, r.dueDate);
                const badge = INVOICE_STATUS_LABELS[status];
                return (
                  <tr key={r.id}>
                    <td className="px-4 py-2">
                      {r.studentLastName.toUpperCase()} {r.studentFirstName}
                    </td>
                    <td className="px-4 py-2">{r.label}</td>
                    <td className="px-4 py-2 font-mono">{fmt(Number(r.amount))}</td>
                    <td className="px-4 py-2 font-mono text-zinc-500">{fmt(paid)}</td>
                    <td className="px-4 py-2 text-zinc-500">{r.dueDate}</td>
                    <td className="px-4 py-2">
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${badge.className}`}
                      >
                        {badge.label}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-right space-x-3">
                      <Link href={`/invoices/${r.id}`} className="text-zinc-700 underline">
                        Détails
                      </Link>
                      <DeleteInvoiceButton invoiceId={r.id} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
