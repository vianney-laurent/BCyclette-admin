'use client'

import { Reward } from '@/types'
import { useState, useEffect } from 'react'
import { X, Trash2, AlertTriangle, RefreshCw } from 'lucide-react'

interface DeleteRewardModalProps {
  isOpen: boolean
  onClose: () => void
  reward: Reward | null
  onSuccess: () => void
}

export default function DeleteRewardModal({ isOpen, onClose, reward, onSuccess }: DeleteRewardModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirmText, setConfirmText] = useState('')
  const confirmationWord = 'suppression'

  useEffect(() => {
    if (isOpen) {
      setConfirmText('')
      setError(null)
    }
  }, [isOpen])

  if (!isOpen || !reward) return null

  const canDelete = confirmText.toLowerCase() === confirmationWord.toLowerCase()

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!canDelete) {
      setError(`Vous devez taper &quot;${confirmationWord}&quot; pour confirmer`)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/rewards/${reward.id}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la suppression')
      }

      onSuccess()
      onClose()
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la suppression')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-surface rounded-xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-error/10 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-error" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-text-primary">Supprimer la récompense</h2>
              <p className="text-sm text-text-secondary">Cette action est irréversible</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-text-tertiary hover:text-text-primary transition-colors p-2 hover:bg-gray-100 rounded-lg"
            disabled={loading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleDelete} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {error && (
            <div className="bg-error/10 border border-error/20 text-error px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="bg-error/5 border border-error/20 rounded-lg p-4">
            <p className="text-sm text-text-primary font-semibold mb-2">
              Êtes-vous sûr de vouloir supprimer cette récompense ?
            </p>
            <div className="text-sm text-text-secondary space-y-1">
              <p><strong>Partenaire :</strong> {reward.partner_name}</p>
              <p><strong>Coût :</strong> {reward.point_cost} B&apos;Cycs</p>
              {reward.description && (
                <p><strong>Description :</strong> {reward.description}</p>
              )}
              <p className="text-error font-semibold mt-2">
                Cette action supprimera définitivement la récompense et toutes ses données associées.
              </p>
            </div>
          </div>

          <div>
            <label htmlFor="confirm" className="label">
              Pour confirmer, tapez <strong className="text-error">&quot;{confirmationWord}&quot;</strong> :
            </label>
            <input
              id="confirm"
              type="text"
              value={confirmText}
              onChange={(e) => {
                setConfirmText(e.target.value)
                setError(null)
              }}
              className={`input w-full ${canDelete ? 'border-primary' : ''}`}
              placeholder={confirmationWord}
              disabled={loading}
              autoFocus
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1"
              disabled={loading}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="btn-danger flex-1 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading || !canDelete}
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Suppression...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  Supprimer
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
