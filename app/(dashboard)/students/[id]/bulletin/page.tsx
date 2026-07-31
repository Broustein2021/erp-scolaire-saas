import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { getCurrentProfile } from "@/lib/auth/profile";
import { db } from "@/lib/db";
import { students, grades, schools } from "@/lib/db/schema";
import { BackButton } from "@/components/shared/back-button";
import { PrintButton } from "./print-button";

export default async function BulletinPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await getCurrentProfile();
  if (!profile.schoolId) notFound();

  const [student] = await db
    .select()
    .from(students)
    .where(and(eq(students.id, id), eq(students.schoolId, profile.schoolId)));
  if (!student) notFound();

  const [school] = await db.select().from(schools).where(eq(schools.id, profile.schoolId));

  const gradeRows = await db.select().from(grades).where(eq(grades.studentId, id));

  const byTerm = new Map<string, typeof gradeRows>();
  for (const g of gradeRows) {
    const list = byTerm.get(g.term) ?? [];
    list.push(g);
    byTerm.set(g.term, list);
  }

  const overallAverage =
    gradeRows.length > 0
      ? gradeRows.reduce((acc, g) => acc + Number(g.score), 0) / gradeRows.length
      : null;

  return (
    <main className="mx-auto max-w-2xl space-y-6 p-8">
      <div className="flex items-center justify-between print:hidden">
        <BackButton href={`/students/${id}`} label="Retour à la fiche élève" />
        <PrintButton />
      </div>

      <div className="rounded-2xl border border-cream-dark bg-white p-8 shadow-sm">
        <div className="mb-6 border-b border-cream-dark pb-6 text-center">
          <div className="text-lg font-bold text-forest-dark">{school?.name ?? "Établissement"}</div>
          {school?.city && <div className="text-sm text-zinc-500">{school.city}</div>}
          <div className="mt-4 text-xl font-semibold text-zinc-900">BULLETIN SCOLAIRE</div>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-zinc-500">Élève :</span>{" "}
            <span className="font-medium text-zinc-900">
              {student.lastName.toUpperCase()} {student.firstName}
            </span>
          </div>
          <div>
            <span className="text-zinc-500">Matricule :</span>{" "}
            <span className="font-medium text-zinc-900">{student.matricule ?? "—"}</span>
          </div>
        </div>

        {gradeRows.length === 0 ? (
          <p className="py-10 text-center text-sm text-zinc-400">Aucune note enregistrée pour cet élève.</p>
        ) : (
          <div className="space-y-6">
            {Array.from(byTerm.entries()).map(([term, termGrades]) => {
              const termAverage =
                termGrades.reduce((acc, g) => acc + Number(g.score), 0) / termGrades.length;
              return (
                <div key={term}>
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="font-semibold text-zinc-900">{term}</h3>
                    <span className="font-mono text-sm font-semibold text-forest">
                      Moyenne : {termAverage.toFixed(2)}/20
                    </span>
                  </div>
                  <div className="overflow-hidden rounded-lg border border-cream-dark">
                    <table className="w-full text-sm">
                      <thead className="bg-cream text-left text-zinc-500">
                        <tr>
                          <th className="px-4 py-2 font-medium">Matière</th>
                          <th className="px-4 py-2 font-medium text-right">Note /20</th>
                          <th className="px-4 py-2 font-medium">Appréciation</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-cream-dark">
                        {termGrades.map((g) => (
                          <tr key={g.id}>
                            <td className="px-4 py-2 text-zinc-900">{g.subject}</td>
                            <td className="px-4 py-2 text-right font-mono">{Number(g.score).toFixed(2)}</td>
                            <td className="px-4 py-2 text-zinc-500">{g.remark ?? "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}

            <div className="flex items-center justify-between rounded-lg bg-forest-faint px-4 py-3">
              <span className="font-semibold text-forest-dark">Moyenne générale</span>
              <span className="font-mono text-lg font-bold text-forest-dark">
                {overallAverage?.toFixed(2)}/20
              </span>
            </div>
          </div>
        )}

        <div className="mt-8 text-center text-xs text-zinc-400">
          Généré le {new Date().toLocaleDateString("fr-FR")}
        </div>
      </div>
    </main>
  );
}
