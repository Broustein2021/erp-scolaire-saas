import Link from "next/link";
import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { getCurrentProfile } from "@/lib/auth/profile";
import { db } from "@/lib/db";
import { students, classes } from "@/lib/db/schema";
import { StudentForm } from "../student-form";
import { updateStudent } from "../actions";

export default async function EditStudentPage({
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
  const classOptions = await db
    .select({ id: classes.id, name: classes.name })
    .from(classes)
    .where(eq(classes.schoolId, profile.schoolId));
  return (
    <main className="mx-auto max-w-lg space-y-6 p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Modifier l&apos;élève</h1>
        <Link
          href={`/students/${id}/bulletin`}
          className="rounded-lg border border-forest px-3 py-1.5 text-sm font-medium text-forest hover:bg-forest-faint"
        >
          Voir le bulletin
        </Link>
      </div>
      <StudentForm
        classOptions={classOptions}
        defaultValues={{
          firstName: student.firstName,
          lastName: student.lastName,
          birthDate: student.birthDate,
          matricule: student.matricule,
          classId: student.classId,
        }}
        onSubmit={updateStudent.bind(null, id)}
        submitLabel="Enregistrer"
      />
    </main>
  );
}
