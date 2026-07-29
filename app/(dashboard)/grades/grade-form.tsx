"use client";

import { useState, useTransition } from "react";

type StudentOption = { id: string; label: string };

export function GradeForm({
  studentOptions,
  defaultValues,
  onSubmit,
  submitLabel,
}: {
  studentOptions: StudentOption[];
  defaultValues?: {
    studentId: string;
    subject: string;
    term: string;
    score: string;
    classAverage: string | null;
    rank: number | null;
    remark: string | null;
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
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label htmlFor="subject" className="text-sm font-medium">
            Matière
          </label>
          <input
            id="subject"
            name="subject"
            required
            placeholder="ex: Mathématiques"
            defaultValue={defaultValues?.subject}
            className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-400"
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="term" className="text-sm font-medium">
            Période
          </label>
          <input
            id="term"
            name="term"
            required
            placeholder="ex: Trimestre 1"
            defaultValue={defaultValues?.term}
            className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-400"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-1">
          <label htmlFor="score" className="text-sm font-medium">
            Note /20
          </label>
          <input
            id="score"
            name="score"
            type="number"
            min="0"
            max="20"
            step="0.01"
            required
            defaultValue={defaultValues?.score}
            className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-400"
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="classAverage" className="text-sm font-medium">
            Moy. classe
          </label>
          <input
            id="classAverage"
            name="classAverage"
            type="number"
            min="0"
            max="20"
            step="0.01"
            defaultValue={defaultValues?.classAverage ?? ""}
            className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-400"
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="rank" className="text-sm font-medium">
            Rang
          </label>
          <input
            id="rank"
            name="rank"
            type="number"
            min="1"
            step="1"
            defaultValue={defaultValues?.rank ?? ""}
            className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-400"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label htmlFor="remark" className="text-sm font-medium">
          Appréciation
        </label>
        <input
          id="remark"
          name="remark"
          placeholder="ex: Bon travail"
          defaultValue={defaultValues?.remark ?? ""}
          className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-400"
        />
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