'use client'

import { AppConfig } from '@/types'
import { useState } from 'react'
import { Save, RefreshCw } from 'lucide-react'

interface AppConfigFormProps {
  config: AppConfig[]
}

export default function AppConfigForm({ config }: AppConfigFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [formData, setFormData] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {}
    config.forEach((item) => {
      initial[item.key] = item.value
    })
    return initial
  })

  const handleSave = async () => {
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch('/api/app-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la sauvegarde')
      }

      setSuccess('Configuration sauvegardée avec succès')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la sauvegarde')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-error/10 border border-error/20 text-error px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-success/10 border border-success/20 text-success px-4 py-3 rounded-lg text-sm">
          {success}
        </div>
      )}

      <div className="space-y-4">
        {config
          .filter((item) => item.key !== 'auto_validate_trips')
          .map((item) => (
            <div key={item.key} className="border border-border rounded-lg p-4">
              <label className="label">{item.key}</label>
              {item.description && (
                <p className="text-sm text-text-secondary mb-3">
                  {item.description}
                </p>
              )}
              <input
                type="text"
                value={formData[item.key] || ''}
                onChange={(e) =>
                  setFormData({ ...formData, [item.key]: e.target.value })
                }
                className="input"
              />
            </div>
          ))}
      </div>

      <div className="flex justify-end pt-4 border-t border-border">
        <button
          onClick={handleSave}
          disabled={loading}
          className="btn-primary flex items-center gap-2"
        >
          {loading ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          Sauvegarder
        </button>
      </div>
    </div>
  )
}
