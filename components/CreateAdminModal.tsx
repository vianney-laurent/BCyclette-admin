'use client'

import { useState } from 'react'
import { X, UserPlus, Mail, User, Lock } from 'lucide-react'

interface CreateAdminModalProps {
  isOpen: boolean
  onClose: () => void
  companyId: string
  companyName: string
}

export default function CreateAdminModal({
  isOpen,
  onClose,
  companyId,
  companyName,
}: CreateAdminModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    password: '',
    confirmPassword: '',
  })

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      setLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/companies/create-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId,
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          password: formData.password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la création')
      }

      // Succès - fermer et recharger
      onClose()
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
              <UserPlus className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-text-primary">
                Créer un administrateur
              </h2>
              <p className="text-sm text-text-secondary">{companyName}</p>
            </div>
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
            <label htmlFor="email" className="label">
              <Mail className="inline w-4 h-4 mr-2" />
              Email *
            </label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="input"
              placeholder="admin@entreprise.com"
              required
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="label">
                <User className="inline w-4 h-4 mr-2" />
                Prénom *
              </label>
              <input
                id="firstName"
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="input"
                placeholder="Jean"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="lastName" className="label">
                Nom *
              </label>
              <input
                id="lastName"
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="input"
                placeholder="Dupont"
                required
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="label">
              <Lock className="inline w-4 h-4 mr-2" />
              Mot de passe *
            </label>
            <input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="input"
              placeholder="••••••••"
              required
              disabled={loading}
              minLength={6}
            />
            <p className="text-xs text-text-tertiary mt-1">
              Minimum 6 caractères
            </p>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="label">
              Confirmer le mot de passe *
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) =>
                setFormData({ ...formData, confirmPassword: e.target.value })
              }
              className="input"
              placeholder="••••••••"
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
              {loading ? 'Création...' : 'Créer l\'admin'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
