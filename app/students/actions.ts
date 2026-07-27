"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { getCurrentProfile } from "@/lib/auth/profile";
import { db } from "@/lib/db";
import { students } from "@/lib/db/schema";

function readStudentFields(formData: FormData) {
  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const birthDate = String(formData.get("birthDate") ?? "").trim();
  const matricule = String(formData.get("matricule") ?? "").trim();
  const classIdRaw = String(formData.get("classId") ?? "").trim();

  return {
    firstName,
    lastName,
    birthDate: birthDate || null,
    matricule: matricule || null,
    classId: classIdRaw || null,
  };
}

export async function createStudent(formData: FormData) {
  const profile = await getCurrentProfile();
  if (!profile.schoolId) {
    return { error: "Aucune école rattachée à ton compte." };
  }

  const fields = readStudentFields(formData);
  if (!fields.firstName || !fields.lastName) {
    return { error: "Prénom et nom sont requis." };
  }

  await db.insert(students).values({
    schoolId: profile.schoolId,
    classId: fields.classId,
    firstName: fields.firstName,
    lastName: fields.lastName,
    birthDate: fields.birthDate,
    matricule: fields.matricule,
  });

  revalidatePath("/students");
  redirect("/students");
}

export async function updateStudent(studentId: string, formData: FormData) {
  const profile = await getCurrentProfile();
  if (!profile.schoolId) {
    return { error: "Aucune école rattachée à ton compte." };
  }

  const fields = readStudentFields(formData);
  if (!fields.firstName || !fields.lastName) {
    return { error: "Prénom et nom sont requis." };
  }

  await db
    .update(students)
    .set({
      classId: fields.classId,
      firstName: fields.firstName,
      lastName: fields.lastName,
      birthDate: fields.birthDate,
      matricule: fields.matricule,
    })
    .where(and(eq(students.id, studentId), eq(students.schoolId, profile.schoolId)));

  revalidatePath("/students");
  redirect("/students");
}

export async function deleteStudent(studentId: string) {
  const profile = await getCurrentProfile();
  if (!profile.schoolId) return { error: "Aucune école rattachée à ton compte." };

  await db
    .delete(students)
    .where(and(eq(students.id, studentId), eq(students.schoolId, profile.schoolId)));

  revalidatePath("/students");
}
