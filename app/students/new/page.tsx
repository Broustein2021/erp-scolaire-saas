import { eq } from "drizzle-orm";
import { getCurrentProfile } from "@/lib/auth/profile";
import { db } from "@/lib/db";
import { classes } from "@/lib/db/schema";
import { StudentForm } from "../student-form";
import { createStudent } from "../actions";

export default async function NewStudentPage() {
  const profile = await getCurrentProfile();

  const classOptions = profile.schoolId
    ? await db.select({ id: classes.id, name: classes.name }).from(classes).where(eq(classes.schoolId, profile.schoolId))
    : [];

  return (
    <main className="mx-auto max-w-lg p-8 space-y-6">
      <h1 className="text-xl font-semibold">Ajouter un élève</h1>
      <StudentForm classOptions={classOptions} onSubmit={createStudent} submitLabel="Ajouter" />
    </main>
  );
}
