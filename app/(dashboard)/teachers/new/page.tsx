import { TeacherForm } from "../teacher-form";
import { createTeacher } from "../actions";

export default function NewTeacherPage() {
  return (
    <main className="mx-auto max-w-md p-8 space-y-6">
      <h1 className="text-xl font-semibold">Ajouter un enseignant</h1>
      <TeacherForm onSubmit={createTeacher} submitLabel="Enregistrer" />
    </main>
  );
}
