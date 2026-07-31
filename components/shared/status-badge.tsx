import { CircleCheck, CircleMinus, CircleX, Clock } from "lucide-react";

type Status = "paid" | "partial" | "overdue" | "pending";

const MAP: Record<Status, { label: string; bg: string; color: string; icon: React.ReactNode }> = {
  paid: { label: "Réglé", bg: "#DCFCE7", color: "#166534", icon: <CircleCheck size={12} /> },
  partial: { label: "Partiel", bg: "#FEF3C7", color: "#92400E", icon: <CircleMinus size={12} /> },
  overdue: { label: "En retard", bg: "#FEE2E2", color: "#991B1B", icon: <CircleX size={12} /> },
  pending: { label: "À venir", bg: "#F5F5F4", color: "#57534E", icon: <Clock size={12} /> },
};

export function StatusBadge({ status }: { status: Status }) {
  const s = MAP[status];
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium"
      style={{ background: s.bg, color: s.color }}
    >
      {s.icon} {s.label}
    </span>
  );
}
