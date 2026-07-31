import { eq } from "drizzle-orm";
import { Download, Plus } from "lucide-react";
import { getCurrentProfile } from "@/lib/auth/profile";
import { db } from "@/lib/db";
import { invoices, payments, students, feeStructures } from "@/lib/db/schema";
import { computeInvoiceStatus } from "@/lib/invoice-status";
import { SectionHeader } from "@/components/shared/section-header";
import { Btn } from "@/components/shared/btn";
import { FinanceTabs } from "./finance-tabs";

function fmt(n: number) {
  return new Intl.NumberFormat("fr-FR").format(n);
}

export default async function InvoicesPage() {
  const profile = await getCurrentProfile();
  const schoolId = profile.schoolId;

  let invoiceRows: {
    id: string;
    label: string;
    amount: number;
    paid: number;
    dueDate: string;
    studentName: string;
    status: "paid" | "partial" | "overdue" | "pending";
  }[] = [];
  let feeRows: { id: string; level: string; installmentLabel: string; amount: string }[] = [];
  let totalIn = 0;
  let totalOutstanding = 0;

  if (schoolId) {
    const rawInvoices = await db
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
      .where(eq(students.schoolId, schoolId));

    const allPayments = rawInvoices.length
      ? await db.select({ invoiceId: payments.invoiceId, amount: payments.amount }).from(payments)
      : [];
    const paidByInvoice = new Map<string, number>();
    for (const p of allPayments) {
      paidByInvoice.set(p.invoiceId, (paidByInvoice.get(p.invoiceId) ?? 0) + Number(p.amount));
    }

    invoiceRows = rawInvoices.map((r) => {
      const paid = paidByInvoice.get(r.id) ?? 0;
      const status = computeInvoiceStatus(Number(r.amount), paid, r.dueDate);
      return {
        id: r.id,
        label: r.label,
        amount: Number(r.amount),
        paid,
        dueDate: r.dueDate,
        studentName: `${r.studentLastName.toUpperCase()} ${r.studentFirstName}`,
        status,
      };
    });

    totalIn = invoiceRows.reduce((acc, r) => acc + r.paid, 0);
    totalOutstanding = invoiceRows.reduce((acc, r) => acc + Math.max(r.amount - r.paid, 0), 0);

    feeRows = await db
      .select({
        id: feeStructures.id,
        level: feeStructures.level,
        installmentLabel: feeStructures.installmentLabel,
        amount: feeStructures.amount,
      })
      .from(feeStructures)
      .where(eq(feeStructures.schoolId, schoolId));
  }

  return (
    <div className="space-y-5 p-6">
      <SectionHeader title="Finance & Comptabilité" subtitle="Gestion des paiements et des flux financiers">
        <Btn variant="secondary" icon={<Download size={14} />}>
          Exporter
        </Btn>
        <Btn variant="primary" icon={<Plus size={14} />} href="/invoices/new">
          Nouvelle facture
        </Btn>
      </SectionHeader>

      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-cream-dark bg-white p-4">
          <div className="mb-2 text-xs text-zinc-400">Total encaissé</div>
          <div className="font-mono text-xl font-bold text-green-800">+{fmt(totalIn)} FCFA</div>
        </div>
        <div className="rounded-xl border border-cream-dark bg-white p-4">
          <div className="mb-2 text-xs text-zinc-400">En attente</div>
          <div className="font-mono text-xl font-bold text-amber">{fmt(totalOutstanding)} FCFA</div>
        </div>
        <div className="rounded-xl border border-cream-dark bg-white p-4">
          <div className="mb-2 text-xs text-zinc-400">Nombre de factures</div>
          <div className="font-mono text-xl font-bold text-forest">{invoiceRows.length}</div>
        </div>
      </div>

      <FinanceTabs invoiceRows={invoiceRows} feeRows={feeRows} />
    </div>
  );
}
