'use client'

import { Reward } from '@/types'
import { useState, useMemo } from 'react'
import { 
  Gift, 
  Euro, 
  Package, 
  Star,
  Search,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Edit,
  Trash2,
  MoreVertical,
  Power,
  PowerOff,
  Image as ImageIcon
} from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import EditRewardModal from './EditRewardModal'
import DeleteRewardModal from './DeleteRewardModal'
import { useRouter } from 'next/navigation'
import Toggle from './Toggle'

interface RewardsTableProps {
  rewards: Reward[]
}

type SortField = 'partner_name' | 'point_cost' | 'stock_quantity' | 'priority' | 'created_at'
type SortDirection = 'asc' | 'desc'

export default function RewardsTable({ rewards }: RewardsTableProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [sortField, setSortField] = useState<SortField>('priority')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [editingReward, setEditingReward] = useState<Reward | null>(null)
  const [deletingReward, setDeletingReward] = useState<Reward | null>(null)
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null)
  const [togglingReward, setTogglingReward] = useState<string | null>(null)
  const itemsPerPage = 20

  const handleSuccess = () => {
    router.refresh()
    setActionMenuOpen(null)
  }

  const handleToggleActive = async (reward: Reward) => {
    setTogglingReward(reward.id)
    try {
      const response = await fetch(`/api/rewards/${reward.id}/toggle`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !reward.is_active }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erreur lors de la mise à jour')
      }

      router.refresh()
    } catch (error: any) {
      alert(error.message || 'Erreur lors de la mise à jour')
    } finally {
      setTogglingReward(null)
      setActionMenuOpen(null)
    }
  }

  // Filtrage et tri
  const filteredAndSortedRewards = useMemo(() => {
    let filtered = [...rewards]

    // Recherche
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (reward) =>
          reward.partner_name.toLowerCase().includes(query) ||
          (reward.description && reward.description.toLowerCase().includes(query))
      )
    }

    // Filtre par statut
    if (statusFilter !== 'all') {
      filtered = filtered.filter((reward) => {
        if (statusFilter === 'active') return reward.is_active === true
        if (statusFilter === 'inactive') return reward.is_active === false
        return true
      })
    }

    // Tri
    filtered.sort((a, b) => {
      let aValue: any
      let bValue: any

      switch (sortField) {
        case 'partner_name':
          aValue = a.partner_name.toLowerCase()
          bValue = b.partner_name.toLowerCase()
          break
        case 'point_cost':
          aValue = a.point_cost
          bValue = b.point_cost
          break
        case 'stock_quantity':
          aValue = a.stock_quantity
          bValue = b.stock_quantity
          break
        case 'priority':
          aValue = a.priority
          bValue = b.priority
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
  }, [rewards, searchQuery, statusFilter, sortField, sortDirection])

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedRewards.length / itemsPerPage)
  const paginatedRewards = filteredAndSortedRewards.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
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
      {/* Filtres et recherche */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-tertiary w-5 h-5" />
          <input
            type="text"
            placeholder="Rechercher par nom ou description..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setCurrentPage(1)
            }}
            className="input pl-10 w-full"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')
            setCurrentPage(1)
          }}
          className="input sm:w-auto"
        >
          <option value="all">Tous les statuts</option>
          <option value="active">Actives uniquement</option>
          <option value="inactive">Inactives uniquement</option>
        </select>
      </div>

      {/* Table */}
      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left p-4 text-sm font-semibold text-text-primary">
                <button
                  onClick={() => handleSort('partner_name')}
                  className="flex items-center hover:text-primary transition-colors"
                >
                  Partenaire
                  <SortIcon field="partner_name" />
                </button>
              </th>
              <th className="text-left p-4 text-sm font-semibold text-text-primary">
                <button
                  onClick={() => handleSort('point_cost')}
                  className="flex items-center hover:text-primary transition-colors"
                >
                  Coût (B&apos;Cycs)
                  <SortIcon field="point_cost" />
                </button>
              </th>
              <th className="text-left p-4 text-sm font-semibold text-text-primary">
                Description
              </th>
              <th className="text-left p-4 text-sm font-semibold text-text-primary">
                <button
                  onClick={() => handleSort('stock_quantity')}
                  className="flex items-center hover:text-primary transition-colors"
                >
                  Stock
                  <SortIcon field="stock_quantity" />
                </button>
              </th>
              <th className="text-left p-4 text-sm font-semibold text-text-primary">
                <button
                  onClick={() => handleSort('priority')}
                  className="flex items-center hover:text-primary transition-colors"
                >
                  Priorité
                  <SortIcon field="priority" />
                </button>
              </th>
              <th className="text-left p-4 text-sm font-semibold text-text-primary">
                Statut
              </th>
              <th className="text-right p-4 text-sm font-semibold text-text-primary">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedRewards.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-text-secondary">
                  Aucune récompense trouvée
                </td>
              </tr>
            ) : (
              paginatedRewards.map((reward) => (
                <tr
                  key={reward.id}
                  className="border-b border-border hover:bg-gray-50 transition-colors"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      {reward.image_url ? (
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={reward.image_url}
                            alt={reward.partner_name}
                            className="w-12 h-12 object-cover rounded-lg"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none'
                            }}
                          />
                        </div>
                      ) : (
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Gift className="w-6 h-6 text-primary" />
                        </div>
                      )}
                      <div>
                        <div className="font-medium text-text-primary">{reward.partner_name}</div>
                        {reward.image_url && (
                          <div className="text-xs text-text-tertiary flex items-center gap-1 mt-1">
                            <ImageIcon className="w-3 h-3" />
                            Image
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Euro className="w-4 h-4 text-text-tertiary" />
                      <span className="font-medium">{reward.point_cost}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="text-sm text-text-secondary max-w-xs truncate">
                      {reward.description || '-'}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-text-tertiary" />
                      <span className={reward.stock_quantity === 0 ? 'text-error' : ''}>
                        {reward.stock_quantity}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-text-tertiary" />
                      <span>{reward.priority}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      {reward.is_active ? (
                        <span className="px-2 py-1 bg-success/10 text-success text-xs font-medium rounded-full">
                          Active
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-gray-100 text-text-tertiary text-xs font-medium rounded-full">
                          Inactive
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2">
                      {/* Desktop actions */}
                      <div className="hidden sm:flex items-center gap-2">
                        <button
                          onClick={() => handleToggleActive(reward)}
                          disabled={togglingReward === reward.id}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          title={reward.is_active ? 'Désactiver' : 'Activer'}
                        >
                          {togglingReward === reward.id ? (
                            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                          ) : reward.is_active ? (
                            <PowerOff className="w-5 h-5 text-text-tertiary" />
                          ) : (
                            <Power className="w-5 h-5 text-text-tertiary" />
                          )}
                        </button>
                        <button
                          onClick={() => setEditingReward(reward)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Modifier"
                        >
                          <Edit className="w-5 h-5 text-text-tertiary" />
                        </button>
                        <button
                          onClick={() => setDeletingReward(reward)}
                          className="p-2 hover:bg-error/10 rounded-lg transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="w-5 h-5 text-error" />
                        </button>
                      </div>

                      {/* Mobile actions */}
                      <div className="sm:hidden relative">
                        <button
                          onClick={() => setActionMenuOpen(actionMenuOpen === reward.id ? null : reward.id)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <MoreVertical className="w-5 h-5 text-text-tertiary" />
                        </button>
                        {actionMenuOpen === reward.id && (
                          <>
                            <div
                              className="fixed inset-0 z-10"
                              onClick={() => setActionMenuOpen(null)}
                            />
                            <div className="absolute right-0 top-full mt-2 bg-surface border border-border rounded-lg shadow-lg z-20 min-w-[160px]">
                              <button
                                onClick={() => {
                                  handleToggleActive(reward)
                                  setActionMenuOpen(null)
                                }}
                                disabled={togglingReward === reward.id}
                                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                              >
                                {togglingReward === reward.id ? (
                                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                ) : reward.is_active ? (
                                  <PowerOff className="w-4 h-4" />
                                ) : (
                                  <Power className="w-4 h-4" />
                                )}
                                {reward.is_active ? 'Désactiver' : 'Activer'}
                              </button>
                              <button
                                onClick={() => {
                                  setEditingReward(reward)
                                  setActionMenuOpen(null)
                                }}
                                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                              >
                                <Edit className="w-4 h-4" />
                                Modifier
                              </button>
                              <button
                                onClick={() => {
                                  setDeletingReward(reward)
                                  setActionMenuOpen(null)
                                }}
                                className="w-full px-4 py-2 text-left text-sm hover:bg-error/10 text-error flex items-center gap-2"
                              >
                                <Trash2 className="w-4 h-4" />
                                Supprimer
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-text-secondary">
            Affichage de {(currentPage - 1) * itemsPerPage + 1} à {Math.min(currentPage * itemsPerPage, filteredAndSortedRewards.length)} sur {filteredAndSortedRewards.length} récompenses
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-sm text-text-secondary">
              Page {currentPage} sur {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      {editingReward && (
        <EditRewardModal
          isOpen={!!editingReward}
          onClose={() => setEditingReward(null)}
          reward={editingReward}
          onSuccess={handleSuccess}
        />
      )}

      {deletingReward && (
        <DeleteRewardModal
          isOpen={!!deletingReward}
          onClose={() => setDeletingReward(null)}
          reward={deletingReward}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  )
}
