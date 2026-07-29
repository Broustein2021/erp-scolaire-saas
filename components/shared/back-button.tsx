"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function BackButton({ href, label = "Retour" }: { href: string; label?: string }) {
  return (
    <Link
      href={href}
      className="mb-4 inline-flex items-center gap-1.5 text-sm text-zinc-500 transition-colors hover:text-zinc-900"
    >
      <ArrowLeft className="h-4 w-4" />
      {label}
    </Link>
  );
}
