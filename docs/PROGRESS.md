# État du projet — ERP Scolaire SaaS

Dernière mise à jour : 31/07/2026

## Fait
- Repo Next.js 16 (App Router) + Drizzle + Supabase, RLS multi-tenant via current_org_id()
- proxy.ts fonctionnel
- Onboarding école, inscription (signup) : fonctionnels
- Students : CRUD + page + RLS ok
- Classes : CRUD + page + RLS ok
- Teachers : CRUD complet (édition + suppression) + RLS ok
- Invoices + Payments : CRUD + versements (Wave/Orange/MTN/Moov) + statut dynamique ok
- Barème des frais de scolarité (fee-schedule) : création/suppression par niveau
- Reçu imprimable : fait
- Grades : CRUD complet + isolation école ok
- Bulletin scolaire : moyenne simple par période + générale, imprimable
- Dashboard : reskiné et fonctionnel — KPIs (élèves, revenus, retards, encaissements du mois),
  graphique "Revenus par classe", graphique flux mensuel, transactions récentes, alertes retard
- Stubs Comptable et Espace parent : redirigent vers /dashboard (comportement voulu tant que ces
  rôles ne sont pas différenciés) + navigation sidebar à jour (desktop + mobile)
- Système de composants UI officiel : `components/shared/btn.tsx`, `status-badge.tsx`,
  `section-header.tsx` (forest/amber) — utilisé sur invoices et teachers pour l'instant
- Schéma RBAC (roles/permissions/user_roles) créé en base — non branché dans l'app

## Bug corrigé
- `invoices/fee-schedule.tsx` : erreur de build TypeScript sur `startTransition(() => deleteFeeRow(...))`
  qui retournait implicitement une Promise. Corrigé.

## Reste à reskiner avec Btn/StatusBadge/SectionHeader (encore en Tailwind générique zinc)
- Élèves (page liste + student-form)
- Classes (page liste + class-form)
- Notes (page liste + grade-form + page bulletin)
- Sous-pages Finance : fiche facture, formulaire facture, formulaire paiement, édition paiement, reçu

## À faire ensuite
- Brancher le RBAC existant sur une vraie logique de dispatching une fois qu'un rôle parent/comptable
  est introduit côté UI
- Confirmer/mettre en place le déploiement Vercel

## Conventions
Voir AGENTS.md — RLS patterns, MVP scope, Next.js 16 proxy.ts.
UI : Btn / StatusBadge / SectionHeader (components/shared/) comme système officiel — éviter de
recréer des variantes concurrentes ailleurs (ex. ne pas réintroduire de composants Badge/Button
alternatifs dans components/ui/).
