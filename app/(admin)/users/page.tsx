import { createServerAdminClient } from '@/lib/supabase-server'
import { User } from '@/types'
import UsersTable from '@/components/UsersTable'
import { Users } from 'lucide-react'

export default async function UsersPage() {
  const adminClient = createServerAdminClient()

  const { data: users, error } = await adminClient
    .from('users')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching users:', error)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-text-primary flex items-center gap-3">
          <Users className="w-8 h-8 text-primary" />
          Tous les Utilisateurs
        </h1>
        <p className="text-text-secondary mt-2">
          Liste de tous les utilisateurs de B&apos;Cyclette
        </p>
      </div>

      <div className="card">
        {users && users.length > 0 ? (
          <UsersTable users={users as User[]} />
        ) : (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-text-tertiary mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-text-primary mb-2">
              Aucun utilisateur
            </h3>
          </div>
        )}
      </div>
    </div>
  )
}
