// ── Moyens de paiement acceptés ──────────────────────────────────
export const PAYMENT_METHODS = [
  { value: "wave", label: "Wave" },
  { value: "orange_money", label: "Orange Money" },
  { value: "mtn_money", label: "MTN Money" },
  { value: "moov_money", label: "Moov Money" },
  { value: "carte", label: "Carte bancaire" },
  { value: "especes", label: "Espèces" },
] as const;

export type PaymentMethod = (typeof PAYMENT_METHODS)[number]["value"];

// ── Statuts de facture ────────────────────────────────────────────
export const INVOICE_STATUS_LABELS: Record<string, { label: string; className: string }> = {
  paid: { label: "Réglé", className: "bg-green-50 text-green-700" },
  partial: { label: "Partiel", className: "bg-amber-50 text-amber-700" },
  overdue: { label: "En retard", className: "bg-red-50 text-red-700" },
  pending: { label: "À venir", className: "bg-zinc-100 text-zinc-600" },
};
