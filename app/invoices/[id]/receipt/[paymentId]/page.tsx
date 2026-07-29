import Link from "next/link";
import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { getCurrentProfile } from "@/lib/auth/profile";
import { db } from "@/lib/db";
import { invoices, payments, students, schools } from "@/lib/db/schema";
import { PAYMENT_METHODS } from "@/lib/constants";
import { PrintButton } from "./print-button";

function fmt(n: number) {
  return new Intl.NumberFormat("fr-FR").format(n) + " FCFA";
}

function methodLabel(value: string) {
  return PAYMENT_METHODS.find((m) => m.value === value)?.label ?? value;
}

export default async function ReceiptPage({
  params,
}: {
  params: Promise<{ id: string; paymentId: string }>;
}) {
  const { id, paymentId } = await params;
  const profile = await getCurrentProfile();
  if (!profile.schoolId) notFound();

  const [row] = await db
    .select({
      invoiceId: invoices.id,
      invoiceLabel: invoices.label,
      invoiceAmount: invoices.amount,
      dueDate: invoices.dueDate,
      studentFirstName: students.firstName,
      studentLastName: students.lastName,
      matricule: students.matricule,
      schoolName: schools.name,
      schoolCity: schools.city,
      paymentId: payments.id,
      paymentAmount: payments.amount,
      method: payments.method,
      reference: payments.reference,
      paidAt: payments.paidAt,
    })
    .from(payments)
    .innerJoin(invoices, eq(invoices.id, payments.invoiceId))
    .innerJoin(students, eq(students.id, invoices.studentId))
    .innerJoin(schools, eq(schools.id, students.schoolId))
    .where(
      and(
        eq(payments.id, paymentId),
        eq(invoices.id, id),
        eq(students.schoolId, profile.schoolId),
      ),
    );

  if (!row) notFound();

  const paidAtLabel = new Date(row.paidAt).toLocaleString("fr-FR", {
    dateStyle: "long",
    timeStyle: "short",
  });

  return (
    <main className="mx-auto max-w-lg p-8 space-y-6">
      {/* Zone non imprimée */}
      <div className="print:hidden flex items-center justify-between">
        <Link href={`/invoices/${row.invoiceId}`} className="text-sm text-zinc-500 underline">
          ← Retour à la facture
        </Link>
        <PrintButton />
      </div>

      {/* Reçu */}
      <article className="rounded-2xl border bg-white p-8 shadow-sm space-y-6 print:border-0 print:shadow-none">
        <header className="text-center space-y-1 border-b pb-4">
          <p className="text-xs uppercase tracking-wide text-zinc-500">Reçu de paiement</p>
          <h1 className="text-xl font-semibold">{row.schoolName}</h1>
          {row.schoolCity && (
            <p className="text-sm text-zinc-500">{row.schoolCity}</p>
          )}
        </header>

        <section className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-zinc-500">N° reçu</span>
            <span className="font-mono text-xs">{row.paymentId.slice(0, 8).toUpperCase()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-500">Date</span>
            <span>{paidAtLabel}</span>
          </div>
        </section>

        <section className="space-y-2 text-sm border-t pt-4">
          <div className="flex justify-between">
            <span className="text-zinc-500">Élève</span>
            <span className="font-medium">
              {row.studentLastName.toUpperCase()} {row.studentFirstName}
            </span>
          </div>
          {row.matricule && (
            <div className="flex justify-between">
              <span className="text-zinc-500">Matricule</span>
              <span>{row.matricule}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-zinc-500">Facture</span>
            <span>{row.invoiceLabel}</span>
          </div>
        </section>

        <section className="rounded-xl bg-zinc-50 p-4 space-y-2 text-sm print:bg-transparent print:border">
          <div className="flex justify-between">
            <span className="text-zinc-500">Montant versé</span>
            <span className="text-lg font-semibold font-mono">
              {fmt(Number(row.paymentAmount))}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-500">Moyen</span>
            <span>{methodLabel(row.method)}</span>
          </div>
          {row.reference && (
            <div className="flex justify-between">
              <span className="text-zinc-500">Référence</span>
              <span className="font-mono text-xs">{row.reference}</span>
            </div>
          )}
          <div className="flex justify-between border-t pt-2">
            <span className="text-zinc-500">Montant facture</span>
            <span className="font-mono">{fmt(Number(row.invoiceAmount))}</span>
          </div>
        </section>

        <footer className="text-center text-xs text-zinc-400 border-t pt-4">
          Document généré automatiquement — conserver ce reçu comme preuve de paiement.
        </footer>
      </article>
    </main>
  );
}