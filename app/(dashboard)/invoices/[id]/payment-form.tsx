"use client";

import { useState, useTransition } from "react";
import { PAYMENT_METHODS } from "@/lib/constants";
import { Btn } from "@/components/shared/btn";

export function PaymentForm({
  maxAmount,
  defaultValues,
  submitLabel = "Enregistrer le versement",
  onSubmit,
}: {
  maxAmount: number;
  defaultValues?: {
    amount: number;
    method: string;
    reference: string | null;
  };
  submitLabel?: string;
  onSubmit: (formData: FormData) => Promise<{ error?: string } | void>;
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <form
      action={(formData) => {
        setError(null);
        startTransition(async () => {
          const result = await onSubmit(formData);
          if (result?.error) setError(result.error);
        });
      }}
      className="space-y-3"
    >
      {error && (
        <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
      )}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label htmlFor="amount" className="text-sm font-medium text-zinc-700">
            Montant (FCFA)
          </label>
          <input
            id="amount"
            name="amount"
            type="number"
            min="1"
            max={maxAmount}
            step="1"
            required
            defaultValue={defaultValues?.amount ?? maxAmount}
            className="w-full rounded-lg border border-cream-dark px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-forest/40"
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="method" className="text-sm font-medium text-zinc-700">
            Moyen de paiement
          </label>
          <select
            id="method"
            name="method"
            required
            defaultValue={defaultValues?.method ?? ""}
            className="w-full rounded-lg border border-cream-dark px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-forest/40"
          >
            <option value="" disabled>
              — Sélectionner —
            </option>
            {PAYMENT_METHODS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="space-y-1">
        <label htmlFor="reference" className="text-sm font-medium text-zinc-700">
          Référence (optionnel)
        </label>
        <input
          id="reference"
          name="reference"
          placeholder="ex: référence de transaction Wave"
          defaultValue={defaultValues?.reference ?? ""}
          className="w-full rounded-lg border border-cream-dark px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-forest/40"
        />
      </div>
      <Btn type="submit" disabled={pending} variant="amber">
        {pending ? "Enregistrement..." : submitLabel}
      </Btn>
    </form>
  );
}
