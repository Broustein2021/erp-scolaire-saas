import { createClient } from "@/lib/supabase/server";

export default async function TestConnexionPage() {
  const supabase = await createClient();

  // getSession() ne requiert aucune table : si l'URL/clé sont
  // correctes, Supabase répond sans erreur réseau.
  const { error } = await supabase.auth.getSession();

  return (
    <main className="min-h-screen flex items-center justify-center p-8">
      <div className="max-w-md w-full space-y-4 text-center">
        <h1 className="text-xl font-semibold">Test de connexion Supabase</h1>
        <p className="text-sm">
          URL configurée :{" "}
          <code>{process.env.NEXT_PUBLIC_SUPABASE_URL ?? "❌ non définie"}</code>
        </p>
        <p className={error ? "text-red-600" : "text-green-600"}>
          {error
            ? `Échec de connexion : ${error.message}`
            : "✅ Connexion Supabase établie avec succès."}
        </p>
      </div>
    </main>
  );
}
