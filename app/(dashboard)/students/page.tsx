import Link from "next/link";
import { eq } from "drizzle-orm";
import { getCurrentProfile } from "@/lib/auth/profile";
import { db } from "@/lib/db";
import { students, classes } from "@/lib/db/schema";
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
    <main className="mx-auto max-w-3xl p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Élèves</h1>
        <Link
          href="/students/new"
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white"
        >
          + Ajouter un élève
        </Link>
      </div>

      {rows.length === 0 ? (
        <p className="text-sm text-zinc-500">Aucun élève enregistré pour l&apos;instant.</p>
      ) : (
        <div className="overflow-hidden rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 text-left text-zinc-500">
              <tr>
                <th className="px-4 py-2 font-medium">Nom</th>
                <th className="px-4 py-2 font-medium">Matricule</th>
                <th className="px-4 py-2 font-medium">Classe</th>
                <th className="px-4 py-2 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {rows.map((s) => (
                <tr key={s.id}>
                  <td className="px-4 py-2">
                    {s.lastName.toUpperCase()} {s.firstName}
                  </td>
                  <td className="px-4 py-2 text-zinc-500">{s.matricule ?? "—"}</td>
                  <td className="px-4 py-2 text-zinc-500">{s.className ?? "—"}</td>
                  <td className="px-4 py-2 text-right space-x-3">
                    <Link href={`/students/${s.id}`} className="text-zinc-700 underline">
                      Modifier
                    </Link>
                    <DeleteStudentButton studentId={s.id} />
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
