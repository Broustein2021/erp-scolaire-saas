import Link from "next/link";
import { eq, sql } from "drizzle-orm";
import { getCurrentProfile } from "@/lib/auth/profile";
import { logout } from "@/app/login/actions";
import { db } from "@/lib/db";
import { students, classes, teachers, grades, invoices, payments } from "@/lib/db/schema";

function fmt(n: number) {
  return new Intl.NumberFormat("fr-FR").format(n) + " FCFA";
}

export default async function DashboardPage() {
  const profile = await getCurrentProfile();
  const schoolId = profile.schoolId;

  let studentCount = 0;
  let classCount = 0;
  let teacherCount = 0;
  let gradeCount = 0;
  let totalOutstanding = 0;
  let invoiceCount = 0;

  if (schoolId) {
    const [studentRows, classRows, teacherRows, gradeRows, invoiceRows] = await Promise.all([
      db.select({ count: sql<number>`count(*)`.mapWith(Number) }).from(students).where(eq(students.schoolId, schoolId)),
      db.select({ count: sql<number>`count(*)`.mapWith(Number) }).from(classes).where(eq(classes.schoolId, schoolId)),
      db.select({ count: sql<number>`count(*)`.mapWith(Number) }).from(teachers).where(eq(teachers.schoolId, schoolId)),
      db
        .select({ count: sql<number>`count(*)`.mapWith(Number) })
        .from(grades)
        .innerJoin(students, eq(students.id, grades.studentId))
        .where(eq(students.schoolId, schoolId)),
      db
        .select({ id: invoices.id, amount: invoices.amount })
        .from(invoices)
        .innerJoin(students, eq(students.id, invoices.studentId))
        .where(eq(students.schoolId, schoolId)),
    ]);

    studentCount = studentRows[0]?.count ?? 0;
    classCount = classRows[0]?.count ?? 0;
    teacherCount = teacherRows[0]?.count ?? 0;
    gradeCount = gradeRows[0]?.count ?? 0;
    invoiceCount = invoiceRows.length;

    const paidByInvoice = new Map<string, number>();
    if (invoiceRows.length > 0) {
      const paymentRows = await db
        .select({ invoiceId: payments.invoiceId, amount: payments.amount })
        .from(payments);
      for (const p of paymentRows) {
        paidByInvoice.set(p.invoiceId, (paidByInvoice.get(p.invoiceId) ?? 0) + Number(p.amount));
      }
    }

    totalOutstanding = invoiceRows.reduce((acc, r) => {
      const paid = paidByInvoice.get(r.id) ?? 0;
      return acc + Math.max(Number(r.amount) - paid, 0);
    }, 0);
  }

  const metrics = [
    { label: "Élèves inscrits", value: String(studentCount), href: "/students" },
    { label: "Classes", value: String(classCount), href: "/classes" },
    { label: "Enseignants", value: String(teacherCount), href: "/teachers" },
    { label: "Notes enregistrées", value: String(gradeCount), href: "/grades" },
    {
      label: "Factures en attente",
      value: fmt(totalOutstanding),
      sub: `sur ${invoiceCount} facture${invoiceCount > 1 ? "s" : ""}`,
      href: "/invoices",
    },
  ];

  return (
    <main className="mx-auto max-w-4xl p-8 space-y-6">
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
          <span className="text-zinc-500">Organisation :</span> {profile.organizationId}
        </p>
        <p>
          <span className="text-zinc-500">École :</span> {schoolId ?? "—"}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {metrics.map((m) => (
          <Link
            key={m.label}
            href={m.href}
            className="rounded-lg border p-4 transition-colors hover:bg-zinc-50"
          >
            <div className="text-xs text-zinc-500">{m.label}</div>
            <div className="mt-1 font-mono text-xl font-semibold">{m.value}</div>
            {m.sub && <div className="mt-0.5 text-xs text-zinc-400">{m.sub}</div>}
          </Link>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/students/new"
          className="inline-block rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white"
        >
          + Nouvel élève
        </Link>
        <Link
          href="/invoices/new"
          className="inline-block rounded-lg border px-4 py-2 text-sm font-medium"
        >
          + Nouvelle facture
        </Link>
        <Link
          href="/grades/new"
          className="inline-block rounded-lg border px-4 py-2 text-sm font-medium"
        >
          + Nouvelle note
        </Link>
        <Link
          href="/teachers/new"
          className="inline-block rounded-lg border px-4 py-2 text-sm font-medium"
        >
          + Nouvel enseignant
        </Link>
      </div>
    </main>
  );
}
