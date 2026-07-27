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
