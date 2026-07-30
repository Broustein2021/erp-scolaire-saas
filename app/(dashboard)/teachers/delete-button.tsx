"use client";

import { useTransition } from "react";
import { deleteTeacher } from "./actions";

export function DeleteTeacherButton({ teacherId }: { teacherId: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      disabled={pending}
      onClick={() => {
        if (confirm("Supprimer cet enseignant ?")) {
          startTransition(() => {
            deleteTeacher(teacherId);
          });
        }
      }}
      className="text-red-600 underline disabled:opacity-50"
    >
      Supprimer
    </button>
  );
}
