"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2 } from "lucide-react";
import { createFeeRow, deleteFeeRow } from "./fee-schedule-actions";

type FeeRow = { id: string; level: string; installmentLabel: string; amount: string };

function fmt(n: number) {
  return new Intl.NumberFormat("fr-FR").format(n);
}

export function FeeSchedule({ rows }: { rows: FeeRow[] }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const grouped = new Map<string, FeeRow[]>();
  for (const r of rows) {
    const list = grouped.get(r.level) ?? [];
    list.push(r);
    grouped.set(r.level, list);
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-cream-dark bg-white shadow-sm">
      <div className="border-b border-cream-dark px-5 py-4">
        <div className="font-semibold text-zinc-900">Barème des frais de scolarité</div>
        <div className="mt-0.5 text-xs text-zinc-400">Configurable par niveau et par échéance</div>
      </div>

      {grouped.size === 0 ? (
        <p className="px-6 py-8 text-center text-sm text-zinc-400">Aucun barème configuré pour l&apos;instant.</p>
      ) : (
        Array.from(grouped.entries()).map(([level, items]) => (
          <div key={level} className="border-b border-cream last:border-b-0">
            <div className="bg-cream px-5 py-2 text-xs font-bold uppercase tracking-wider text-forest">{level}</div>
            <table className="w-full text-sm">
              <tbody>
                {items.map((r) => (
                  <tr key={r.id} className="border-t border-cream">
                    <td className="px-5 py-2.5 text-zinc-700">{r.installmentLabel}</td>
                    <td className="px-5 py-2.5 text-right font-mono text-zinc-900">{fmt(Number(r.amount))} FCFA</td>
                    <td className="w-10 px-3 py-2.5 text-right">
                      <button
                        onClick={() => startTransition(() => deleteFeeRow(r.id))}
                        className="text-zinc-300 hover:text-red-600"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))
      )}

      <form
        action={(formData) => {
          setError(null);
          startTransition(async () => {
            const result = await createFeeRow(formData);
            if (result?.error) setError(result.error);
          });
        }}
        className="flex flex-wrap items-end gap-2 border-t border-cream-dark bg-cream/40 px-5 py-4"
      >
        {error && <div className="w-full rounded-lg bg-red-50 px-3 py-1.5 text-xs text-red-700">{error}</div>}
        <div className="space-y-1">
          <label className="text-xs font-medium text-zinc-500">Niveau</label>
          <input name="level" required placeholder="ex: CP1" className="w-28 rounded-lg border border-cream-dark px-2 py-1.5 text-sm" />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-zinc-500">Échéance</label>
          <input
            name="installmentLabel"
            required
            placeholder="ex: Dépôt, Octobre..."
            className="w-40 rounded-lg border border-cream-dark px-2 py-1.5 text-sm"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-zinc-500">Montant (FCFA)</label>
          <input name="amount" type="number" min="1" required className="w-32 rounded-lg border border-cream-dark px-2 py-1.5 text-sm" />
        </div>
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-1.5 rounded-lg bg-forest px-3 py-1.5 text-sm font-medium text-white disabled:opacity-60"
        >
          <Plus size={14} /> Ajouter
        </button>
      </form>
    </div>
  );
}
