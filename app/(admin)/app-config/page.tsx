import { createServerAdminClient } from '@/lib/supabase-server'
import { AppConfig } from '@/types'
import AppConfigForm from '@/components/AppConfigForm'
import { Settings } from 'lucide-react'

export default async function AppConfigPage() {
  const adminClient = createServerAdminClient()

  const { data: config, error } = await adminClient
    .from('app_config')
    .select('*')
    .order('key')

  if (error) {
    console.error('Error fetching app config:', error)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-text-primary flex items-center gap-3">
          <Settings className="w-8 h-8 text-primary" />
          Configuration Globale
        </h1>
        <p className="text-text-secondary mt-2">
          Valeurs par défaut utilisées pour toutes les entreprises
        </p>
      </div>

      <div className="card">
        <AppConfigForm config={config as AppConfig[]} />
      </div>
    </div>
  )
}
