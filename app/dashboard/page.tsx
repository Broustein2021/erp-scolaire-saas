import Link from "next/link";
import { getCurrentProfile } from "@/lib/auth/profile";
import { logout } from "@/app/login/actions";

export default async function DashboardPage() {
  const profile = await getCurrentProfile();

  return (
    <main className="mx-auto max-w-2xl p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Tableau de bord</h1>
        <form action={logout}>
          <button className="text-sm text-zinc-500 underline">Se déconnecter</button>
        </form>
      </div>

      <div className="rounded-lg border p-4 text-sm space-y-1">
        <p>
          <span className="text-zinc-500">Nom :</span> {profile.fullName}
        </p>
        <p>
          <span className="text-zinc-500">Organisation :</span>{" "}
          {profile.organizationId}
        </p>
        <p>
          <span className="text-zinc-500">École :</span> {profile.schoolId ?? "—"}
        </p>
      </div>

      <div className="flex gap-3">
        <Link
          href="/students"
          className="inline-block rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white"
        >
          Gérer les élèves →
        </Link>
        <Link
          href="/classes"
          className="inline-block rounded-lg border px-4 py-2 text-sm font-medium"
        >
          Gérer les classes →
        </Link>
      </div>
    </main>
  );
}
