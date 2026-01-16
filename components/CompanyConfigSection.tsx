'use client'

import { CompanyConfig } from '@/types'
import { useState } from 'react'
import { Save, RefreshCw } from 'lucide-react'
import Toggle from './Toggle'

interface CompanyConfigSectionProps {
  companyId: string
  config: CompanyConfig[]
}

export default function CompanyConfigSection({
  companyId,
  config,
}: CompanyConfigSectionProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [formData, setFormData] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {}
    config.forEach((item) => {
      initial[item.key] = item.value
    })
    
    // Validation et valeur par défaut pour fmd_rate_per_km
    const fmdValue = initial['fmd_rate_per_km']
    if (!fmdValue || fmdValue.trim() === '' || isNaN(parseFloat(fmdValue)) || parseFloat(fmdValue) < 0) {
      initial['fmd_rate_per_km'] = '0.25'
    } else {
      // S'assurer que la valeur est bien formatée (max 2 décimales)
      const numValue = parseFloat(fmdValue)
      initial['fmd_rate_per_km'] = numValue.toFixed(2)
    }
    
    return initial
  })

  const configItems = [
    {
      key: 'auto_validate_trips',
      label: 'Validation automatique des trajets',
      description: 'Si activé, les trajets travail sont automatiquement validés',
      type: 'boolean',
    },
    {
      key: 'co2_factor_per_km',
      label: 'Facteur CO2 (kg/km)',
      description: 'Coefficient de conversion kilomètres vers CO2 économisé',
      type: 'number',
    },
    {
      key: 'fmd_rate_per_km',
      label: 'Taux FMD (€/km)',
      description: 'Montant de l\'indemnité kilométrique vélo par kilomètre',
      type: 'number',
    },
    {
      key: 'auto_export_enabled',
      label: 'Export mensuel automatique',
      description: 'Activer l\'envoi automatique des exports mensuels',
      type: 'boolean',
    },
    {
      key: 'auto_export_email',
      label: 'Email destinataire export',
      description: 'Email qui recevra les exports mensuels',
      type: 'email',
    },
    {
      key: 'auto_export_day',
      label: 'Jour d\'envoi export',
      description: 'Jour du mois pour l\'envoi de l\'export (1-31)',
      type: 'number',
    },
  ]

  const handleSave = async () => {
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch(`/api/companies/${companyId}/config`, {
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
        {configItems.map((item) => {
          const value = formData[item.key] || ''
          const configItem = config.find((c) => c.key === item.key)

          return (
            <div key={item.key} className="border border-border rounded-lg p-4">
              <label className="label">
                {item.label}
              </label>
              <p className="text-sm text-text-secondary mb-3">
                {item.description}
              </p>

              {item.type === 'boolean' ? (
                <Toggle
                  id={`toggle-${item.key}`}
                  checked={value === 'true'}
                  onChange={(checked) =>
                    setFormData({
                      ...formData,
                      [item.key]: checked ? 'true' : 'false',
                    })
                  }
                  disabled={loading}
                />
              ) : item.type === 'number' ? (
                <input
                  type="number"
                  step={item.key === 'fmd_rate_per_km' ? '0.01' : item.key === 'auto_export_day' ? '1' : '0.01'}
                  min={item.key === 'fmd_rate_per_km' ? '0' : item.key === 'auto_export_day' ? '1' : '0'}
                  max={item.key === 'auto_export_day' ? '31' : undefined}
                  value={value || (item.key === 'fmd_rate_per_km' ? '0.25' : '')}
                  onChange={(e) => {
                    const inputValue = e.target.value
                    // Pour fmd_rate_per_km, valider que c'est un nombre décimal valide
                    if (item.key === 'fmd_rate_per_km') {
                      if (inputValue === '' || inputValue === '-') {
                        // Permettre la saisie en cours
                        setFormData({ ...formData, [item.key]: inputValue })
                      } else {
                        const numValue = parseFloat(inputValue)
                        if (!isNaN(numValue) && numValue >= 0) {
                          setFormData({ ...formData, [item.key]: inputValue })
                        }
                      }
                    } else {
                      setFormData({ ...formData, [item.key]: inputValue })
                    }
                  }}
                  onBlur={(e) => {
                    // À la perte de focus, s'assurer que fmd_rate_per_km a une valeur valide
                    if (item.key === 'fmd_rate_per_km') {
                      const inputValue = e.target.value
                      if (!inputValue || inputValue.trim() === '' || isNaN(parseFloat(inputValue)) || parseFloat(inputValue) < 0) {
                        setFormData({ ...formData, [item.key]: '0.25' })
                      } else {
                        const numValue = parseFloat(inputValue)
                        setFormData({ ...formData, [item.key]: numValue.toFixed(2) })
                      }
                    }
                  }}
                  className="input"
                  placeholder={item.key === 'fmd_rate_per_km' ? '0.25' : configItem?.value || ''}
                />
              ) : (
                <input
                  type={item.type}
                  value={value}
                  onChange={(e) =>
                    setFormData({ ...formData, [item.key]: e.target.value })
                  }
                  className="input"
                  placeholder={configItem?.value || ''}
                />
              )}
            </div>
          )
        })}
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
