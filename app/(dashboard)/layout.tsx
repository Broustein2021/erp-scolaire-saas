import { eq } from "drizzle-orm";
import { getCurrentProfile } from "@/lib/auth/profile";
import { db } from "@/lib/db";
import { schools } from "@/lib/db/schema";
import { Sidebar } from "@/components/layout/sidebar";

export default async function DashboardGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getCurrentProfile();

  let schoolName = "Établissement";
  if (profile.schoolId) {
    const [school] = await db
      .select({ name: schools.name })
      .from(schools)
      .where(eq(schools.id, profile.schoolId));
    if (school) schoolName = school.name;
  }

  return (
    <div className="flex h-screen bg-cream">
      <Sidebar schoolName={schoolName} />
      <div className="flex-1 overflow-y-auto">{children}</div>
    </div>
  );
}
