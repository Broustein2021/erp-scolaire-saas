"use client";

import { useTransition } from "react";
import { deleteStudent } from "./actions";

export function DeleteStudentButton({ studentId }: { studentId: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      disabled={pending}
      onClick={() => {
        if (confirm("Supprimer cet élève ?")) {
          startTransition(() => {
            deleteStudent(studentId);
          });
        }
      }}
      className="text-red-600 underline disabled:opacity-50"
    >
      Supprimer
    </button>
  );
}
