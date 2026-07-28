# Démarrage du projet — ERP Scolaire SaaS

## Prérequis
- Node.js + npm
- Compte Supabase (projet dédié, distinct de l'ancien projet "gestiondesetablissements")
- Compte Vercel pour le déploiement

## Installation

git clone https://github.com/Broustein2021/erp-scolaire-saas.git
cd erp-scolaire-saas
npm install


## Variables d'environnement (fichier .env, jamais commité)

NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...

Valeurs disponibles dans Supabase Dashboard → Settings → API, du projet Supabase de ce repo précis (pas l'ancien).

## Lancer en local

npm run dev

→ http://localhost:3000 (redirige vers /login si non connecté, /dashboard sinon)

## Base de données
- ORM : Drizzle (schéma dans `lib/db/schema.ts`)
- Après toute modification du schéma : `npx drizzle-kit generate` puis `npx drizzle-kit migrate`
- RLS : voir les patterns obligatoires dans `AGENTS.md`, section "Conventions RLS"

## Déploiement
Push sur `main` → déploiement automatique Vercel (gestiondesetablissements.vercel.app est l'ANCIEN projet abandonné — vérifier qu'on déploie bien le bon domaine Vercel)

## Documents de référence métier
5 PDF de vision/architecture/cahier des charges — demander à Ephrem s'ils ne sont pas déjà dans `docs/`