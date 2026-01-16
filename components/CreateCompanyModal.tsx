'use client'

import { useState } from 'react'
import { X, Building2, Euro, Users } from 'lucide-react'

interface CreateCompanyModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function CreateCompanyModal({ isOpen, onClose }: CreateCompanyModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    fmd_budget_per_year: '600.00',
    employee_count: '1',
  })

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          fmd_budget_per_year: parseFloat(formData.fmd_budget_per_year),
          employee_count: parseInt(formData.employee_count),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la création')
      }

      // Succès - recharger la page
      window.location.reload()
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la création')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-surface rounded-xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-xl font-bold text-text-primary">
              Créer une entreprise
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-text-tertiary hover:text-text-primary transition-colors"
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

          <div>
            <label htmlFor="name" className="label">
              <Building2 className="inline w-4 h-4 mr-2" />
              Nom de l'entreprise *
            </label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input"
              placeholder="Ma Société"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="fmd_budget" className="label">
              <Euro className="inline w-4 h-4 mr-2" />
              Budget FMD annuel (€) *
            </label>
            <input
              id="fmd_budget"
              type="number"
              step="0.01"
              value={formData.fmd_budget_per_year}
              onChange={(e) => setFormData({ ...formData, fmd_budget_per_year: e.target.value })}
              className="input"
              placeholder="600.00"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="employee_count" className="label">
              <Users className="inline w-4 h-4 mr-2" />
              Nombre d'employés *
            </label>
            <input
              id="employee_count"
              type="number"
              min="1"
              value={formData.employee_count}
              onChange={(e) => setFormData({ ...formData, employee_count: e.target.value })}
              className="input"
              placeholder="1"
              required
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
              className="btn-primary flex-1"
              disabled={loading}
            >
              {loading ? 'Création...' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
