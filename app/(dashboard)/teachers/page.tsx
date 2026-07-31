import { eq } from "drizzle-orm";
import { UserPlus, RefreshCw } from "lucide-react";
import { getCurrentProfile } from "@/lib/auth/profile";
import { db } from "@/lib/db";
import { teachers } from "@/lib/db/schema";
import { SectionHeader } from "@/components/shared/section-header";
import { Btn } from "@/components/shared/btn";
import { DeleteTeacherButton } from "./delete-button";

export default async function TeachersPage() {
  const profile = await getCurrentProfile();

  const rows = profile.schoolId
    ? await db.select().from(teachers).where(eq(teachers.schoolId, profile.schoolId))
    : [];

  return (
    <div className="space-y-5 p-6">
      <SectionHeader title="Enseignants" subtitle={`${rows.length} enseignant${rows.length > 1 ? "s" : ""} rattaché${rows.length > 1 ? "s" : ""}`}>
        <Btn variant="secondary" icon={<RefreshCw size={14} />}>
          Actualiser
        </Btn>
        <Btn variant="primary" icon={<UserPlus size={14} />} href="/teachers/new">
          Ajouter un enseignant
        </Btn>
      </SectionHeader>

      <div className="overflow-hidden rounded-2xl border border-cream-dark bg-white shadow-sm">
        <div className="border-b border-cream-dark px-5 py-4">
          <div className="font-semibold text-zinc-900">Liste du personnel enseignant</div>
        </div>
        {rows.length === 0 ? (
          <p className="px-6 py-10 text-center text-sm text-zinc-400">Aucun enseignant enregistré.</p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-cream">
                {["Nom", "Matière", "Téléphone", ""].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((t, i) => (
                <tr key={t.id} className={`border-t border-cream ${i % 2 === 1 ? "bg-cream/30" : "bg-white"}`}>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-forest-faint text-xs font-bold text-forest">
                        {t.fullName
                          .split(" ")
                          .map((w) => w[0])
                          .slice(0, 2)
                          .join("")}
                      </div>
                      <span className="text-sm font-semibold text-zinc-900">{t.fullName}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    {t.subject ? (
                      <span className="rounded-full bg-forest-faint px-2 py-0.5 text-xs text-forest">{t.subject}</span>
                    ) : (
                      <span className="text-sm text-zinc-400">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-sm text-zinc-500">{t.phone ?? "—"}</td>
                  <td className="px-5 py-3.5 text-right text-sm space-x-3">
                    <a href={`/teachers/${t.id}`} className="text-zinc-700 underline">
                      Modifier
                    </a>
                    <DeleteTeacherButton teacherId={t.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
