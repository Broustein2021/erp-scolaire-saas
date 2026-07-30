"use client";

import { useState, useTransition } from "react";

export function TeacherForm({
  defaultValues,
  onSubmit,
  submitLabel,
}: {
  defaultValues?: {
    fullName: string;
    subject: string | null;
    phone: string | null;
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
      className="max-w-md space-y-4 rounded-2xl border bg-white p-8 shadow-sm"
    >
      {error && (
        <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
      )}

      <div className="space-y-1">
        <label htmlFor="fullName" className="text-sm font-medium">
          Nom complet
        </label>
        <input
          id="fullName"
          name="fullName"
          required
          defaultValue={defaultValues?.fullName}
          className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-400"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="subject" className="text-sm font-medium">
          Matière
        </label>
        <input
          id="subject"
          name="subject"
          defaultValue={defaultValues?.subject ?? ""}
          className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-400"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="phone" className="text-sm font-medium">
          Téléphone
        </label>
        <input
          id="phone"
          name="phone"
          defaultValue={defaultValues?.phone ?? ""}
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
