"use client";

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white"
    >
      Imprimer le reçu
    </button>
  );
}