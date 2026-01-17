'use client'

import { Reward } from '@/types'
import { useState, useEffect } from 'react'
import { X, Gift, Euro, Package, Image, Star, ToggleLeft, Save, RefreshCw } from 'lucide-react'
import Toggle from './Toggle'

interface EditRewardModalProps {
  isOpen: boolean
  onClose: () => void
  reward: Reward | null
  onSuccess: () => void
}

export default function EditRewardModal({ isOpen, onClose, reward, onSuccess }: EditRewardModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    partner_name: '',
    point_cost: '',
    description: '',
    stock_quantity: '0',
    image_url: '',
    is_active: true,
    priority: '0',
  })

  // Initialiser le formulaire avec les données du reward
  useEffect(() => {
    if (reward) {
      setFormData({
        partner_name: reward.partner_name || '',
        point_cost: reward.point_cost.toString(),
        description: reward.description || '',
        stock_quantity: reward.stock_quantity.toString(),
        image_url: reward.image_url || '',
        is_active: reward.is_active,
        priority: reward.priority.toString(),
      })
      setError(null)
    }
  }, [reward])

  if (!isOpen || !reward) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/rewards/${reward.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          partner_name: formData.partner_name,
          point_cost: parseInt(formData.point_cost),
          description: formData.description || null,
          stock_quantity: parseInt(formData.stock_quantity),
          image_url: formData.image_url || null,
          is_active: formData.is_active,
          priority: parseInt(formData.priority),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la mise à jour')
      }

      onSuccess()
      onClose()
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la mise à jour')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-surface rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-surface">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Gift className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-xl font-bold text-text-primary">
              Modifier la récompense
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-text-tertiary hover:text-text-primary transition-colors"
            disabled={loading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-error/10 border border-error/20 text-error px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Nom du partenaire */}
          <div>
            <label htmlFor="partner_name" className="label">
              <Gift className="inline w-4 h-4 mr-2" />
              Nom du partenaire *
            </label>
            <input
              id="partner_name"
              type="text"
              value={formData.partner_name}
              onChange={(e) => setFormData({ ...formData, partner_name: e.target.value })}
              className="input"
              placeholder="Ex: Café Vélo du Coin"
              required
              disabled={loading}
            />
          </div>

          {/* Coût en points */}
          <div>
            <label htmlFor="point_cost" className="label">
              <Euro className="inline w-4 h-4 mr-2" />
              Coût en points (B&apos;Cycs) *
            </label>
            <input
              id="point_cost"
              type="number"
              min="0"
              value={formData.point_cost}
              onChange={(e) => setFormData({ ...formData, point_cost: e.target.value })}
              className="input"
              placeholder="500"
              required
              disabled={loading}
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="label">
              Description
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input"
              placeholder="Description de l&apos;offre..."
              rows={3}
              disabled={loading}
            />
          </div>

          {/* Stock */}
          <div>
            <label htmlFor="stock_quantity" className="label">
              <Package className="inline w-4 h-4 mr-2" />
              Quantité en stock
            </label>
            <input
              id="stock_quantity"
              type="number"
              min="0"
              value={formData.stock_quantity}
              onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
              className="input"
              placeholder="0"
              disabled={loading}
            />
          </div>

          {/* URL de l&apos;image */}
          <div>
            <label htmlFor="image_url" className="label">
              <Image className="inline w-4 h-4 mr-2" />
              URL de l&apos;image
            </label>
            <input
              id="image_url"
              type="url"
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              className="input"
              placeholder="https://example.com/image.png"
              disabled={loading}
            />
          </div>

          {/* Priorité */}
          <div>
            <label htmlFor="priority" className="label">
              <Star className="inline w-4 h-4 mr-2" />
              Priorité d&apos;affichage
            </label>
            <input
              id="priority"
              type="number"
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              className="input"
              placeholder="0"
              disabled={loading}
            />
            <p className="text-xs text-text-tertiary mt-1">
              Plus le nombre est élevé, plus l&apos;offre apparaîtra en haut de la liste
            </p>
          </div>

          {/* Actif */}
          <div className="p-4 border border-border rounded-lg">
            <label className="label">
              <ToggleLeft className="inline w-4 h-4 mr-2" />
              Offre active
            </label>
            <p className="text-sm text-text-secondary mb-3">
              L&apos;offre sera visible dans l&apos;application si activée
            </p>
            <Toggle
              id="is_active"
              checked={formData.is_active}
              onChange={(checked) => setFormData({ ...formData, is_active: checked })}
              disabled={loading}
            />
          </div>

          <div className="flex gap-3 pt-4">
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
              className="btn-primary flex-1 flex items-center justify-center gap-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Mise à jour...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Enregistrer
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
