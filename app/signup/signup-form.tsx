"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { signUp } from "./actions";

export function SignupForm() {
  const [error, setError] = useState<string | null>(null);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);
  const [pending, startTransition] = useTransition();

  if (needsConfirmation) {
    return (
      <div className="w-full max-w-sm space-y-4 rounded-2xl border border-forest-faint bg-white p-8 text-center shadow-sm">
        <CheckCircle2 className="mx-auto text-forest" size={32} />
        <h1 className="text-lg font-semibold text-forest-dark">Vérifie ta boîte mail</h1>
        <p className="text-sm text-zinc-500">
          Un email de confirmation vient de t&apos;être envoyé. Clique sur le lien pour activer ton compte, puis reviens te connecter.
        </p>
        <Link href="/login" className="inline-block text-sm font-medium text-forest underline">
          Retour à la connexion
        </Link>
      </div>
    );
  }

  return (
    <form
      action={(formData) => {
        setError(null);
        startTransition(async () => {
          const result = await signUp(formData);
          if (result?.error) setError(result.error);
          if (result?.needsEmailConfirmation) setNeedsConfirmation(true);
        });
      }}
      className="w-full max-w-sm space-y-4 rounded-2xl border border-forest-faint bg-white p-8 shadow-sm"
    >
      <div>
        <h1 className="text-xl font-semibold text-forest-dark">Créer un compte</h1>
        <p className="text-sm text-zinc-500">Espace de gestion scolaire</p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
      )}

      <div className="space-y-1">
        <label htmlFor="email" className="text-sm font-medium text-forest-dark">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="w-full rounded-lg border border-forest-faint px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-forest-light"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="password" className="text-sm font-medium text-forest-dark">
          Mot de passe
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={6}
          className="w-full rounded-lg border border-forest-faint px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-forest-light"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="confirmPassword" className="text-sm font-medium text-forest-dark">
          Confirmer le mot de passe
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          minLength={6}
          className="w-full rounded-lg border border-forest-faint px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-forest-light"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-forest py-2.5 text-sm font-medium text-white transition-colors hover:bg-forest-dark disabled:opacity-60"
      >
        {pending ? "Création..." : "Créer mon compte"}
      </button>

      <p className="text-center text-sm text-zinc-500">
        Déjà un compte ?{" "}
        <Link href="/login" className="font-medium text-forest underline">
          Se connecter
        </Link>
      </p>
    </form>
  );
}
