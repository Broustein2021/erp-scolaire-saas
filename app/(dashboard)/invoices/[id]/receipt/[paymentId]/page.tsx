import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { getCurrentProfile } from "@/lib/auth/profile";
import { db } from "@/lib/db";
import { invoices, payments, students, schools } from "@/lib/db/schema";
import { PAYMENT_METHODS } from "@/lib/constants";
import { BackButton } from "@/components/shared/back-button";
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
    <div className="mx-auto max-w-lg space-y-6 p-6">
      {/* Zone non imprimée */}
      <div className="print:hidden flex items-center justify-between">
        <BackButton href={`/invoices/${row.invoiceId}`} label="Retour à la facture" />
        <PrintButton />
      </div>

      {/* Reçu */}
      <article className="space-y-6 rounded-2xl border border-cream-dark bg-white p-8 shadow-sm print:border-0 print:shadow-none">
        <header className="space-y-1 border-b border-cream-dark pb-4 text-center">
          <p className="text-xs uppercase tracking-wide text-amber">Reçu de paiement</p>
          <h1 className="text-xl font-bold text-forest-dark">{row.schoolName}</h1>
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

        <section className="space-y-2 text-sm border-t border-cream-dark pt-4">
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

        <section className="space-y-2 rounded-xl bg-forest-faint p-4 text-sm print:border print:bg-transparent">
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
          <div className="flex justify-between border-t border-cream-dark pt-2">
            <span className="text-zinc-500">Montant facture</span>
            <span className="font-mono">{fmt(Number(row.invoiceAmount))}</span>
          </div>
        </section>

        <footer className="text-center text-xs text-zinc-400 border-t border-cream-dark pt-4">
          Document généré automatiquement — conserver ce reçu comme preuve de paiement.
        </footer>
      </article>
    </div>
  );
}