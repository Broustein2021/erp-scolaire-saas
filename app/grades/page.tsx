import Link from "next/link";
import { eq } from "drizzle-orm";
import { getCurrentProfile } from "@/lib/auth/profile";
import { db } from "@/lib/db";
import { grades, students } from "@/lib/db/schema";
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
          studentFirstName: students.firstName,
          studentLastName: students.lastName,
        })
        .from(grades)
        .innerJoin(students, eq(students.id, grades.studentId))
        .where(eq(students.schoolId, profile.schoolId))
    : [];

  return (
    <main className="mx-auto max-w-4xl p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Notes</h1>
        <Link
          href="/grades/new"
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white"
        >
          + Ajouter une note
        </Link>
      </div>

      {rows.length === 0 ? (
        <p className="text-sm text-zinc-500">Aucune note enregistrée pour l&apos;instant.</p>
      ) : (
        <div className="overflow-hidden rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 text-left text-zinc-500">
              <tr>
                <th className="px-4 py-2 font-medium">Élève</th>
                <th className="px-4 py-2 font-medium">Matière</th>
                <th className="px-4 py-2 font-medium">Période</th>
                <th className="px-4 py-2 font-medium">Note</th>
                <th className="px-4 py-2 font-medium">Rang</th>
                <th className="px-4 py-2 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {rows.map((g) => (
                <tr key={g.id}>
                  <td className="px-4 py-2">
                    {g.studentLastName.toUpperCase()} {g.studentFirstName}
                  </td>
                  <td className="px-4 py-2">{g.subject}</td>
                  <td className="px-4 py-2 text-zinc-500">{g.term}</td>
                  <td className="px-4 py-2 font-mono font-semibold">{g.score}</td>
                  <td className="px-4 py-2 text-zinc-500">{g.rank ?? "—"}</td>
                  <td className="px-4 py-2 text-right space-x-3">
                    <Link href={`/grades/${g.id}`} className="text-zinc-700 underline">
                      Modifier
                    </Link>
                    <DeleteGradeButton gradeId={g.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}