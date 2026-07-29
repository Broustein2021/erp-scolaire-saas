import Link from "next/link";
import { eq } from "drizzle-orm";
import { getCurrentProfile } from "@/lib/auth/profile";
import { db } from "@/lib/db";
import { teachers } from "@/lib/db/schema";

export default async function TeachersPage() {
  const profile = await getCurrentProfile();
  const rows = profile.schoolId
    ? await db.select().from(teachers).where(eq(teachers.schoolId, profile.schoolId))
    : [];

  return (
    <main className="mx-auto max-w-3xl p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Enseignants</h1>
        <Link href="/teachers/new" className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white">
          + Ajouter un enseignant
        </Link>
      </div>
      {rows.length === 0 ? (
        <p className="text-sm text-zinc-500">Aucun enseignant enregistré.</p>
      ) : (
        <div className="overflow-hidden rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 text-left text-zinc-500">
              <tr><th className="px-4 py-2 font-medium">Nom</th><th className="px-4 py-2 font-medium">Matière</th><th className="px-4 py-2 font-medium">Téléphone</th></tr>
            </thead>
            <tbody className="divide-y">
              {rows.map((t) => (
                <tr key={t.id}>
                  <td className="px-4 py-2">{t.fullName}</td>
                  <td className="px-4 py-2 text-zinc-500">{t.subject ?? "—"}</td>
                  <td className="px-4 py-2 text-zinc-500">{t.phone ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}