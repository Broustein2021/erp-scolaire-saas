/**
 * URL canonique de l'application — JAMAIS dérivée du header Host.
 * Utilisée pour les liens email (reset password, confirmation, etc.).
 */
export function getSiteUrl(): string {
  const url = process.env.SITE_URL?.trim();

  if (!url) {
    // En dev uniquement : fallback localhost
    if (process.env.NODE_ENV === "development") {
      return "http://localhost:3000";
    }
    throw new Error(
      "SITE_URL manquant. Définis SITE_URL=https://ton-domaine.com dans .env (variable serveur, pas NEXT_PUBLIC_)."
    );
  }

  // Refuse les valeurs non-http(s)
  if (!/^https?:\/\//i.test(url)) {
    throw new Error(`SITE_URL invalide: ${url}`);
  }

  return url.replace(/\/$/, ""); // pas de slash final
}