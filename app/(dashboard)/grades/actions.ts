"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { getCurrentProfile } from "@/lib/auth/profile";
import { db } from "@/lib/db";
import { grades, students } from "@/lib/db/schema";

function readGradeFields(formData: FormData) {
  const studentId = String(formData.get("studentId") ?? "").trim();
  const subject = String(formData.get("subject") ?? "").trim();
  const term = String(formData.get("term") ?? "").trim();
  const scoreRaw = String(formData.get("score") ?? "").trim();
  const classAverageRaw = String(formData.get("classAverage") ?? "").trim();
  const rankRaw = String(formData.get("rank") ?? "").trim();
  const remark = String(formData.get("remark") ?? "").trim();

  return {
    studentId,
    subject,
    term,
    score: Number(scoreRaw),
    scoreRaw,
    classAverageRaw: classAverageRaw || null,
    rank: rankRaw ? Number(rankRaw) : null,
    remark: remark || null,
  };
}

async function getOwnedGrade(gradeId: string, schoolId: string) {
  const [row] = await db
    .select({ id: grades.id })
    .from(grades)
    .innerJoin(students, eq(students.id, grades.studentId))
    .where(and(eq(grades.id, gradeId), eq(students.schoolId, schoolId)));
  return row ?? null;
}

export async function createGrade(formData: FormData) {
  const profile = await getCurrentProfile();
  if (!profile.schoolId) return { error: "Aucune école rattachée à ton compte." };

  const fields = readGradeFields(formData);
  if (!fields.studentId || !fields.subject || !fields.term || !Number.isFinite(fields.score)) {
    return { error: "Élève, matière, période et note sont requis." };
  }
  if (fields.score < 0 || fields.score > 20) {
    return { error: "La note doit être entre 0 et 20." };
  }

  const [student] = await db
    .select({ id: students.id })
    .from(students)
    .where(and(eq(students.id, fields.studentId), eq(students.schoolId, profile.schoolId)));
  if (!student) return { error: "Élève introuvable." };

  await db.insert(grades).values({
    studentId: fields.studentId,
    subject: fields.subject,
    term: fields.term,
    score: fields.scoreRaw,
    classAverage: fields.classAverageRaw,
    rank: fields.rank,
    remark: fields.remark,
  });

  revalidatePath("/grades");
  redirect("/grades");
}

export async function updateGrade(gradeId: string, formData: FormData) {
  const profile = await getCurrentProfile();
  if (!profile.schoolId) return { error: "Aucune école rattachée à ton compte." };

  const existing = await getOwnedGrade(gradeId, profile.schoolId);
  if (!existing) return { error: "Note introuvable." };

  const fields = readGradeFields(formData);
  if (!fields.studentId || !fields.subject || !fields.term || !Number.isFinite(fields.score)) {
    return { error: "Élève, matière, période et note sont requis." };
  }
  if (fields.score < 0 || fields.score > 20) {
    return { error: "La note doit être entre 0 et 20." };
  }

  const [student] = await db
    .select({ id: students.id })
    .from(students)
    .where(and(eq(students.id, fields.studentId), eq(students.schoolId, profile.schoolId)));
  if (!student) return { error: "Élève introuvable." };

  await db
    .update(grades)
    .set({
      studentId: fields.studentId,
      subject: fields.subject,
      term: fields.term,
      score: fields.scoreRaw,
      classAverage: fields.classAverageRaw,
      rank: fields.rank,
      remark: fields.remark,
    })
    .where(eq(grades.id, gradeId));

  revalidatePath("/grades");
  redirect("/grades");
}

export async function deleteGrade(gradeId: string) {
  const profile = await getCurrentProfile();
  if (!profile.schoolId) return { error: "Aucune école rattachée à ton compte." };

  const existing = await getOwnedGrade(gradeId, profile.schoolId);
  if (!existing) return { error: "Note introuvable." };

  await db.delete(grades).where(eq(grades.id, gradeId));
  revalidatePath("/grades");
}