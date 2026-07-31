# État du projet — ERP Scolaire SaaS

Dernière mise à jour : 31/07/2026

## Fait
- Repo Next.js 16 (App Router) + Drizzle + Supabase, RLS multi-tenant via current_org_id()
- proxy.ts fonctionnel
- Onboarding école, inscription (signup) : fonctionnels
- Students : CRUD + page + RLS ok — reskiné (Btn/StatusBadge/SectionHeader)
- Classes : CRUD + page + RLS ok — reskiné
- Teachers : CRUD complet (édition + suppression) + RLS ok — reskiné
- Invoices + Payments : CRUD + versements (Wave/Orange/MTN/Moov) + statut dynamique ok — reskiné
  (fiche facture, formulaire facture, formulaire paiement, édition paiement, reçu)
- Barème des frais de scolarité (fee-schedule) : création/suppression par niveau
- Reçu imprimable : fait — reskiné (BackButton, palette forest/amber)
- Grades : CRUD complet + isolation école ok — reskiné
- Bulletin scolaire : moyenne simple par période + générale, imprimable — reskiné (BackButton)
- Dashboard : reskiné et fonctionnel — KPIs (élèves, revenus, retards, encaissements du mois),
  graphique "Revenus par classe", graphique flux mensuel, transactions récentes, alertes retard
- Stubs Comptable et Espace parent : redirigent vers /dashboard (comportement voulu tant que ces
  rôles ne sont pas différenciés) + navigation sidebar à jour (desktop + mobile)
- Système de composants UI officiel : `components/shared/btn.tsx` (props `disabled` et `fullWidth`
  ajoutées pour les boutons de soumission de formulaire), `status-badge.tsx`, `section-header.tsx`,
  `back-button.tsx` (forest/amber) — **utilisé sur tous les modules** (students, classes, teachers,
  grades, invoices/paiements/reçu, bulletin)
- Schéma RBAC (roles/permissions/user_roles) créé en base — non branché dans l'app

## Bug corrigé
- `invoices/fee-schedule.tsx` : erreur de build TypeScript sur `startTransition(() => deleteFeeRow(...))`.
- 2 erreurs ESLint bloquantes (apostrophe non échappée dans dashboard, import inutilisé dans bulletin).

## Reskin — terminé
Tous les modules listés précédemment (Élèves, Classes, Notes, sous-pages Finance) sont maintenant
alignés sur le système `Btn`/`StatusBadge`/`SectionHeader`/`BackButton`. Les pages `new`/`[id]` de
Students/Teachers/Invoices restent volontairement de simples coquilles (cohérent entre modules) —
seuls les formulaires eux-mêmes et les pages liste/détail sont reskinés.

## Gap de sécurité identifié — pas encore traité
- **Pas de "mot de passe oublié"** : aucune page `/forgot-password` ni `/reset-password`. Un
  utilisateur qui perd son mot de passe est bloqué. À construire avant d'ouvrir l'app à de vrais
  clients (nécessite une route `/auth/confirm` type `verifyOtp` + configuration du template email
  "Reset Password" dans le Dashboard Supabase pour pointer vers cette route).

## À faire ensuite
- Mot de passe oublié / réinitialisation (voir ci-dessus)
- Brancher le RBAC existant sur une vraie logique de dispatching une fois qu'un rôle parent/comptable
  est introduit côté UI
- Confirmer/mettre en place le déploiement Vercel

## Conventions
Voir AGENTS.md — RLS patterns, MVP scope, Next.js 16 proxy.ts.
UI : Btn / StatusBadge / SectionHeader / BackButton (components/shared/) comme système officiel —
éviter de recréer des variantes concurrentes ailleurs (ex. ne pas réintroduire de composants
Badge/Button alternatifs dans components/ui/, ni de map de statuts dupliquée comme celle qui
existait dans finance-tabs.tsx).
