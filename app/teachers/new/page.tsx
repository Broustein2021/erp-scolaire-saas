import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/profile";
import { db } from "@/lib/db";
import { teachers } from "@/lib/db/schema";

async function createTeacher(formData: FormData) {
  "use server";
  const profile = await getCurrentProfile();
  if (!profile.schoolId) return;

  await db.insert(teachers).values({
    schoolId: profile.schoolId,
    fullName: formData.get("fullName") as string,
    subject: formData.get("subject") as string,
    phone: formData.get("phone") as string,
  });

  redirect("/teachers");
}

export default function NewTeacherPage() {
  return (
    <main className="mx-auto max-w-md p-8 space-y-6">
      <h1 className="text-xl font-semibold">Ajouter un enseignant</h1>
      <form action={createTeacher} className="space-y-4">
        <input name="fullName" placeholder="Nom complet" required className="w-full rounded-lg border px-3 py-2 text-sm" />
        <input name="subject" placeholder="Matière" className="w-full rounded-lg border px-3 py-2 text-sm" />
        <input name="phone" placeholder="Téléphone" className="w-full rounded-lg border px-3 py-2 text-sm" />
        <button type="submit" className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white">
          Enregistrer
        </button>
      </form>
    </main>
  );
}