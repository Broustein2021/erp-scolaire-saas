import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { getCurrentProfile } from "@/lib/auth/profile";
import { db } from "@/lib/db";
import { teachers } from "@/lib/db/schema";
import { TeacherForm } from "../teacher-form";
import { updateTeacher } from "../actions";

export default async function EditTeacherPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await getCurrentProfile();
  if (!profile.schoolId) notFound();

  const [teacher] = await db
    .select()
    .from(teachers)
    .where(and(eq(teachers.id, id), eq(teachers.schoolId, profile.schoolId)));
  if (!teacher) notFound();

  return (
    <main className="mx-auto max-w-md p-8 space-y-6">
      <h1 className="text-xl font-semibold">Modifier l&apos;enseignant</h1>
      <TeacherForm
        defaultValues={{
          fullName: teacher.fullName,
          subject: teacher.subject,
          phone: teacher.phone,
        }}
        onSubmit={updateTeacher.bind(null, id)}
        submitLabel="Enregistrer"
      />
    </main>
  );
}
