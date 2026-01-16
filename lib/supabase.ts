import { createClient } from '@supabase/supabase-js'
import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Client pour les opérations utilisateur côté navigateur (avec gestion SSR des cookies)
export const createBrowserSupabaseClient = () => {
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}

// Client pour les opérations utilisateur (avec RLS) - DEPRECATED, utiliser createBrowserSupabaseClient
export const createClientSupabase = () => {
  return createClient(supabaseUrl, supabaseAnonKey)
}

// Client admin (bypass RLS) - À utiliser uniquement côté serveur
export const createAdminClient = () => {
  if (!supabaseServiceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is required for admin operations')
  }
  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}
