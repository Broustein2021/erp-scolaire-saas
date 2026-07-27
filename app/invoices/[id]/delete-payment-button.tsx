"use client";

import { useTransition } from "react";
import { deletePayment } from "../actions";

export function DeletePaymentButton({
  invoiceId,
  paymentId,
}: {
  invoiceId: string;
  paymentId: string;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      disabled={pending}
      onClick={() => {
        if (confirm("Supprimer ce versement ?")) {
          startTransition(() => {
            deletePayment(invoiceId, paymentId);
          });
        }
      }}
      className="text-xs text-red-600 underline disabled:opacity-50"
    >
      Supprimer
    </button>
  );
}
