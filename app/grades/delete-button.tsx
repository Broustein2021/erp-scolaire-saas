"use client";

import { useTransition } from "react";
import { deleteGrade } from "./actions";

export function DeleteGradeButton({ gradeId }: { gradeId: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      disabled={pending}
      onClick={() => {
        if (confirm("Supprimer cette note ?")) {
          startTransition(() => {
            deleteGrade(gradeId);
          });
        }
      }}
      className="text-red-600 underline disabled:opacity-50"
    >
      Supprimer
    </button>
  );
}