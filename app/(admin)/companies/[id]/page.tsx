import { createServerAdminClient } from '@/lib/supabase-server'
import { notFound } from 'next/navigation'
import { Company, CompanyConfig } from '@/types'
import CompanyDetails from '@/components/CompanyDetails'
import { Building2 } from 'lucide-react'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function CompanyDetailPage({ params }: PageProps) {
  const { id } = await params
  const adminClient = createServerAdminClient()

  // Récupérer l'entreprise
  const { data: company, error: companyError } = await adminClient
    .from('companies')
    .select('*')
    .eq('id', id)
    .single()

  if (companyError || !company) {
    notFound()
  }

  // Récupérer la configuration
  const { data: config } = await adminClient
    .from('company_config')
    .select('*')
    .eq('company_id', id)
    .order('key')

  // Récupérer les utilisateurs de l'entreprise
  const { data: users } = await adminClient
    .from('users')
    .select('id, email, first_name, last_name, role, created_at')
    .eq('company_id', id)
    .order('created_at', { ascending: false })

  // Récupérer les statistiques
  const { data: stats } = await adminClient
    .from('trips')
    .select('distance, points_earned, status, type')
    .in('user_id', users?.map(u => u.id) || [])

  const totalTrips = stats?.length || 0
  const totalKm = stats?.reduce((sum, t) => sum + (t.distance || 0), 0) || 0
  const totalPoints = stats?.reduce((sum, t) => sum + (t.points_earned || 0), 0) || 0

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
          <Building2 className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-text-primary">
            {company.name}
          </h1>
          <p className="text-text-secondary">
            Gestion et configuration de l&apos;entreprise
          </p>
        </div>
      </div>

      <CompanyDetails
        company={company as Company}
        config={config as CompanyConfig[]}
        users={users || []}
        stats={{
          totalTrips,
          totalKm,
          totalPoints,
        }}
      />
    </div>
  )
}
