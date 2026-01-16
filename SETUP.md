# Setup B'Cyclette Super-Admin

## 1. Installation

```bash
cd b-cyclette-admin
npm install
```

## 2. Configuration

Créez un fichier `.env.local` à partir de `.env.example` :

```bash
cp .env.example .env.local
```

Remplissez les variables d'environnement :
- `NEXT_PUBLIC_SUPABASE_URL` : URL de votre projet Supabase
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` : Clé anonyme Supabase
- `SUPABASE_SERVICE_ROLE_KEY` : Clé service role (nécessaire pour les opérations admin)

## 3. Migration SQL

Appliquez la migration SQL pour ajouter le rôle `super_admin` :

```bash
# Dans Supabase Dashboard → SQL Editor
# Exécutez le fichier : b-cyclette-dashboard/supabase/migrations/20260116_add_super_admin.sql
```

## 4. Créer votre compte Super-Admin

### Option 1 : Via SQL (Recommandé)

```sql
-- 1. Créer l'utilisateur dans auth.users (via Supabase Dashboard → Authentication → Users)
-- Notez l'ID de l'utilisateur créé

-- 2. Mettre à jour la table users pour ajouter super_admin = TRUE
UPDATE users 
SET super_admin = TRUE 
WHERE id = 'VOTRE_USER_ID';
```

### Option 2 : Via Supabase Dashboard

1. Allez dans **Authentication** → **Users** → **Add user**
2. Créez un utilisateur avec email et mot de passe
3. Allez dans **Table Editor** → Table `users`
4. Trouvez votre utilisateur et mettez `super_admin` à `TRUE`

## 5. Lancer l'application

```bash
npm run dev
```

L'application sera accessible sur [http://localhost:3001](http://localhost:3001)

## 6. Connexion

1. Allez sur `/login`
2. Connectez-vous avec votre compte super-admin
3. Vous serez redirigé vers `/companies`

## Fonctionnalités

- ✅ **Gestion des entreprises** : Créer, voir, modifier les entreprises
- ✅ **Configuration par entreprise** : Gérer `company_config` pour chaque entreprise
- ✅ **Création d'admin** : Créer le premier admin d'une entreprise
- ✅ **Configuration globale** : Gérer `app_config` (valeurs par défaut)
- ✅ **Vue utilisateurs** : Voir tous les utilisateurs de toutes les entreprises
- ✅ **Statistiques** : Vue d'ensemble globale

## Architecture

- **Next.js 14** avec App Router
- **TypeScript** pour la sécurité des types
- **Tailwind CSS** pour le design responsive
- **Supabase** pour la base de données
- **Clean Code** : Séparation des responsabilités, composants réutilisables

## Sécurité

- Vérification du rôle `super_admin` sur toutes les routes protégées
- Utilisation de `SUPABASE_SERVICE_ROLE_KEY` pour bypass RLS
- Row Level Security (RLS) configuré dans Supabase pour les super-admins
