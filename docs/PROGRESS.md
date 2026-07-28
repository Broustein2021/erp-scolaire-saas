# État du projet — ERP Scolaire SaaS

Dernière mise à jour : 28/07/2026

## Fait
- Repo Next.js 16 (App Router) + Drizzle + Supabase, RLS multi-tenant via current_org_id()
- proxy.ts fonctionnel (migration depuis middleware.ts déprécié)
- Onboarding école : fonctionnel
- Students : CRUD + page + RLS ok
- Classes : CRUD + page + RLS ok
- Teachers : table + RLS + page + formulaire ok — lien manquant dans la nav (en cours)
- Grades, Invoices, Payments : RLS en place, pages pas encore créées

## À faire (ordre)
1. Ajouter lien nav "Enseignants"
2. app/grades — page + formulaire (pattern students/page.tsx)
3. app/invoices + app/payments — page + enregistrement paiement + reçu
4. Dashboard : remplacer les cartes mockées par vrais compteurs
5. Habillage visuel (couleurs forest/amber de la maquette /preview)

## Conventions
Voir AGENTS.md — RLS patterns, MVP scope, Next.js 16 proxy.ts