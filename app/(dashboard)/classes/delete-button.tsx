"use client";

import { useTransition } from "react";
import { deleteClass } from "./actions";

export function DeleteClassButton({ classId }: { classId: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      disabled={pending}
      onClick={() => {
        if (confirm("Supprimer cette classe ? Les élèves rattachés perdront leur classe.")) {
          startTransition(() => {
            deleteClass(classId);
          });
        }
      }}
      className="text-red-600 underline disabled:opacity-50"
    >
      Supprimer
    </button>
  );
}
