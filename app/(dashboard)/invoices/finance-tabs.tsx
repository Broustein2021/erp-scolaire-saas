"use client";

import { useState } from "react";
import Link from "next/link";
import { FeeSchedule } from "./fee-schedule";
import { DeleteInvoiceButton } from "./delete-button";

type InvoiceRow = {
  id: string;
  label: string;
  amount: number;
  paid: number;
  dueDate: string;
  studentName: string;
  status: "paid" | "partial" | "overdue" | "pending";
};

const STATUS_STYLE: Record<InvoiceRow["status"], { label: string; className: string }> = {
  paid: { label: "Réglé", className: "bg-green-100 text-green-800" },
  partial: { label: "Partiel", className: "bg-amber-faint text-amber" },
  overdue: { label: "En retard", className: "bg-red-100 text-red-800" },
  pending: { label: "À venir", className: "bg-zinc-100 text-zinc-500" },
};

function fmt(n: number) {
  return new Intl.NumberFormat("fr-FR").format(n);
}

export function FinanceTabs({
  invoiceRows,
  feeRows,
}: {
  invoiceRows: InvoiceRow[];
  feeRows: { id: string; level: string; installmentLabel: string; amount: string }[];
}) {
  const [tab, setTab] = useState<"transactions" | "schedule">("transactions");

  return (
    <div className="space-y-5">
      <div className="flex w-fit gap-1 rounded-xl bg-cream-dark p-1">
        {(
          [
            ["transactions", "Journal des transactions"],
            ["schedule", "Barème des frais"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              tab === id ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "schedule" && <FeeSchedule rows={feeRows} />}

      {tab === "transactions" && (
        <div className="overflow-hidden rounded-2xl border border-cream-dark bg-white shadow-sm">
          {invoiceRows.length === 0 ? (
            <p className="px-6 py-10 text-center text-sm text-zinc-400">Aucune facture enregistrée.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-cream text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  <th className="px-5 py-3">Élève</th>
                  <th className="px-5 py-3">Libellé</th>
                  <th className="px-5 py-3 text-right">Montant</th>
                  <th className="px-5 py-3 text-right">Versé</th>
                  <th className="px-5 py-3">Date limite</th>
                  <th className="px-5 py-3">Statut</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {invoiceRows.map((r, i) => {
                  const badge = STATUS_STYLE[r.status];
                  return (
                    <tr key={r.id} className={`border-t border-cream ${i % 2 === 1 ? "bg-cream/30" : ""}`}>
                      <td className="px-5 py-3 font-medium text-zinc-900">{r.studentName}</td>
                      <td className="px-5 py-3 text-zinc-600">{r.label}</td>
                      <td className="px-5 py-3 text-right font-mono text-zinc-900">{fmt(r.amount)}</td>
                      <td className="px-5 py-3 text-right font-mono text-zinc-500">{fmt(r.paid)}</td>
                      <td className="px-5 py-3 text-zinc-500">{r.dueDate}</td>
                      <td className="px-5 py-3">
                        <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${badge.className}`}>
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right space-x-3">
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
          )}
        </div>
      )}
    </div>
  );
}
