# État du projet — ERP Scolaire SaaS

Dernière mise à jour : 28/07/2026

## Fait
- Repo Next.js 16 (App Router) + Drizzle + Supabase, RLS multi-tenant via current_org_id()
- proxy.ts fonctionnel (migration depuis middleware.ts déprécié)
- Onboarding école : fonctionnel
- Students : CRUD + page + RLS ok
- Classes : CRUD + page + RLS ok
- Teachers : table + RLS + page + formulaire ok
- Invoices + Payments : CRUD + versements (Wave/Orange/MTN/Moov) + statut dynamique ok
- Grades : CRUD complet (liste, création, modification, suppression) + isolation école ok

## À faire (ordre)
1. Reçu imprimable sur versement (`/invoices/[id]/receipt` ou par paymentId)
2. Dashboard : remplacer les liens basiques par vrais compteurs (élèves, classes, enseignants, notes, solde factures)
3. Habillage visuel (couleurs forest/amber de la maquette /preview)
4. Bulletins (agrégation notes par élève / période) — optionnel MVP si temps

## Conventions
Voir AGENTS.md — RLS patterns, MVP scope, Next.js 16 proxy.ts