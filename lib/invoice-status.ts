export type InvoiceStatus = "pending" | "partial" | "paid" | "overdue";

/**
 * Calcule le statut réel d'une facture à partir du montant dû, du total déjà
 * versé et de la date limite — plutôt que de se fier uniquement à la colonne
 * `status` stockée, qui peut devenir obsolète si personne n'a rouvert la
 * facture depuis que la date limite est passée.
 */
export function computeInvoiceStatus(
  amount: number,
  totalPaid: number,
  dueDate: string,
): InvoiceStatus {
  if (totalPaid >= amount) return "paid";

  const todayIso = new Date().toISOString().slice(0, 10);
  const isPastDue = dueDate < todayIso;

  if (totalPaid > 0) return isPastDue ? "overdue" : "partial";
  return isPastDue ? "overdue" : "pending";
}

/**
 * Libellé + variante de badge associés à chaque statut de facture.
 * Centralise le mapping pour rester cohérent partout (liste factures,
 * fiche facture, dashboard - alertes retard).
 */
export const invoiceStatusLabels: Record<
  InvoiceStatus,
  { label: string; variant: "success" | "warning" | "destructive" | "default" }
> = {
  paid: { label: "Payée", variant: "success" },
  partial: { label: "Partielle", variant: "warning" },
  overdue: { label: "En retard", variant: "destructive" },
  pending: { label: "En attente", variant: "default" },
};
