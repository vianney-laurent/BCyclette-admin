# Guide Agent - Admin B'Cyclette

Document de référence rapide pour travailler sur `b-cyclette-admin`.

## 🎯 Contexte

Interface super-administration pour gérer toutes les entreprises, utilisateurs et configurations globales de B'Cyclette.

## 🔑 Rôles

- **Super-admin uniquement**: Accès via `users.super_admin = true`
- **Pas de multi-tenant**: Les super-admins voient toutes les entreprises

## 📁 Structure

```
b-cyclette-admin/
├── app/
│   ├── (admin)/              # Routes protégées
│   │   ├── companies/        # Gestion entreprises
│   │   ├── users/            # Gestion utilisateurs
│   │   ├── app-config/       # Configuration globale
│   │   └── stats/            # Statistiques globales
│   ├── login/                # Connexion super-admin
│   └── layout.tsx            # Layout global
├── components/               # Composants réutilisables
├── lib/                     # Clients Supabase
│   ├── supabase-server.ts   # Client serveur (avec cookies)
│   └── supabase.ts          # Client admin (service_role)
├── utils/                   # Utilitaires (auth.ts)
└── middleware.ts            # Protection super-admin
```

## 🔐 Authentification

### Vérifier le super-admin

```typescript
import { createServerClient } from '@/lib/supabase-server'
import { isSuperAdmin } from '@/utils/auth'

const isAdmin = await isSuperAdmin()
if (!isAdmin) {
  redirect('/login')
}
```

### Fonction `isSuperAdmin()` (utils/auth.ts)

```typescript
export async function isSuperAdmin(): Promise<boolean> {
  const supabase = await createServerClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) return false
  
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('super_admin, role')
    .eq('id', user.id)
    .single()
  
  if (userError) return false
  
  // PostgreSQL peut retourner boolean ou string
  const superAdminValue = userData?.super_admin
  return superAdminValue === true || superAdminValue === 'true' || superAdminValue === 't'
}
```

## 🔧 Clients Supabase

### `createServerClient()` (lib/supabase-server.ts)
Client serveur avec gestion des cookies (pour les composants serveur).

```typescript
import { createServerClient } from '@/lib/supabase-server'

const supabase = await createServerClient()
const { data } = await supabase.from('companies').select('*')
```

### `createAdminClient()` (lib/supabase.ts)
Client admin avec `SUPABASE_SERVICE_ROLE_KEY` (bypass RLS).

**⚠️ IMPORTANT**: Utiliser **UNIQUEMENT** pour:
- Vérifier `super_admin` dans le middleware
- Opérations nécessitant un bypass RLS (très rares)

**Ne JAMAIS utiliser** pour les requêtes normales (laisser RLS faire son travail).

```typescript
import { createAdminClient } from '@/lib/supabase'

const adminClient = createAdminClient()
const { data } = await adminClient
  .from('users')
  .select('super_admin')
  .eq('id', userId)
  .single()
```

## 📊 Tables Principales

### `companies`
- `id`: UUID
- `name`: Nom de l'entreprise
- `fmd_budget_per_year`: Budget FMD annuel
- `employee_count`: Nombre d'employés

### `users`
- `id`: UUID (référence `auth.users`)
- `email`: Email
- `role`: 'employee' ou 'admin'
- `super_admin`: `true` pour super-admin
- `company_id`: UUID de l'entreprise (NULL pour B2C)
- `account_type`: 'b2c' ou 'b2b2c'

### `company_config`
- `company_id`: UUID (clé primaire partielle)
- `key`: Clé de configuration
- `value`: Valeur (toujours TEXT)
- `description`: Description

**Clés courantes**:
- `auto_validate_trips`: 'true' ou 'false'
- `co2_factor_per_km`: '0.21'
- `fmd_rate_per_km`: '0.25'
- `auto_export_enabled`: 'true' ou 'false'
- `auto_export_email`: Email destinataire
- `auto_export_day`: '5'

### `app_config`
- `key`: Clé (PRIMARY KEY)
- `value`: Valeur (toujours TEXT)
- `description`: Description

**Clés courantes**:
- `co2_factor_per_km`: '0.21' (valeur par défaut)

## 🔍 Requêtes Typiques

### Récupérer toutes les entreprises

```typescript
const { data: companies, error } = await supabase
  .from('companies')
  .select('*')
  .order('name', { ascending: true })
```

**Note**: RLS permet aux super-admins de voir toutes les entreprises.

### Créer une entreprise

```typescript
const { data: company, error } = await supabase
  .from('companies')
  .insert({
    name: 'Nouvelle Entreprise',
    fmd_budget_per_year: 10000.00,
    employee_count: 0
  })
  .select()
  .single()
```

**Note**: Le trigger `init_company_config()` initialise automatiquement la config.

### Récupérer tous les utilisateurs

```typescript
const { data: users, error } = await supabase
  .from('users')
  .select(`
    *,
    companies:company_id (
      id,
      name
    )
  `)
  .order('created_at', { ascending: false })
```

**Note**: RLS permet aux super-admins de voir tous les utilisateurs.

### Créer le premier admin d'une entreprise

```typescript
// 1. Créer l'utilisateur dans Supabase Auth
const { data: authData, error: authError } = await supabase.auth.admin.createUser({
  email: 'admin@entreprise.com',
  password: 'motdepasse',
  email_confirm: true,
  user_metadata: {
    first_name: 'Prénom',
    last_name: 'Nom',
    role: 'admin'
  }
})

// 2. Créer l'enregistrement dans users
const { data: userData, error: userError } = await supabase
  .from('users')
  .insert({
    id: authData.user.id,
    email: 'admin@entreprise.com',
    first_name: 'Prénom',
    last_name: 'Nom',
    role: 'admin',
    company_id: companyId,
    account_type: 'b2b2c'
  })
  .select()
  .single()
```

### Modifier la config d'une entreprise

```typescript
const { error } = await supabase
  .from('company_config')
  .upsert({
    company_id: companyId,
    key: 'auto_validate_trips',
    value: 'true',
    description: 'Validation automatique des trajets Domicile-Travail'
  })
```

### Récupérer la config globale

```typescript
const { data: config, error } = await supabase
  .from('app_config')
  .select('*')
```

### Modifier la config globale

```typescript
const { error } = await supabase
  .from('app_config')
  .upsert({
    key: 'co2_factor_per_km',
    value: '0.21',
    description: 'Coefficient de conversion Km vers Kg de CO2 économisé'
  })
```

### Récupérer les statistiques d'une entreprise

```typescript
const { data: stats, error } = await supabase
  .from('users')
  .select(`
    total_km,
    carbon_saved,
    total_points
  `)
  .eq('company_id', companyId)

// Agréger les données
const totalKm = stats?.reduce((sum, u) => sum + (u.total_km || 0), 0) || 0
const totalCo2 = stats?.reduce((sum, u) => sum + (u.carbon_saved || 0), 0) || 0
const totalPoints = stats?.reduce((sum, u) => sum + (u.total_points || 0), 0) || 0
```

## 🛡️ Middleware

Le middleware (`middleware.ts`) protège toutes les routes admin:

1. Rafraîchit la session Supabase avec `@supabase/ssr`
2. Vérifie `super_admin` avec `createAdminClient()` (bypass RLS)
3. Redirige vers `/login` si non super-admin
4. Redirige vers `/companies` si super-admin et sur `/login`

**Important**: Le middleware utilise `createAdminClient()` pour vérifier `super_admin` sans être bloqué par RLS.

## ⚠️ Points d'Attention

1. **Service Role Key**: Nécessaire pour `createAdminClient()` dans le middleware
   - Variable d'environnement: `SUPABASE_SERVICE_ROLE_KEY`
   - **Ne JAMAIS** exposer côté client
   - **Ne JAMAIS** utiliser pour les requêtes normales

2. **RLS**: Les super-admins ont des politiques RLS spéciales
   - `Super admins can view all companies`
   - `Super admins can view all users`
   - `Super admins can view all trips`
   - `Super admins can view/insert/update/delete all company_config`

3. **Pas de multi-tenant**: Les super-admins voient toutes les entreprises
   - Pas besoin de filtrer par `company_id`
   - RLS permet l'accès à tout

4. **Création d'admin**: Utiliser `supabase.auth.admin.createUser()` pour créer un utilisateur
   - Nécessite `SUPABASE_SERVICE_ROLE_KEY`
   - Créer ensuite l'enregistrement dans `users`

5. **Config par entreprise**: Toujours initialiser avec `init_company_config()`
   - Le trigger s'exécute automatiquement à la création d'une entreprise
   - Sinon, utiliser `upsert` pour créer/modifier

## 🎨 Styling

- **Tailwind CSS** pour tous les styles
- Design responsive (mobile-first)
- Utiliser les composants existants dans `components/`

## 📚 Référence Complète

Voir `AGENT_REFERENCE.md` pour:
- Détails complets du schéma de base de données
- Toutes les migrations SQL
- Fonctions RPC disponibles
- Politiques RLS détaillées
- Architecture complète

## 🔗 Configuration

**`.env.local`**:
```env
NEXT_PUBLIC_SUPABASE_URL=votre_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anon_publique
SUPABASE_SERVICE_ROLE_KEY=votre_cle_service_role  # IMPORTANT pour createAdminClient()
```

**⚠️ Ne JAMAIS commiter `SUPABASE_SERVICE_ROLE_KEY` dans Git !**
