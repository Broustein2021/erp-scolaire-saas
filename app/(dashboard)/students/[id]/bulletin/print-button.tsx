"use client";

import { Printer } from "lucide-react";

export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="inline-flex items-center gap-2 rounded-lg bg-forest px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-forest-dark"
    >
      <Printer size={14} /> Imprimer
    </button>
  );
}
