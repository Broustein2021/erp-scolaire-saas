"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { getCurrentProfile } from "@/lib/auth/profile";
import { db } from "@/lib/db";
import { feeStructures } from "@/lib/db/schema";

export async function createFeeRow(formData: FormData) {
  const profile = await getCurrentProfile();
  if (!profile.schoolId) return { error: "Aucune école rattachée à ton compte." };

  const level = String(formData.get("level") ?? "").trim();
  const installmentLabel = String(formData.get("installmentLabel") ?? "").trim();
  const amount = String(formData.get("amount") ?? "").trim();

  if (!level || !installmentLabel || !amount || Number(amount) <= 0) {
    return { error: "Niveau, libellé et montant sont requis." };
  }

  await db.insert(feeStructures).values({
    schoolId: profile.schoolId,
    level,
    installmentLabel,
    amount,
    sortOrder: 0,
  });

  revalidatePath("/invoices");
}

export async function deleteFeeRow(feeRowId: string) {
  const profile = await getCurrentProfile();
  if (!profile.schoolId) return { error: "Aucune école rattachée à ton compte." };

  await db
    .delete(feeStructures)
    .where(and(eq(feeStructures.id, feeRowId), eq(feeStructures.schoolId, profile.schoolId)));

  revalidatePath("/invoices");
}
