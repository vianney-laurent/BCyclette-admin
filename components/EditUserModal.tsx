'use client'

import { User } from '@/types'
import { useState, useEffect } from 'react'
import { X, User as UserIcon, Mail, Shield, Building2, Save, RefreshCw } from 'lucide-react'
import Toggle from './Toggle'

interface EditUserModalProps {
  isOpen: boolean
  onClose: () => void
  user: User | null
  onSuccess: () => void
}

export default function EditUserModal({ isOpen, onClose, user, onSuccess }: EditUserModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    role: 'employee' as 'admin' | 'employee',
    super_admin: false,
    account_type: 'b2c' as 'b2c' | 'b2b2c',
    company_id: '',
  })

  // Initialiser le formulaire avec les données de l'utilisateur
  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email,
        role: user.role,
        super_admin: user.super_admin || false,
        account_type: user.account_type,
        company_id: user.company_id || '',
      })
      setError(null)
    }
  }, [user])

  if (!isOpen || !user) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: formData.first_name || null,
          last_name: formData.last_name || null,
          email: formData.email,
          role: formData.role,
          super_admin: formData.super_admin,
          account_type: formData.account_type,
          company_id: formData.company_id || null,
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
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-border sticky top-0 bg-surface">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <UserIcon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-text-primary">Modifier l&apos;utilisateur</h2>
              <p className="text-sm text-text-secondary">Mettre à jour les informations de l&apos;utilisateur</p>
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {error && (
            <div className="bg-error/10 border border-error/20 text-error px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Nom et Prénom */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="first_name" className="label">
                Prénom
              </label>
              <input
                id="first_name"
                type="text"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                className="input w-full"
                placeholder="Prénom"
                disabled={loading}
              />
            </div>
            <div>
              <label htmlFor="last_name" className="label">
                Nom
              </label>
              <input
                id="last_name"
                type="text"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                className="input w-full"
                placeholder="Nom"
                disabled={loading}
              />
            </div>
          </div>

          {/* Email */}
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
              className="input w-full"
              placeholder="email@exemple.com"
              required
              disabled={loading}
            />
          </div>

          {/* Type de compte */}
          <div>
            <label htmlFor="account_type" className="label">
              Type de compte *
            </label>
            <select
              id="account_type"
              value={formData.account_type}
              onChange={(e) => setFormData({ ...formData, account_type: e.target.value as 'b2c' | 'b2b2c' })}
              className="input w-full"
              required
              disabled={loading}
            >
              <option value="b2c">B2C (Grand public)</option>
              <option value="b2b2c">B2B2C (Entreprise)</option>
            </select>
          </div>

          {/* Rôle */}
          <div>
            <label htmlFor="role" className="label">
              <Shield className="inline w-4 h-4 mr-2" />
              Rôle *
            </label>
            <select
              id="role"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as 'admin' | 'employee' })}
              className="input w-full"
              required
              disabled={loading || formData.super_admin}
            >
              <option value="employee">Employé</option>
              <option value="admin">Admin</option>
            </select>
            {formData.super_admin && (
              <p className="text-xs text-text-tertiary mt-1">
                Le rôle est automatiquement &quot;admin&quot; pour les super-admins
              </p>
            )}
          </div>

          {/* Super Admin */}
          <div className="p-4 border border-border rounded-lg">
            <label className="label">
              <Shield className="inline w-4 h-4 mr-2" />
              Super-Administrateur
            </label>
            <p className="text-sm text-text-secondary mb-3">
              Accès complet à toutes les entreprises et fonctionnalités d&apos;administration
            </p>
            <Toggle
              id="super_admin"
              checked={formData.super_admin}
              onChange={(checked) => setFormData({ ...formData, super_admin: checked })}
              disabled={loading}
            />
          </div>

          {/* Company ID */}
          <div>
            <label htmlFor="company_id" className="label">
              <Building2 className="inline w-4 h-4 mr-2" />
              ID Entreprise
            </label>
            <input
              id="company_id"
              type="text"
              value={formData.company_id}
              onChange={(e) => setFormData({ ...formData, company_id: e.target.value })}
              className="input w-full"
              placeholder="ID de l'entreprise (laisser vide pour B2C)"
              disabled={loading}
            />
            <p className="text-xs text-text-tertiary mt-1">
              Laisser vide pour les utilisateurs B2C
            </p>
          </div>

          {/* Actions */}
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
