import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase-server'

export default async function HomePage() {
  // Le middleware gère déjà toutes les redirections
  // On fait juste une vérification basique ici
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (user) {
    // Si connecté, rediriger vers /stats (Dashboard)
    redirect('/stats')
  } else {
    redirect('/login')
  }
}
