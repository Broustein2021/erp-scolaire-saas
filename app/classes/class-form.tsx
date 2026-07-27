"use client";

import { useState, useTransition } from "react";

export function ClassForm({
  defaultValues,
  onSubmit,
  submitLabel,
}: {
  defaultValues?: { name: string; level: string; academicYear: string };
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
        <label htmlFor="name" className="text-sm font-medium">
          Nom de la classe
        </label>
        <input
          id="name"
          name="name"
          required
          placeholder="Ex: CP1 A"
          defaultValue={defaultValues?.name}
          className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-400"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label htmlFor="level" className="text-sm font-medium">
            Niveau
          </label>
          <input
            id="level"
            name="level"
            required
            placeholder="Ex: CP1, 6e, Terminale"
            defaultValue={defaultValues?.level}
            className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-400"
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="academicYear" className="text-sm font-medium">
            Année scolaire
          </label>
          <input
            id="academicYear"
            name="academicYear"
            required
            placeholder="Ex: 2025-2026"
            defaultValue={defaultValues?.academicYear}
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
