import { eq } from "drizzle-orm";
import { UserPlus, Users } from "lucide-react";
import { getCurrentProfile } from "@/lib/auth/profile";
import { db } from "@/lib/db";
import { students, classes } from "@/lib/db/schema";
import { SectionHeader } from "@/components/shared/section-header";
import { Btn } from "@/components/shared/btn";
import { DeleteStudentButton } from "./delete-button";

export default async function StudentsPage() {
  const profile = await getCurrentProfile();

  const rows = profile.schoolId
    ? await db
        .select({
          id: students.id,
          firstName: students.firstName,
          lastName: students.lastName,
          matricule: students.matricule,
          className: classes.name,
        })
        .from(students)
        .leftJoin(classes, eq(classes.id, students.classId))
        .where(eq(students.schoolId, profile.schoolId))
    : [];

  return (
    <div className="space-y-5 p-6">
      <SectionHeader
        title="Élèves"
        subtitle={`${rows.length} élève${rows.length > 1 ? "s" : ""} inscrit${rows.length > 1 ? "s" : ""}`}
      >
        <Btn variant="primary" icon={<UserPlus size={14} />} href="/students/new">
          Ajouter un élève
        </Btn>
      </SectionHeader>

      <div className="overflow-hidden rounded-2xl border border-cream-dark bg-white shadow-sm">
        <div className="border-b border-cream-dark px-5 py-4">
          <div className="font-semibold text-zinc-900">Liste des élèves</div>
        </div>
        {rows.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm text-zinc-400">
            <Users className="mx-auto mb-3 h-8 w-8 opacity-30" />
            Aucun élève enregistré pour l&apos;instant.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-cream text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">
                <th className="px-5 py-3">Élève</th>
                <th className="px-5 py-3">Matricule</th>
                <th className="px-5 py-3">Classe</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((s, i) => (
                <tr key={s.id} className={`border-t border-cream ${i % 2 === 1 ? "bg-cream/30" : "bg-white"}`}>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-forest-faint text-xs font-bold text-forest">
                        {s.firstName[0]}
                        {s.lastName[0]}
                      </div>
                      <span className="text-sm font-semibold text-zinc-900">
                        {s.lastName.toUpperCase()} {s.firstName}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-zinc-500">{s.matricule ?? "—"}</td>
                  <td className="px-5 py-3.5">
                    {s.className ? (
                      <span className="rounded-full bg-forest-faint px-2 py-0.5 text-xs text-forest">
                        {s.className}
                      </span>
                    ) : (
                      <span className="text-sm text-zinc-400">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-right space-x-3">
                    <a href={`/students/${s.id}`} className="text-zinc-700 underline">
                      Modifier
                    </a>
                    <a href={`/students/${s.id}/bulletin`} className="text-zinc-700 underline">
                      Bulletin
                    </a>
                    <DeleteStudentButton studentId={s.id} />
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
