import { eq } from "drizzle-orm";
import { Plus, BookOpen } from "lucide-react";
import { getCurrentProfile } from "@/lib/auth/profile";
import { db } from "@/lib/db";
import { grades, students } from "@/lib/db/schema";
import { SectionHeader } from "@/components/shared/section-header";
import { Btn } from "@/components/shared/btn";
import { DeleteGradeButton } from "./delete-button";

export default async function GradesPage() {
  const profile = await getCurrentProfile();

  const rows = profile.schoolId
    ? await db
        .select({
          id: grades.id,
          subject: grades.subject,
          term: grades.term,
          score: grades.score,
          rank: grades.rank,
          studentId: students.id,
          studentFirstName: students.firstName,
          studentLastName: students.lastName,
        })
        .from(grades)
        .innerJoin(students, eq(students.id, grades.studentId))
        .where(eq(students.schoolId, profile.schoolId))
    : [];

  return (
    <div className="space-y-5 p-6">
      <SectionHeader
        title="Notes"
        subtitle={`${rows.length} note${rows.length > 1 ? "s" : ""} enregistrée${rows.length > 1 ? "s" : ""}`}
      >
        <Btn variant="primary" icon={<Plus size={14} />} href="/grades/new">
          Ajouter une note
        </Btn>
      </SectionHeader>

      <div className="overflow-hidden rounded-2xl border border-cream-dark bg-white shadow-sm">
        <div className="border-b border-cream-dark px-5 py-4">
          <div className="font-semibold text-zinc-900">Liste des notes</div>
        </div>
        {rows.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm text-zinc-400">
            <BookOpen className="mx-auto mb-3 h-8 w-8 opacity-30" />
            Aucune note enregistrée pour l&apos;instant.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-cream text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">
                <th className="px-5 py-3">Élève</th>
                <th className="px-5 py-3">Matière</th>
                <th className="px-5 py-3">Période</th>
                <th className="px-5 py-3">Note</th>
                <th className="px-5 py-3">Rang</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((g, i) => {
                const score = Number(g.score);
                return (
                  <tr key={g.id} className={`border-t border-cream ${i % 2 === 1 ? "bg-cream/30" : "bg-white"}`}>
                    <td className="px-5 py-3.5 font-medium text-zinc-900">
                      {g.studentLastName.toUpperCase()} {g.studentFirstName}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="rounded-full bg-forest-faint px-2 py-0.5 text-xs text-forest">
                        {g.subject}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-zinc-500">{g.term}</td>
                    <td
                      className={`px-5 py-3.5 font-mono font-semibold ${
                        score >= 10 ? "text-green-700" : "text-red-700"
                      }`}
                    >
                      {g.score}/20
                    </td>
                    <td className="px-5 py-3.5 text-zinc-500">{g.rank ?? "—"}</td>
                    <td className="px-5 py-3.5 text-right space-x-3">
                      <a href={`/students/${g.studentId}/bulletin`} className="text-zinc-700 underline">
                        Bulletin
                      </a>
                      <a href={`/grades/${g.id}`} className="text-zinc-700 underline">
                        Modifier
                      </a>
                      <DeleteGradeButton gradeId={g.id} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
