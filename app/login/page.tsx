'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserSupabaseClient } from '@/lib/supabase'
import { Building2, Lock, Mail } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const supabase = createBrowserSupabaseClient()
      
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        throw signInError
      }

      if (data.user) {
        // Vérifier si l'utilisateur est super-admin
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('super_admin')
          .eq('id', data.user.id)
          .single()

        if (userError) {
          setError('Erreur lors de la vérification du compte.')
          await supabase.auth.signOut()
          return
        }

        const superAdminValue = userData?.super_admin
        const isSuperAdmin = superAdminValue === true || 
                            superAdminValue === 'true' || 
                            superAdminValue === 't'

        if (isSuperAdmin) {
          // Attendre que les cookies soient sauvegardés
          await new Promise(resolve => setTimeout(resolve, 100))
          
          // Rediriger vers /stats (Dashboard) - le middleware gérera la vérification
          router.push('/stats')
          router.refresh()
        } else {
          setError('Accès refusé. Vous devez être super-admin.')
          await supabase.auth.signOut()
        }
      }
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la connexion')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-primary/5 p-4">
      <div className="w-full max-w-md">
        <div className="card">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-4">
              <Building2 className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-text-primary mb-2">
              B'Cyclette Admin
            </h1>
            <p className="text-text-secondary">
              Connexion Super-Administrateur
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="bg-error/10 border border-error/20 text-error px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="label">
                <Mail className="inline w-4 h-4 mr-2" />
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                placeholder="admin@bcyclette.fr"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="password" className="label">
                <Lock className="inline w-4 h-4 mr-2" />
                Mot de passe
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                placeholder="••••••••"
                required
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-text-tertiary mt-6">
          Accès réservé aux super-administrateurs
        </p>
      </div>
    </div>
  )
}
