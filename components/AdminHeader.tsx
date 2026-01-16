'use client'

import { useRouter } from 'next/navigation'
import { createClientSupabase } from '@/lib/supabase'
import { Building2, LogOut, User } from 'lucide-react'

export default function AdminHeader() {
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClientSupabase()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-surface border-b border-border z-50">
      <div className="flex items-center justify-between h-full px-4 lg:px-6">
        <div className="flex items-center gap-2 lg:gap-3">
          <div className="w-8 h-8 lg:w-10 lg:h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <Building2 className="w-5 h-5 lg:w-6 lg:h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-base lg:text-lg font-bold text-text-primary">B'Cyclette</h1>
            <p className="text-xs text-text-tertiary hidden sm:block">Super-Admin</p>
          </div>
        </div>

        <div className="flex items-center gap-2 lg:gap-4">
          <div className="hidden md:flex items-center gap-2 text-text-secondary">
            <User className="w-4 h-4" />
            <span className="text-sm">Super-Administrateur</span>
          </div>
          
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 lg:px-4 py-2 text-text-secondary hover:text-text-primary hover:bg-gray-50 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm hidden sm:inline">Déconnexion</span>
          </button>
        </div>
      </div>
    </header>
  )
}
