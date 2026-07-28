import { eq } from "drizzle-orm";
import { getCurrentProfile } from "@/lib/auth/profile";
import { db } from "@/lib/db";
import { students } from "@/lib/db/schema";
import { GradeForm } from "../grade-form";
import { createGrade } from "../actions";

export default async function NewGradePage() {
  const profile = await getCurrentProfile();

  const studentOptions = profile.schoolId
    ? (
        await db
          .select({
            id: students.id,
            firstName: students.firstName,
            lastName: students.lastName,
          })
          .from(students)
          .where(eq(students.schoolId, profile.schoolId))
      ).map((s) => ({
        id: s.id,
        label: `${s.lastName.toUpperCase()} ${s.firstName}`,
      }))
    : [];

  return (
    <main className="mx-auto max-w-lg p-8 space-y-6">
      <h1 className="text-xl font-semibold">Ajouter une note</h1>
      {studentOptions.length === 0 ? (
        <p className="text-sm text-zinc-500">
          Aucun élève enregistré. Crée d&apos;abord des élèves.
        </p>
      ) : (
        <GradeForm
          studentOptions={studentOptions}
          onSubmit={createGrade}
          submitLabel="Ajouter"
        />
      )}
    </main>
  );
}