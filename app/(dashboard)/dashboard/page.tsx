import Link from "next/link";
import { eq } from "drizzle-orm";
import { AlertTriangle, CreditCard, GraduationCap, Plus, TrendingDown, TrendingUp } from "lucide-react";
import { getCurrentProfile } from "@/lib/auth/profile";
import { logout } from "@/app/login/actions";
import { db } from "@/lib/db";
import { students, classes, invoices, payments } from "@/lib/db/schema";
import { RevenueByClassChart, MonthlyRevenueChart } from "@/components/dashboard/dashboard-charts";

function fmtShort(n: number) {
  if (n >= 1000000) return (n / 1000000).toFixed(1).replace(".", ",") + " M FCFA";
  if (n >= 1000) return (n / 1000).toFixed(0) + " K FCFA";
  return new Intl.NumberFormat("fr-FR").format(n) + " FCFA";
}

export default async function DashboardPage() {
  const profile = await getCurrentProfile();
  const schoolId = profile.schoolId;

  let totalStudents = 0;
  let totalRevenue = 0;
  let overdueAmount = 0;
  let monthRevenue = 0;
  let revenueByClass: { name: string; montant: number }[] = [];
  let monthlyFlow: { mois: string; revenus: number }[] = [];
  let recentPayments: { id: string; label: string; studentName: string; amount: number; paidAt: Date }[] = [];
  let overdueStudents: { id: string; name: string; amount: number }[] = [];

  if (schoolId) {
    const studentRows = await db
      .select({ id: students.id, firstName: students.firstName, lastName: students.lastName, classId: students.classId })
      .from(students)
      .where(eq(students.schoolId, schoolId));
    totalStudents = studentRows.length;
    const studentById = new Map(studentRows.map((s) => [s.id, s]));

    const classRows = await db.select({ id: classes.id, name: classes.name }).from(classes).where(eq(classes.schoolId, schoolId));
    const classNameById = new Map(classRows.map((c) => [c.id, c.name]));

    const allInvoiceRows = await db
      .select({ id: invoices.id, studentId: invoices.studentId, amount: invoices.amount, dueDate: invoices.dueDate })
      .from(invoices);
    const schoolInvoiceRows = allInvoiceRows.filter((r) => studentById.has(r.studentId));

    const allPaymentRows = await db
      .select({ id: payments.id, invoiceId: payments.invoiceId, amount: payments.amount, paidAt: payments.paidAt, label: invoices.label })
      .from(payments)
      .innerJoin(invoices, eq(invoices.id, payments.invoiceId));
    const invoiceIds = new Set(schoolInvoiceRows.map((r) => r.id));
    const paymentRows = allPaymentRows.filter((p) => invoiceIds.has(p.invoiceId));

    totalRevenue = paymentRows.reduce((acc, p) => acc + Number(p.amount), 0);

    const paidByInvoice = new Map<string, number>();
    for (const p of paymentRows) paidByInvoice.set(p.invoiceId, (paidByInvoice.get(p.invoiceId) ?? 0) + Number(p.amount));

    const today = new Date();
    overdueAmount = schoolInvoiceRows.reduce((acc, inv) => {
      const paid = paidByInvoice.get(inv.id) ?? 0;
      const remaining = Math.max(Number(inv.amount) - paid, 0);
      const isOverdue = new Date(inv.dueDate) < today && remaining > 0;
      return acc + (isOverdue ? remaining : 0);
    }, 0);

    const now = new Date();
    monthRevenue = paymentRows
      .filter((p) => {
        const d = new Date(p.paidAt);
        return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
      })
      .reduce((acc, p) => acc + Number(p.amount), 0);

    const revenueByClassMap = new Map<string, number>();
    for (const p of paymentRows) {
      const inv = schoolInvoiceRows.find((i) => i.id === p.invoiceId);
      const student = inv ? studentById.get(inv.studentId) : undefined;
      const className = student?.classId ? classNameById.get(student.classId) ?? "Sans classe" : "Sans classe";
      revenueByClassMap.set(className, (revenueByClassMap.get(className) ?? 0) + Number(p.amount));
    }
    revenueByClass = Array.from(revenueByClassMap.entries()).map(([name, montant]) => ({ name, montant }));

    const monthLabels = ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun", "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc"];
    const monthlyMap = new Map<string, number>();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      monthlyMap.set(monthLabels[d.getMonth()], 0);
    }
    for (const p of paymentRows) {
      const d = new Date(p.paidAt);
      const key = monthLabels[d.getMonth()];
      if (monthlyMap.has(key)) monthlyMap.set(key, (monthlyMap.get(key) ?? 0) + Number(p.amount));
    }
    monthlyFlow = Array.from(monthlyMap.entries()).map(([mois, revenus]) => ({ mois, revenus }));

    recentPayments = paymentRows
      .slice()
      .sort((a, b) => new Date(b.paidAt).getTime() - new Date(a.paidAt).getTime())
      .slice(0, 6)
      .map((p) => {
        const inv = schoolInvoiceRows.find((i) => i.id === p.invoiceId);
        const student = inv ? studentById.get(inv.studentId) : undefined;
        return {
          id: p.id,
          label: p.label,
          studentName: student ? `${student.firstName} ${student.lastName}` : "—",
          amount: Number(p.amount),
          paidAt: new Date(p.paidAt),
        };
      });

    const overdueByStudent = new Map<string, number>();
    for (const inv of schoolInvoiceRows) {
      const paid = paidByInvoice.get(inv.id) ?? 0;
      const remaining = Math.max(Number(inv.amount) - paid, 0);
      if (new Date(inv.dueDate) < today && remaining > 0) {
        overdueByStudent.set(inv.studentId, (overdueByStudent.get(inv.studentId) ?? 0) + remaining);
      }
    }
    overdueStudents = Array.from(overdueByStudent.entries()).map(([studentId, amount]) => {
      const s = studentById.get(studentId);
      return { id: studentId, name: s ? `${s.firstName} ${s.lastName}` : "—", amount };
    });
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="mb-1 text-xs font-medium text-zinc-400">Bienvenue</div>
          <h1 className="text-2xl font-bold text-zinc-900">Tableau de bord</h1>
          <p className="mt-1 text-sm text-zinc-500">{profile.fullName}</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/students/new"
            className="inline-flex items-center gap-2 rounded-lg bg-forest px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-forest-dark"
          >
            <Plus size={14} /> Nouvel élève
          </Link>
          <form action={logout}>
            <button className="text-sm text-zinc-500 underline">Se déconnecter</button>
          </form>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="flex flex-col gap-3 rounded-2xl border border-cream-dark bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="text-sm font-medium text-zinc-500">Élèves inscrits</div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-forest-faint">
              <GraduationCap size={20} className="text-forest" />
            </div>
          </div>
          <div className="font-mono text-2xl font-semibold text-zinc-900">{totalStudents}</div>
        </div>

        <div className="flex flex-col gap-3 rounded-2xl border border-cream-dark bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="text-sm font-medium text-zinc-500">Revenus collectés</div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-forest-faint">
              <TrendingUp size={20} className="text-forest" />
            </div>
          </div>
          <div className="font-mono text-2xl font-semibold text-zinc-900">{fmtShort(totalRevenue)}</div>
        </div>

        <div className="flex flex-col gap-3 rounded-2xl border border-cream-dark bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="text-sm font-medium text-zinc-500">Paiements en retard</div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100">
              <AlertTriangle size={20} className="text-red-800" />
            </div>
          </div>
          <div className="font-mono text-2xl font-semibold text-zinc-900">{fmtShort(overdueAmount)}</div>
          <div className="flex items-center gap-1 text-xs text-red-800">
            <TrendingDown size={11} /> {overdueStudents.length} élève{overdueStudents.length > 1 ? "s" : ""} concerné{overdueStudents.length > 1 ? "s" : ""}
          </div>
        </div>

        <div className="flex flex-col gap-3 rounded-2xl border border-cream-dark bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="text-sm font-medium text-zinc-500">Encaissements — mois</div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-faint">
              <CreditCard size={20} className="text-amber" />
            </div>
          </div>
          <div className="font-mono text-2xl font-semibold text-zinc-900">{fmtShort(monthRevenue)}</div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <div className="rounded-2xl border border-cream-dark bg-white p-5 shadow-sm lg:col-span-3">
          <div className="mb-4">
            <div className="font-semibold text-zinc-900">Revenus par classe</div>
            <div className="mt-0.5 text-xs text-zinc-400">Cumul de l&apos;année</div>
          </div>
          {revenueByClass.length > 0 ? (
            <RevenueByClassChart data={revenueByClass} />
          ) : (
            <p className="py-10 text-center text-sm text-zinc-400">Aucun paiement enregistré.</p>
          )}
        </div>

        <div className="rounded-2xl border border-cream-dark bg-white p-5 shadow-sm lg:col-span-2">
          <div className="mb-4">
            <div className="font-semibold text-zinc-900">Encaissements mensuels</div>
            <div className="mt-0.5 text-xs text-zinc-400">6 derniers mois</div>
          </div>
          <MonthlyRevenueChart data={monthlyFlow} />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-cream-dark bg-white p-5 shadow-sm lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div className="font-semibold text-zinc-900">Transactions récentes</div>
            <Link href="/invoices" className="text-xs font-medium text-zinc-500 hover:text-zinc-900">
              Voir tout →
            </Link>
          </div>
          {recentPayments.length === 0 ? (
            <p className="py-6 text-center text-sm text-zinc-400">Aucune transaction.</p>
          ) : (
            <div>
              {recentPayments.map((tx, i) => (
                <div key={tx.id} className={`flex items-center gap-3 py-2.5 ${i > 0 ? "border-t border-cream" : ""}`}>
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-green-100">
                    <TrendingUp size={14} className="text-green-800" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-zinc-900">{tx.label}</div>
                    <div className="truncate text-xs text-zinc-400">
                      {tx.studentName} · {tx.paidAt.toLocaleDateString("fr-FR")}
                    </div>
                  </div>
                  <div className="flex-shrink-0 font-mono text-sm font-semibold text-green-800">
                    +{new Intl.NumberFormat("fr-FR").format(tx.amount)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-cream-dark bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div className="font-semibold text-zinc-900">Alertes retard</div>
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-700 text-xs text-white">
              {overdueStudents.length}
            </span>
          </div>
          {overdueStudents.length === 0 ? (
            <p className="py-6 text-center text-sm text-zinc-400">Aucun retard.</p>
          ) : (
            <div className="space-y-2">
              {overdueStudents.map((s) => (
                <div key={s.id} className="flex items-center justify-between rounded-lg bg-red-50 px-3 py-2">
                  <span className="truncate text-sm text-zinc-900">{s.name}</span>
                  <span className="font-mono text-xs font-semibold text-red-800">{fmtShort(s.amount)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
