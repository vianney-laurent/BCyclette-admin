# B'Cyclette Super-Admin

Interface d'administration pour gérer toutes les entreprises, utilisateurs et configurations de B'Cyclette.

## Fonctionnalités

- 🏢 **Gestion des entreprises** : Créer, modifier, supprimer des entreprises
- 👥 **Gestion des utilisateurs** : Créer le premier admin d'une entreprise, voir tous les utilisateurs
- ⚙️ **Configuration globale** : Gérer `app_config` (valeurs par défaut)
- 🏢 **Configuration par entreprise** : Gérer `company_config` pour chaque entreprise
- 📊 **Statistiques** : Vue d'ensemble de toutes les entreprises

## Technologies

- **Next.js 14** avec App Router
- **TypeScript** pour la sécurité des types
- **Tailwind CSS** pour le design
- **Supabase** pour la base de données
- **Lucide React** pour les icônes

## Installation

```bash
npm install
```

## Configuration

Créez un fichier `.env.local` :

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Développement

```bash
npm run dev
```

Ouvrez [http://localhost:3001](http://localhost:3001) dans votre navigateur.

## Build

```bash
npm run build
npm start
```

## Architecture

```
b-cyclette-admin/
├── app/                    # Pages Next.js (App Router)
│   ├── (admin)/           # Routes protégées admin
│   ├── login/             # Page de connexion
│   └── layout.tsx         # Layout principal
├── components/            # Composants réutilisables
├── lib/                   # Utilitaires et clients
├── types/                 # Types TypeScript
└── utils/                 # Fonctions utilitaires
```

## Sécurité

- Vérification du rôle `super_admin` sur toutes les routes protégées
- Utilisation de `SUPABASE_SERVICE_ROLE_KEY` pour les opérations admin
- Row Level Security (RLS) configuré dans Supabase
