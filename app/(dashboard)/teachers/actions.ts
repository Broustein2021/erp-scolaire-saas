"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { getCurrentProfile } from "@/lib/auth/profile";
import { db } from "@/lib/db";
import { teachers } from "@/lib/db/schema";

function readTeacherFields(formData: FormData) {
  const fullName = String(formData.get("fullName") ?? "").trim();
  const subject = String(formData.get("subject") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();

  return {
    fullName,
    subject: subject || null,
    phone: phone || null,
  };
}

export async function createTeacher(formData: FormData) {
  const profile = await getCurrentProfile();
  if (!profile.schoolId) {
    return { error: "Aucune école rattachée à ton compte." };
  }

  const fields = readTeacherFields(formData);
  if (!fields.fullName) {
    return { error: "Le nom complet est requis." };
  }

  await db.insert(teachers).values({
    schoolId: profile.schoolId,
    fullName: fields.fullName,
    subject: fields.subject,
    phone: fields.phone,
  });

  revalidatePath("/teachers");
  redirect("/teachers");
}

export async function updateTeacher(teacherId: string, formData: FormData) {
  const profile = await getCurrentProfile();
  if (!profile.schoolId) {
    return { error: "Aucune école rattachée à ton compte." };
  }

  const fields = readTeacherFields(formData);
  if (!fields.fullName) {
    return { error: "Le nom complet est requis." };
  }

  await db
    .update(teachers)
    .set({
      fullName: fields.fullName,
      subject: fields.subject,
      phone: fields.phone,
    })
    .where(and(eq(teachers.id, teacherId), eq(teachers.schoolId, profile.schoolId)));

  revalidatePath("/teachers");
  redirect("/teachers");
}

export async function deleteTeacher(teacherId: string) {
  const profile = await getCurrentProfile();
  if (!profile.schoolId) return { error: "Aucune école rattachée à ton compte." };

  await db
    .delete(teachers)
    .where(and(eq(teachers.id, teacherId), eq(teachers.schoolId, profile.schoolId)));

  revalidatePath("/teachers");
}
