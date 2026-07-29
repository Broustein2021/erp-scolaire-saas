"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { getCurrentProfile } from "@/lib/auth/profile";
import { db } from "@/lib/db";
import { classes } from "@/lib/db/schema";

function readClassFields(formData: FormData) {
  return {
    name: String(formData.get("name") ?? "").trim(),
    level: String(formData.get("level") ?? "").trim(),
    academicYear: String(formData.get("academicYear") ?? "").trim(),
  };
}

export async function createClass(formData: FormData) {
  const profile = await getCurrentProfile();
  if (!profile.schoolId) return { error: "Aucune école rattachée à ton compte." };

  const fields = readClassFields(formData);
  if (!fields.name || !fields.level || !fields.academicYear) {
    return { error: "Nom, niveau et année scolaire sont requis." };
  }

  await db.insert(classes).values({ schoolId: profile.schoolId, ...fields });

  revalidatePath("/classes");
  redirect("/classes");
}

export async function updateClass(classId: string, formData: FormData) {
  const profile = await getCurrentProfile();
  if (!profile.schoolId) return { error: "Aucune école rattachée à ton compte." };

  const fields = readClassFields(formData);
  if (!fields.name || !fields.level || !fields.academicYear) {
    return { error: "Nom, niveau et année scolaire sont requis." };
  }

  await db
    .update(classes)
    .set(fields)
    .where(and(eq(classes.id, classId), eq(classes.schoolId, profile.schoolId)));

  revalidatePath("/classes");
  redirect("/classes");
}

export async function deleteClass(classId: string) {
  const profile = await getCurrentProfile();
  if (!profile.schoolId) return { error: "Aucune école rattachée à ton compte." };

  await db
    .delete(classes)
    .where(and(eq(classes.id, classId), eq(classes.schoolId, profile.schoolId)));

  revalidatePath("/classes");
}
