"use client";

import { useState, useTransition } from "react";
import { createOrganizationOnboarding } from "./actions";

const PLANS = [
  { value: "free", label: "Gratuit — 1 école, fonctionnalités de base" },
  { value: "starter", label: "Starter — jusqu'à 3 écoles" },
  { value: "pro", label: "Pro — écoles illimitées, paiements en ligne" },
  { value: "enterprise", label: "Enterprise — sur mesure" },
];

const SCHOOL_TYPES = [
  { value: "primaire", label: "École primaire" },
  { value: "college", label: "Collège" },
  { value: "lycee", label: "Lycée" },
  { value: "universite", label: "Université" },
];

export function OnboardingForm({ email }: { email: string }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <form
      action={(formData) => {
        setError(null);
        startTransition(async () => {
          const result = await createOrganizationOnboarding(formData);
          if (result?.error) setError(result.error);
        });
      }}
      className="w-full max-w-lg space-y-6 rounded-2xl border border-forest-faint bg-white p-8 shadow-sm"
    >
      <div>
        <h1 className="text-xl font-semibold text-forest-dark">Configurer ton établissement</h1>
        <p className="text-sm text-zinc-500">
          Dernière étape avant d&apos;accéder à ton tableau de bord.
        </p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
      )}

      <fieldset className="space-y-4">
        <legend className="text-sm font-semibold text-forest-mid">Organisation</legend>

        <div className="space-y-1">
          <label htmlFor="orgName" className="text-sm font-medium text-forest-dark">
            Nom de l&apos;organisation / du groupe scolaire
          </label>
          <input
            id="orgName"
            name="orgName"
            required
            placeholder="Ex: Groupe Scolaire Les Palmiers"
            className="w-full rounded-lg border border-forest-faint px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-forest-light"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="plan" className="text-sm font-medium text-forest-dark">
            Plan
          </label>
          <select
            id="plan"
            name="plan"
            defaultValue="free"
            className="w-full rounded-lg border border-forest-faint px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-forest-light"
          >
            {PLANS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="text-sm font-semibold text-forest-mid">Établissement</legend>

        <div className="space-y-1">
          <label htmlFor="schoolName" className="text-sm font-medium text-forest-dark">
            Nom de l&apos;établissement
          </label>
          <input
            id="schoolName"
            name="schoolName"
            required
            placeholder="Ex: École Les Palmiers - Cocody"
            className="w-full rounded-lg border border-forest-faint px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-forest-light"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label htmlFor="schoolType" className="text-sm font-medium text-forest-dark">
              Type
            </label>
            <select
              id="schoolType"
              name="schoolType"
              defaultValue="primaire"
              className="w-full rounded-lg border border-forest-faint px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-forest-light"
            >
              {SCHOOL_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label htmlFor="city" className="text-sm font-medium text-forest-dark">
              Ville
            </label>
            <input
              id="city"
              name="city"
              placeholder="Ex: Abidjan"
              className="w-full rounded-lg border border-forest-faint px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-forest-light"
            />
          </div>
        </div>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="text-sm font-semibold text-forest-mid">Ton profil (administrateur)</legend>

        <div className="space-y-1">
          <label htmlFor="fullName" className="text-sm font-medium text-forest-dark">
            Nom complet
          </label>
          <input
            id="fullName"
            name="fullName"
            required
            placeholder="Ex: Marie Brou"
            className="w-full rounded-lg border border-forest-faint px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-forest-light"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-forest-dark">Email</label>
          <input
            disabled
            value={email}
            className="w-full rounded-lg border border-forest-faint bg-cream px-3 py-2 text-sm text-zinc-500"
          />
        </div>
      </fieldset>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-amber py-2.5 text-sm font-medium text-white transition-colors hover:bg-amber-light disabled:opacity-60"
      >
        {pending ? "Création en cours..." : "Créer mon espace"}
      </button>
    </form>
  );
}
