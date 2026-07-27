"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteInvoice } from "./actions";

export function DeleteInvoiceButton({
  invoiceId,
  redirectTo,
}: {
  invoiceId: string;
  redirectTo?: string;
}) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <button
      disabled={pending}
      onClick={() => {
        if (confirm("Supprimer cette facture et tous ses versements ?")) {
          startTransition(async () => {
            await deleteInvoice(invoiceId);
            if (redirectTo) router.push(redirectTo);
          });
        }
      }}
      className="text-red-600 underline disabled:opacity-50"
    >
      Supprimer
    </button>
  );
}
