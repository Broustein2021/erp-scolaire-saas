"use client";

import { useState, useTransition } from "react";
import { login } from "./actions";

export function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <form
      action={(formData) => {
        setError(null);
        startTransition(async () => {
          const result = await login(formData);
          if (result?.error) setError(result.error);
        });
      }}
      className="w-full max-w-sm space-y-4 rounded-2xl border border-forest-faint bg-white p-8 shadow-sm"
    >
      <div>
        <h1 className="text-xl font-semibold text-forest-dark">Connexion</h1>
        <p className="text-sm text-zinc-500">Espace de gestion scolaire</p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
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
          className="w-full rounded-lg border border-forest-faint px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-forest-light"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-forest py-2.5 text-sm font-medium text-white transition-colors hover:bg-forest-dark disabled:opacity-60"
      >
        {pending ? "Connexion..." : "Se connecter"}
      </button>
    </form>
  );
}
