import { eq, sql } from "drizzle-orm";
import { Plus, GraduationCap } from "lucide-react";
import { getCurrentProfile } from "@/lib/auth/profile";
import { db } from "@/lib/db";
import { classes, students } from "@/lib/db/schema";
import { SectionHeader } from "@/components/shared/section-header";
import { Btn } from "@/components/shared/btn";
import { DeleteClassButton } from "./delete-button";

export default async function ClassesPage() {
  const profile = await getCurrentProfile();

  const rows = profile.schoolId
    ? await db
        .select({
          id: classes.id,
          name: classes.name,
          level: classes.level,
          academicYear: classes.academicYear,
          studentCount: sql<number>`count(${students.id})`.mapWith(Number),
        })
        .from(classes)
        .leftJoin(students, eq(students.classId, classes.id))
        .where(eq(classes.schoolId, profile.schoolId))
        .groupBy(classes.id)
    : [];

  return (
    <div className="space-y-5 p-6">
      <SectionHeader
        title="Classes"
        subtitle={`${rows.length} classe${rows.length > 1 ? "s" : ""} créée${rows.length > 1 ? "s" : ""}`}
      >
        <Btn variant="primary" icon={<Plus size={14} />} href="/classes/new">
          Ajouter une classe
        </Btn>
      </SectionHeader>

      <div className="overflow-hidden rounded-2xl border border-cream-dark bg-white shadow-sm">
        <div className="border-b border-cream-dark px-5 py-4">
          <div className="font-semibold text-zinc-900">Liste des classes</div>
        </div>
        {rows.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm text-zinc-400">
            <GraduationCap className="mx-auto mb-3 h-8 w-8 opacity-30" />
            Aucune classe créée pour l&apos;instant.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-cream text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">
                <th className="px-5 py-3">Nom</th>
                <th className="px-5 py-3">Niveau</th>
                <th className="px-5 py-3">Année scolaire</th>
                <th className="px-5 py-3">Élèves</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((c, i) => (
                <tr key={c.id} className={`border-t border-cream ${i % 2 === 1 ? "bg-cream/30" : "bg-white"}`}>
                  <td className="px-5 py-3.5 font-semibold text-zinc-900">{c.name}</td>
                  <td className="px-5 py-3.5">
                    <span className="rounded-full bg-forest-faint px-2 py-0.5 text-xs text-forest">{c.level}</span>
                  </td>
                  <td className="px-5 py-3.5 text-zinc-500">{c.academicYear}</td>
                  <td className="px-5 py-3.5 font-mono text-zinc-500">{c.studentCount}</td>
                  <td className="px-5 py-3.5 text-right space-x-3">
                    <a href={`/classes/${c.id}`} className="text-zinc-700 underline">
                      Modifier
                    </a>
                    <DeleteClassButton classId={c.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
