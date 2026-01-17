import { createServerAdminClient } from '@/lib/supabase-server'
import { Company } from '@/types'
import CompaniesTable from '@/components/CompaniesTable'
import CreateCompanyButton from '@/components/CreateCompanyButton'
import { Building2, Plus } from 'lucide-react'

export default async function CompaniesPage() {
  const adminClient = createServerAdminClient()
  
  const { data: companies, error } = await adminClient
    .from('companies')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching companies:', error)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary flex items-center gap-3">
            <Building2 className="w-8 h-8 text-primary" />
            Entreprises
          </h1>
          <p className="text-text-secondary mt-2">
            Gérez toutes les entreprises de B&apos;Cyclette
          </p>
        </div>
        <CreateCompanyButton />
      </div>

      <div className="card">
        {companies && companies.length > 0 ? (
          <CompaniesTable companies={companies as Company[]} />
        ) : (
          <div className="text-center py-12">
            <Building2 className="w-16 h-16 text-text-tertiary mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-text-primary mb-2">
              Aucune entreprise
            </h3>
            <p className="text-text-secondary mb-6">
              Commencez par créer votre première entreprise
            </p>
            <CreateCompanyButton />
          </div>
        )}
      </div>
    </div>
  )
}
