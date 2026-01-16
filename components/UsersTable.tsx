'use client'

import { User } from '@/types'
import Link from 'next/link'
import { useState, useMemo } from 'react'
import { 
  User as UserIcon, 
  Mail, 
  Building2, 
  Shield, 
  ShieldAlert,
  Search,
  Filter,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Edit,
  Trash2,
  MoreVertical
} from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import EditUserModal from './EditUserModal'
import DeleteUserModal from './DeleteUserModal'
import { useRouter } from 'next/navigation'

interface UsersTableProps {
  users: User[]
}

type SortField = 'name' | 'email' | 'role' | 'account_type' | 'created_at'
type SortDirection = 'asc' | 'desc'

export default function UsersTable({ users }: UsersTableProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<'all' | 'super_admin' | 'admin' | 'employee'>('all')
  const [accountTypeFilter, setAccountTypeFilter] = useState<'all' | 'b2c' | 'b2b2c'>('all')
  const [sortField, setSortField] = useState<SortField>('created_at')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [deletingUser, setDeletingUser] = useState<User | null>(null)
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null)
  const itemsPerPage = 20

  const handleSuccess = () => {
    router.refresh()
    setActionMenuOpen(null)
  }

  // Filtrage et tri
  const filteredAndSortedUsers = useMemo(() => {
    let filtered = [...users]

    // Recherche
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (user) =>
          user.email.toLowerCase().includes(query) ||
          `${user.first_name || ''} ${user.last_name || ''}`.toLowerCase().includes(query)
      )
    }

    // Filtre par rôle
    if (roleFilter !== 'all') {
      filtered = filtered.filter((user) => {
        if (roleFilter === 'super_admin') return user.super_admin === true
        if (roleFilter === 'admin') return user.role === 'admin' && !user.super_admin
        if (roleFilter === 'employee') return user.role === 'employee'
        return true
      })
    }

    // Filtre par type de compte
    if (accountTypeFilter !== 'all') {
      filtered = filtered.filter((user) => user.account_type === accountTypeFilter)
    }

    // Tri
    filtered.sort((a, b) => {
      let aValue: any
      let bValue: any

      switch (sortField) {
        case 'name':
          aValue = `${a.first_name || ''} ${a.last_name || ''}`.toLowerCase()
          bValue = `${b.first_name || ''} ${b.last_name || ''}`.toLowerCase()
          break
        case 'email':
          aValue = a.email.toLowerCase()
          bValue = b.email.toLowerCase()
          break
        case 'role':
          // Super-admin > Admin > Employee
          if (a.super_admin) aValue = 0
          else if (a.role === 'admin') aValue = 1
          else aValue = 2
          if (b.super_admin) bValue = 0
          else if (b.role === 'admin') bValue = 1
          else bValue = 2
          break
        case 'account_type':
          aValue = a.account_type
          bValue = b.account_type
          break
        case 'created_at':
          aValue = new Date(a.created_at).getTime()
          bValue = new Date(b.created_at).getTime()
          break
        default:
          return 0
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
      return 0
    })

    return filtered
  }, [users, searchQuery, roleFilter, accountTypeFilter, sortField, sortDirection])

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedUsers.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedUsers = filteredAndSortedUsers.slice(startIndex, endIndex)

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
    setCurrentPage(1) // Reset à la première page lors du tri
  }

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null
    return sortDirection === 'asc' ? (
      <ChevronUp className="w-4 h-4 inline ml-1" />
    ) : (
      <ChevronDown className="w-4 h-4 inline ml-1" />
    )
  }

  return (
    <div className="space-y-4">
      {/* Barre de recherche et filtres */}
      <div className="flex flex-col md:flex-row gap-4 pb-4 border-b border-border">
        {/* Recherche */}
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-tertiary" />
            <input
              type="text"
              placeholder="Rechercher par nom ou email..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
              className="input pl-10 w-full"
            />
          </div>
        </div>

        {/* Filtres */}
        <div className="flex flex-col sm:flex-row gap-2">
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value as any)
              setCurrentPage(1)
            }}
            className="input w-full sm:w-auto"
          >
            <option value="all">Tous les rôles</option>
            <option value="super_admin">Super-Admin</option>
            <option value="admin">Admin</option>
            <option value="employee">Employé</option>
          </select>

          <select
            value={accountTypeFilter}
            onChange={(e) => {
              setAccountTypeFilter(e.target.value as any)
              setCurrentPage(1)
            }}
            className="input w-full sm:w-auto"
          >
            <option value="all">Tous les types</option>
            <option value="b2c">B2C</option>
            <option value="b2b2c">B2B2C</option>
          </select>
        </div>
      </div>

      {/* Statistiques */}
      <div className="text-sm text-text-secondary">
        {filteredAndSortedUsers.length} utilisateur{filteredAndSortedUsers.length > 1 ? 's' : ''} trouvé{filteredAndSortedUsers.length > 1 ? 's' : ''}
        {searchQuery || roleFilter !== 'all' || accountTypeFilter !== 'all' ? (
          <span className="ml-2">
            (sur {users.length} au total)
          </span>
        ) : null}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th 
                className="text-left py-3 px-4 text-sm font-semibold text-text-secondary cursor-pointer hover:text-text-primary transition-colors"
                onClick={() => handleSort('name')}
              >
                Utilisateur <SortIcon field="name" />
              </th>
              <th 
                className="text-left py-3 px-4 text-sm font-semibold text-text-secondary cursor-pointer hover:text-text-primary transition-colors"
                onClick={() => handleSort('role')}
              >
                Rôle <SortIcon field="role" />
              </th>
              <th 
                className="text-left py-3 px-4 text-sm font-semibold text-text-secondary cursor-pointer hover:text-text-primary transition-colors"
                onClick={() => handleSort('account_type')}
              >
                Type <SortIcon field="account_type" />
              </th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-text-secondary">
                Entreprise
              </th>
              <th 
                className="text-left py-3 px-4 text-sm font-semibold text-text-secondary cursor-pointer hover:text-text-primary transition-colors"
                onClick={() => handleSort('created_at')}
              >
                Créé le <SortIcon field="created_at" />
              </th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-text-secondary">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedUsers.length > 0 ? (
              paginatedUsers.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-border hover:bg-gray-50 transition-colors"
                >
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <UserIcon className="w-5 h-5 text-primary" />
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
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      {user.super_admin ? (
                        <>
                          <Shield className="w-4 h-4 text-warning" />
                          <span className="text-sm font-semibold text-warning">Super-Admin</span>
                        </>
                      ) : user.role === 'admin' ? (
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
                  </td>
                  <td className="py-4 px-4">
                    <span className={`text-sm font-semibold ${
                      user.account_type === 'b2b2c' ? 'text-primary' : 'text-text-secondary'
                    }`}>
                      {user.account_type.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    {user.company_id ? (
                      <Link
                        href={`/companies/${user.company_id}`}
                        className="flex items-center gap-2 text-primary hover:underline"
                      >
                        <Building2 className="w-4 h-4" />
                        <span className="text-sm">Voir entreprise</span>
                      </Link>
                    ) : (
                      <span className="text-sm text-text-tertiary">Aucune</span>
                    )}
                  </td>
                  <td className="py-4 px-4 text-text-secondary text-sm">
                    {format(new Date(user.created_at), 'dd MMM yyyy', { locale: fr })}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex justify-end gap-2">
                      {/* Menu mobile responsive */}
                      <div className="relative lg:hidden">
                        <button
                          onClick={() => setActionMenuOpen(actionMenuOpen === user.id ? null : user.id)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <MoreVertical className="w-5 h-5 text-text-secondary" />
                        </button>
                        {actionMenuOpen === user.id && (
                          <>
                            <div 
                              className="fixed inset-0 z-10" 
                              onClick={() => setActionMenuOpen(null)}
                            />
                            <div className="absolute right-0 top-full mt-2 bg-surface border border-border rounded-lg shadow-lg z-20 min-w-[150px]">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setEditingUser(user)
                                  setActionMenuOpen(null)
                                }}
                                className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 text-sm text-text-primary transition-colors"
                              >
                                <Edit className="w-4 h-4" />
                                Modifier
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setDeletingUser(user)
                                  setActionMenuOpen(null)
                                }}
                                disabled={user.super_admin}
                                className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 text-sm text-error disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                                Supprimer
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                      
                      {/* Boutons desktop */}
                      <div className="hidden lg:flex gap-2">
                        <button
                          onClick={() => setEditingUser(user)}
                          className="p-2 hover:bg-primary/10 text-primary rounded-lg transition-colors"
                          title="Modifier"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingUser(user)}
                          disabled={user.super_admin}
                          className="p-2 hover:bg-error/10 text-error rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title={user.super_admin ? 'Impossible de supprimer un super-admin' : 'Supprimer'}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="py-12 text-center text-text-secondary">
                  Aucun utilisateur trouvé
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="text-sm text-text-secondary">
            Page {currentPage} sur {totalPages}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="btn-secondary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
              Précédent
            </button>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="btn-secondary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Suivant
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      {editingUser && (
        <EditUserModal
          isOpen={!!editingUser}
          onClose={() => setEditingUser(null)}
          user={editingUser}
          onSuccess={handleSuccess}
        />
      )}

      {deletingUser && (
        <DeleteUserModal
          isOpen={!!deletingUser}
          onClose={() => setDeletingUser(null)}
          user={deletingUser}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  )
}
