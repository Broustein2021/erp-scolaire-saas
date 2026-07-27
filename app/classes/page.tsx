import Link from "next/link";
import { eq, sql } from "drizzle-orm";
import { getCurrentProfile } from "@/lib/auth/profile";
import { db } from "@/lib/db";
import { classes, students } from "@/lib/db/schema";
import { DeleteClassButton } from "./delete-button";

export default async function ClassesPage() {
  const profile = await getCurrentProfile();

  const rows = profile.schoolId
    ? await db
        .select({
          id: classes.id,
          name: classes.name,
          level: classes.level,
          academicYear: classes.academicYear,
          studentCount: sql<number>`count(${students.id})`.mapWith(Number),
        })
        .from(classes)
        .leftJoin(students, eq(students.classId, classes.id))
        .where(eq(classes.schoolId, profile.schoolId))
        .groupBy(classes.id)
    : [];

  return (
    <main className="mx-auto max-w-3xl p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Classes</h1>
        <Link
          href="/classes/new"
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white"
        >
          + Ajouter une classe
        </Link>
      </div>

      {rows.length === 0 ? (
        <p className="text-sm text-zinc-500">Aucune classe créée pour l&apos;instant.</p>
      ) : (
        <div className="overflow-hidden rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 text-left text-zinc-500">
              <tr>
                <th className="px-4 py-2 font-medium">Nom</th>
                <th className="px-4 py-2 font-medium">Niveau</th>
                <th className="px-4 py-2 font-medium">Année scolaire</th>
                <th className="px-4 py-2 font-medium">Élèves</th>
                <th className="px-4 py-2 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {rows.map((c) => (
                <tr key={c.id}>
                  <td className="px-4 py-2">{c.name}</td>
                  <td className="px-4 py-2 text-zinc-500">{c.level}</td>
                  <td className="px-4 py-2 text-zinc-500">{c.academicYear}</td>
                  <td className="px-4 py-2 text-zinc-500">{c.studentCount}</td>
                  <td className="px-4 py-2 text-right space-x-3">
                    <Link href={`/classes/${c.id}`} className="text-zinc-700 underline">
                      Modifier
                    </Link>
                    <DeleteClassButton classId={c.id} />
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
