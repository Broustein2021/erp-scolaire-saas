import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { getCurrentProfile } from "@/lib/auth/profile";
import { db } from "@/lib/db";
import { classes } from "@/lib/db/schema";
import { ClassForm } from "../class-form";
import { updateClass } from "../actions";

export default async function EditClassPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await getCurrentProfile();

  if (!profile.schoolId) notFound();

  const [classItem] = await db
    .select()
    .from(classes)
    .where(and(eq(classes.id, id), eq(classes.schoolId, profile.schoolId)));

  if (!classItem) notFound();

  return (
    <main className="mx-auto max-w-lg p-8 space-y-6">
      <h1 className="text-xl font-semibold">Modifier la classe</h1>
      <ClassForm
        defaultValues={{
          name: classItem.name,
          level: classItem.level,
          academicYear: classItem.academicYear,
        }}
        onSubmit={updateClass.bind(null, id)}
        submitLabel="Enregistrer"
      />
    </main>
  );
}
