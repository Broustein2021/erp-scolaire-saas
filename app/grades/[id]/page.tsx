import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { getCurrentProfile } from "@/lib/auth/profile";
import { db } from "@/lib/db";
import { grades, students } from "@/lib/db/schema";
import { GradeForm } from "../grade-form";
import { updateGrade } from "../actions";

export default async function EditGradePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await getCurrentProfile();
  if (!profile.schoolId) notFound();

  const [grade] = await db
    .select({
      id: grades.id,
      studentId: grades.studentId,
      subject: grades.subject,
      term: grades.term,
      score: grades.score,
      classAverage: grades.classAverage,
      rank: grades.rank,
      remark: grades.remark,
    })
    .from(grades)
    .innerJoin(students, eq(students.id, grades.studentId))
    .where(and(eq(grades.id, id), eq(students.schoolId, profile.schoolId)));

  if (!grade) notFound();

  const studentOptions = (
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
  }));

  return (
    <main className="mx-auto max-w-lg p-8 space-y-6">
      <h1 className="text-xl font-semibold">Modifier la note</h1>
      <GradeForm
        studentOptions={studentOptions}
        defaultValues={{
          studentId: grade.studentId,
          subject: grade.subject,
          term: grade.term,
          score: String(grade.score),
          classAverage: grade.classAverage ? String(grade.classAverage) : null,
          rank: grade.rank,
          remark: grade.remark,
        }}
        onSubmit={updateGrade.bind(null, id)}
        submitLabel="Enregistrer"
      />
    </main>
  );
}