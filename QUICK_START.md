# Quick Start - B'Cyclette Super-Admin

## 🚀 Démarrage Rapide

### 1. Installation

```bash
cd b-cyclette-admin
npm install
```

### 2. Configuration

Créez `.env.local` :

```env
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_anon_key
SUPABASE_SERVICE_ROLE_KEY=votre_service_role_key
```

### 3. Migration SQL

Exécutez dans Supabase SQL Editor :
```sql
-- Fichier : b-cyclette-dashboard/supabase/migrations/20260116_add_super_admin.sql
```

### 4. Créer votre compte Super-Admin

**Via Supabase Dashboard** :

1. **Authentication** → **Users** → **Add user**
   - Email : `admin@bcyclette.fr`
   - Password : `votre_mot_de_passe`
   - ✅ Auto Confirm User

2. **Table Editor** → Table `users`
   - Trouvez votre utilisateur
   - Mettez `super_admin` à `TRUE`

### 5. Lancer

```bash
npm run dev
```

Ouvrez [http://localhost:3001](http://localhost:3001)

### 6. Se connecter

- Email : `admin@bcyclette.fr`
- Password : `votre_mot_de_passe`

## ✅ Fonctionnalités Disponibles

- ✅ **Entreprises** : Créer, voir, modifier toutes les entreprises
- ✅ **Configuration Entreprise** : Gérer `company_config` pour chaque entreprise
- ✅ **Créer Admin** : Créer le premier admin d'une entreprise
- ✅ **Config Globale** : Gérer `app_config` (valeurs par défaut)
- ✅ **Utilisateurs** : Voir tous les utilisateurs
- ✅ **Statistiques** : Vue d'ensemble globale

## 📝 Notes

- Le port par défaut est `3001` (pour éviter les conflits avec le dashboard B2B2C sur `3000`)
- Toutes les routes sont protégées par vérification `super_admin`
- Le design est responsive (mobile, tablette, desktop)
