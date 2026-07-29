import Link from "next/link";
import { getCurrentProfile } from "@/lib/auth/profile";
import { getDashboardData } from "@/lib/dashboard/queries";
import { PAYMENT_METHODS } from "@/lib/constants";
import {
  RevenueByClassChart,
  MonthlyRevenueChart,
} from "@/components/dashboard/dashboard-charts";

function fmt(n: number) {
  return new Intl.NumberFormat("fr-FR").format(n) + " FCFA";
}

function methodLabel(value: string) {
  return PAYMENT_METHODS.find((m) => m.value === value)?.label ?? value;
}

export default async function DashboardPage() {
  const profile = await getCurrentProfile();
  const data = await getDashboardData(profile.schoolId);

  const kpis = [
    {
      label: "Élèves inscrits",
      value: String(data.studentCount),
      href: "/students",
      accent: "bg-[#EEF4F1] text-[#1C3D2F]",
    },
    {
      label: "Encaissé (mois)",
      value: fmt(data.monthCollected),
      href: "/invoices",
      accent: "bg-[#FEF5E4] text-[#D9820C]",
    },
    {
      label: "Solde en attente",
      value: fmt(data.outstanding),
      href: "/invoices",
      accent: data.outstanding > 0 ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700",
    },
    {
      label: "Retards",
      value: String(data.overdueCount),
      href: "/invoices",
      accent: data.overdueCount > 0 ? "bg-red-50 text-red-700" : "bg-zinc-100 text-zinc-700",
    },
  ];

  return (
    <main className="mx-auto max-w-6xl p-6 md:p-8 space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-[#1C3D2F]">Tableau de bord</h1>
          <p className="text-sm text-zinc-500 mt-1">
            {data.schoolName ?? "École non rattachée"}
            {data.schoolCity ? ` · ${data.schoolCity}` : ""}
          </p>
          <p className="text-sm text-zinc-500">Connecté : {profile.fullName}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/students/new"
            className="rounded-lg bg-[#1C3D2F] px-4 py-2 text-sm font-medium text-white"
          >
            + Nouvel élève
          </Link>
          <Link
            href="/invoices/new"
            className="rounded-lg border border-[#1C3D2F]/20 bg-white px-4 py-2 text-sm font-medium text-[#1C3D2F]"
          >
            + Facture
          </Link>
        </div>
      </div>

      {!profile.schoolId ? (
        <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Aucune école rattachée. Termine l&apos;onboarding pour voir les indicateurs.
        </p>
      ) : (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {kpis.map((k) => (
              <Link
                key={k.label}
                href={k.href}
                className={`rounded-2xl border p-4 space-y-1 transition hover:shadow-sm ${k.accent}`}
              >
                <div className="text-xs font-medium opacity-70">{k.label}</div>
                <div className="text-lg font-semibold font-mono tracking-tight">{k.value}</div>
              </Link>
            ))}
          </div>

          {/* Mini stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 rounded-2xl border bg-white p-4 text-sm">
            <div>
              <div className="text-xs text-zinc-500">Classes</div>
              <div className="font-mono font-semibold">{data.classCount}</div>
            </div>
            <div>
              <div className="text-xs text-zinc-500">Enseignants</div>
              <div className="font-mono font-semibold">{data.teacherCount}</div>
            </div>
            <div>
              <div className="text-xs text-zinc-500">Notes</div>
              <div className="font-mono font-semibold">{data.gradeCount}</div>
            </div>
            <div>
              <div className="text-xs text-zinc-500">Total encaissé</div>
              <div className="font-mono font-semibold">{fmt(data.totalCollected)}</div>
            </div>
          </div>

          {/* Graphiques */}
          <div className="grid lg:grid-cols-2 gap-6">
            <section className="rounded-2xl border bg-white p-5 space-y-3">
              <h2 className="text-sm font-semibold text-[#1C3D2F]">Revenus par classe</h2>
              <RevenueByClassChart data={data.revenueByClass} />
            </section>
            <section className="rounded-2xl border bg-white p-5 space-y-3">
              <h2 className="text-sm font-semibold text-[#1C3D2F]">
                Flux mensuel — Revenus
              </h2>
              <p className="text-xs text-zinc-400">
                Courbe des encaissements (pas de dépenses dans le schéma actuel).
              </p>
              <MonthlyRevenueChart data={data.monthlyRevenue} />
            </section>
          </div>

          {/* Listes */}
          <div className="grid lg:grid-cols-2 gap-6">
            <section className="rounded-2xl border bg-white overflow-hidden">
              <div className="border-b px-5 py-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-[#1C3D2F]">Transactions récentes</h2>
                <Link href="/invoices" className="text-xs text-zinc-500 underline">
                  Voir tout
                </Link>
              </div>
              {data.recentPayments.length === 0 ? (
                <p className="px-5 py-6 text-sm text-zinc-500">Aucun versement enregistré.</p>
              ) : (
                <ul className="divide-y text-sm">
                  {data.recentPayments.map((p) => (
                    <li key={p.id} className="px-5 py-3 flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="font-medium truncate">{p.studentName}</div>
                        <div className="text-xs text-zinc-500 truncate">
                          {p.invoiceLabel} · {methodLabel(p.method)}
                        </div>
                        <div className="text-xs text-zinc-400">
                          {new Date(p.paidAt).toLocaleDateString("fr-FR")}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="font-mono font-semibold text-green-700">
                          +{fmt(p.amount)}
                        </div>
                        <Link
                          href={`/invoices/${p.invoiceId}/receipt/${p.id}`}
                          className="text-xs text-zinc-500 underline"
                        >
                          Reçu
                        </Link>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="rounded-2xl border bg-white overflow-hidden">
              <div className="border-b px-5 py-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-[#1C3D2F]">Alertes — retards</h2>
                {data.overdueCount > 0 && (
                  <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                    {data.overdueCount}
                  </span>
                )}
              </div>
              {data.overdueInvoices.length === 0 ? (
                <p className="px-5 py-6 text-sm text-zinc-500">Aucune facture en retard.</p>
              ) : (
                <ul className="divide-y text-sm">
                  {data.overdueInvoices.map((inv) => (
                    <li key={inv.id} className="px-5 py-3 flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="font-medium truncate">{inv.studentName}</div>
                        <div className="text-xs text-zinc-500 truncate">{inv.label}</div>
                        <div className="text-xs text-red-600">Échéance : {inv.dueDate}</div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="font-mono font-semibold text-red-700">
                          {fmt(Math.max(inv.amount - inv.paid, 0))}
                        </div>
                        <Link
                          href={`/invoices/${inv.id}`}
                          className="text-xs text-zinc-500 underline"
                        >
                          Voir
                        </Link>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </>
      )}
    </main>
  );
}