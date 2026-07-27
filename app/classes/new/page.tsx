import { getCurrentProfile } from "@/lib/auth/profile";
import { ClassForm } from "../class-form";
import { createClass } from "../actions";

export default async function NewClassPage() {
  await getCurrentProfile();

  return (
    <main className="mx-auto max-w-lg p-8 space-y-6">
      <h1 className="text-xl font-semibold">Ajouter une classe</h1>
      <ClassForm onSubmit={createClass} submitLabel="Ajouter" />
    </main>
  );
}
