<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# ERP Scolaire SaaS - Conventions RLS (obligatoire, ne jamais deroger)

Stack : Next.js (App Router) + Drizzle ORM + Supabase (auth + Postgres).

## Isolation multi-tenant
- Fonction SQL existante : current_org_id()
- Pattern staff (table avec school_id direct) :
  exists (select 1 from schools s where s.id = X.school_id and s.organization_id = current_org_id())
- Pattern staff (table liee via student_id, ex: grades/invoices) :
  exists (select 1 from students st join schools s on s.id = st.school_id where st.id = X.student_id and s.organization_id = current_org_id())
- Pattern parent (table consultable par un parent) :
  exists (select 1 from students st where st.id = X.student_id and st.parent_user_id = auth.uid())
- Toute nouvelle table metier doit avoir school_id (ou lien vers students/school_id) + policy staff + policy parent si consultable par un parent
- Toujours drop policy if exists avant chaque create policy (evite les conflits de nom)

## Pattern de page (reference : app/students/page.tsx)
Server Component + Drizzle, scoping via getCurrentProfile().schoolId

## MVP vise (31 aout 2026) - rien au-dela
Creer ecole, eleves, classes, enseignants, paiements, recus, notes, bulletins, dashboard.
Hors perimetre : comptabilite avancee, gestion universitaire, LMS, marketplace, IA avancee.

## Next.js 16
middleware.ts est deprecie et ignore silencieusement -> utiliser proxy.ts (export function proxy).
