import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { OnboardingForm } from "./onboarding-form";

export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [existing] = await db.select().from(users).where(eq(users.id, user.id));
  if (existing) redirect("/dashboard");

  return (
    <main className="flex min-h-screen items-center justify-center bg-cream p-4">
      <OnboardingForm email={user.email ?? ""} />
    </main>
  );
}
