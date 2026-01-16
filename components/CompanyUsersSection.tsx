'use client'

import { Plus, User, Mail, Shield, ShieldAlert } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

interface CompanyUsersSectionProps {
  companyId: string
  users: any[]
  onCreateAdmin: () => void
}

export default function CompanyUsersSection({
  companyId,
  users,
  onCreateAdmin,
}: CompanyUsersSectionProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-text-primary">
            Utilisateurs ({users.length})
          </h3>
          <p className="text-sm text-text-secondary">
            Liste des utilisateurs de cette entreprise
          </p>
        </div>
        <button onClick={onCreateAdmin} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Créer un admin
        </button>
      </div>

      {users.length > 0 ? (
        <div className="space-y-2">
          {users.map((user) => (
            <div
              key={user.id}
              className="border border-border rounded-lg p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold text-text-primary">
                      {user.first_name} {user.last_name}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-text-secondary">
                      <Mail className="w-3 h-3" />
                      {user.email}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    {user.role === 'admin' ? (
                      <>
                        <Shield className="w-4 h-4 text-primary" />
                        <span className="text-sm font-semibold text-primary">Admin</span>
                      </>
                    ) : (
                      <>
                        <ShieldAlert className="w-4 h-4 text-text-tertiary" />
                        <span className="text-sm text-text-secondary">Employé</span>
                      </>
                    )}
                  </div>
                  <div className="text-sm text-text-tertiary">
                    {format(new Date(user.created_at), 'dd MMM yyyy', { locale: fr })}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border border-border rounded-lg">
          <User className="w-16 h-16 text-text-tertiary mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-text-primary mb-2">
            Aucun utilisateur
          </h3>
          <p className="text-text-secondary mb-6">
            Créez le premier administrateur de cette entreprise
          </p>
          <button onClick={onCreateAdmin} className="btn-primary">
            Créer un admin
          </button>
        </div>
      )}
    </div>
  )
}
