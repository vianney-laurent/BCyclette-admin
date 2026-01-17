import { createServerAdminClient } from '@/lib/supabase-server'
import { BarChart3, Building2, Users, Bike, Leaf, Euro } from 'lucide-react'

export default async function StatsPage() {
  const adminClient = createServerAdminClient()

  // Récupérer toutes les entreprises
  const { data: companies } = await adminClient.from('companies').select('id, name')

  // Récupérer tous les utilisateurs
  const { data: users } = await adminClient.from('users').select('id, company_id')

  // Récupérer tous les trajets
  const { data: trips } = await adminClient
    .from('trips')
    .select('distance, points_earned, status, type, user_id')

  // Calculer les stats globales
  const totalCompanies = companies?.length || 0
  const totalUsers = users?.length || 0
  const totalTrips = trips?.length || 0
  const totalKm = trips?.reduce((sum, t) => sum + (t.distance || 0), 0) || 0
  const totalPoints = trips?.reduce((sum, t) => sum + (t.points_earned || 0), 0) || 0
  const validatedTrips = trips?.filter((t) => t.status === 'validated').length || 0
  const commuteTrips = trips?.filter((t) => t.type === 'commute').length || 0

  // Calculer CO2 (approximatif avec facteur 0.21)
  const totalCO2 = totalKm * 0.21

  const stats = [
    {
      label: 'Entreprises',
      value: totalCompanies,
      icon: Building2,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      label: 'Utilisateurs',
      value: totalUsers,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      label: 'Trajets',
      value: totalTrips,
      icon: Bike,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      label: 'Kilomètres',
      value: totalKm.toFixed(1),
      icon: Bike,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      label: 'CO2 évité (kg)',
      value: totalCO2.toFixed(1),
      icon: Leaf,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100',
    },
    {
      label: 'Points totaux',
      value: totalPoints.toLocaleString(),
      icon: Euro,
      color: 'text-amber-600',
      bgColor: 'bg-amber-100',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-text-primary flex items-center gap-3">
          <BarChart3 className="w-8 h-8 text-primary" />
          Statistiques Globales
        </h1>
        <p className="text-text-secondary mt-2">
          Vue d&apos;ensemble de toutes les entreprises et utilisateurs
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="card">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
              <div className="text-3xl font-bold text-text-primary mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-text-secondary">{stat.label}</div>
            </div>
          )
        })}
      </div>

      <div className="card">
        <h2 className="text-xl font-semibold text-text-primary mb-4">
          Détails
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-text-secondary mb-1">Trajets validés</div>
            <div className="text-2xl font-bold text-text-primary">{validatedTrips}</div>
          </div>
          <div>
            <div className="text-sm text-text-secondary mb-1">Trajets travail</div>
            <div className="text-2xl font-bold text-text-primary">{commuteTrips}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
