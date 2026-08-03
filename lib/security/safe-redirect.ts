/**
 * N'autorise que des chemins relatifs internes.
 * Bloque : //evil.com, https://evil.com, javascript:, etc.
 */
export function safeInternalPath(
  next: string | null | undefined,
  fallback = "/dashboard"
): string {
  if (!next) return fallback;

  const path = next.trim();

  // Doit commencer par un seul /
  if (!path.startsWith("/") || path.startsWith("//")) {
    return fallback;
  }

  // Pas de protocole / backslash / caractères de contrôle
  if (
    path.includes("://") ||
    path.includes("\\") ||
    /[\x00-\x1f]/.test(path)
  ) {
    return fallback;
  }

  return path;
}