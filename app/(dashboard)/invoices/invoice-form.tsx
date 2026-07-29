"use client";

import { useState, useTransition } from "react";

type StudentOption = { id: string; label: string };

export function InvoiceForm({
  studentOptions,
  defaultValues,
  onSubmit,
  submitLabel,
}: {
  studentOptions: StudentOption[];
  defaultValues?: {
    studentId: string;
    label: string;
    amount: string;
    dueDate: string;
  };
  onSubmit: (formData: FormData) => Promise<{ error?: string } | void>;
  submitLabel: string;
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
      className="max-w-lg space-y-4 rounded-2xl border bg-white p-8 shadow-sm"
    >
      {error && (
        <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
      )}

      <div className="space-y-1">
        <label htmlFor="studentId" className="text-sm font-medium">
          Élève
        </label>
        <select
          id="studentId"
          name="studentId"
          required
          defaultValue={defaultValues?.studentId ?? ""}
          className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-400"
        >
          <option value="" disabled>
            — Sélectionner —
          </option>
          {studentOptions.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
        {studentOptions.length === 0 && (
          <p className="text-xs text-zinc-500">
            Aucun élève enregistré — ajoute d&apos;abord un élève.
          </p>
        )}
      </div>

      <div className="space-y-1">
        <label htmlFor="label" className="text-sm font-medium">
          Libellé
        </label>
        <input
          id="label"
          name="label"
          required
          placeholder="ex: Scolarité — Octobre"
          defaultValue={defaultValues?.label}
          className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-400"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label htmlFor="amount" className="text-sm font-medium">
            Montant (FCFA)
          </label>
          <input
            id="amount"
            name="amount"
            type="number"
            min="1"
            step="1"
            required
            defaultValue={defaultValues?.amount}
            className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-400"
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="dueDate" className="text-sm font-medium">
            Date limite
          </label>
          <input
            id="dueDate"
            name="dueDate"
            type="date"
            required
            defaultValue={defaultValues?.dueDate}
            className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-400"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-zinc-900 py-2.5 text-sm font-medium text-white disabled:opacity-60"
      >
        {pending ? "Enregistrement..." : submitLabel}
      </button>
    </form>
  );
}
