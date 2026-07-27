"use server";

import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { organizations, schools, roles, users, userRoles } from "@/lib/db/schema";

const DEFAULT_ROLES = [
  { name: "admin", label: "Administrateur" },
  { name: "comptable", label: "Comptable" },
  { name: "censeur", label: "Censeur / Discipline" },
  { name: "enseignant", label: "Enseignant" },
  { name: "parent", label: "Parent" },
];

export async function createOrganizationOnboarding(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Empêche de relancer l'onboarding si un profil existe déjà
  const [existing] = await db.select().from(users).where(eq(users.id, user.id));
  if (existing) redirect("/dashboard");

  const orgName = String(formData.get("orgName") ?? "").trim();
  const plan = String(formData.get("plan") ?? "free");
  const schoolName = String(formData.get("schoolName") ?? "").trim();
  const schoolType = String(formData.get("schoolType") ?? "primaire");
  const city = String(formData.get("city") ?? "").trim();
  const fullName = String(formData.get("fullName") ?? "").trim();

  if (!orgName || !schoolName || !fullName) {
    return { error: "Nom de l'organisation, de l'établissement et ton nom complet sont requis." };
  }

  await db.transaction(async (tx) => {
    const [org] = await tx
      .insert(organizations)
      .values({ name: orgName, plan })
      .returning();

    const [school] = await tx
      .insert(schools)
      .values({ organizationId: org.id, name: schoolName, type: schoolType, city: city || null })
      .returning();

    const createdRoles = await tx
      .insert(roles)
      .values(DEFAULT_ROLES.map((r) => ({ organizationId: org.id, name: r.name, label: r.label })))
      .returning();

    const adminRole = createdRoles.find((r) => r.name === "admin")!;

    await tx.insert(users).values({
      id: user.id,
      organizationId: org.id,
      schoolId: school.id,
      fullName,
      email: user.email,
      isActive: true,
    });

    await tx.insert(userRoles).values({ userId: user.id, roleId: adminRole.id });
  });

  redirect("/dashboard");
}
