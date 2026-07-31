"use client";

import { useState, useTransition } from "react";
import { Btn } from "@/components/shared/btn";

type ClassOption = { id: string; name: string };

export function StudentForm({
  classOptions,
  defaultValues,
  onSubmit,
  submitLabel,
}: {
  classOptions: ClassOption[];
  defaultValues?: {
    firstName: string;
    lastName: string;
    birthDate: string | null;
    matricule: string | null;
    classId: string | null;
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
      className="max-w-lg space-y-4 rounded-2xl border border-cream-dark bg-white p-8 shadow-sm"
    >
      {error && (
        <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label htmlFor="firstName" className="text-sm font-medium text-zinc-700">
            Prénom
          </label>
          <input
            id="firstName"
            name="firstName"
            required
            defaultValue={defaultValues?.firstName}
            className="w-full rounded-lg border border-cream-dark px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-forest/40"
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="lastName" className="text-sm font-medium text-zinc-700">
            Nom
          </label>
          <input
            id="lastName"
            name="lastName"
            required
            defaultValue={defaultValues?.lastName}
            className="w-full rounded-lg border border-cream-dark px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-forest/40"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label htmlFor="birthDate" className="text-sm font-medium text-zinc-700">
            Date de naissance
          </label>
          <input
            id="birthDate"
            name="birthDate"
            type="date"
            defaultValue={defaultValues?.birthDate ?? ""}
            className="w-full rounded-lg border border-cream-dark px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-forest/40"
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="matricule" className="text-sm font-medium text-zinc-700">
            Matricule
          </label>
          <input
            id="matricule"
            name="matricule"
            defaultValue={defaultValues?.matricule ?? ""}
            className="w-full rounded-lg border border-cream-dark px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-forest/40"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label htmlFor="classId" className="text-sm font-medium text-zinc-700">
          Classe
        </label>
        <select
          id="classId"
          name="classId"
          defaultValue={defaultValues?.classId ?? ""}
          className="w-full rounded-lg border border-cream-dark px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-forest/40"
        >
          <option value="">— Aucune —</option>
          {classOptions.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        {classOptions.length === 0 && (
          <p className="text-xs text-zinc-400">
            Aucune classe créée pour l&apos;instant — l&apos;élève peut être ajouté sans classe.
          </p>
        )}
      </div>

      <Btn type="submit" disabled={pending} variant="primary" fullWidth>
        {pending ? "Enregistrement..." : submitLabel}
      </Btn>
    </form>
  );
}
