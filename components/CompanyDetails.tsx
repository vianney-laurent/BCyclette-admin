'use client'

import { Company, CompanyConfig } from '@/types'
import { useState } from 'react'
import { Settings, Users, BarChart3, Plus, Mail } from 'lucide-react'
import CompanyConfigSection from './CompanyConfigSection'
import CompanyUsersSection from './CompanyUsersSection'
import CreateAdminModal from './CreateAdminModal'

interface CompanyDetailsProps {
  company: Company
  config: CompanyConfig[]
  users: any[]
  stats: {
    totalTrips: number
    totalKm: number
    totalPoints: number
  }
}

export default function CompanyDetails({
  company,
  config,
  users,
  stats,
}: CompanyDetailsProps) {
  const [activeTab, setActiveTab] = useState<'config' | 'users' | 'stats'>('config')
  const [isCreateAdminOpen, setIsCreateAdminOpen] = useState(false)

  const tabs = [
    { id: 'config', label: 'Configuration', icon: Settings },
    { id: 'users', label: 'Utilisateurs', icon: Users },
    { id: 'stats', label: 'Statistiques', icon: BarChart3 },
  ]

  return (
    <>
      <div className="card">
        {/* Tabs */}
        <div className="border-b border-border mb-6">
          <div className="flex gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-3 font-semibold transition-colors ${
                    isActive
                      ? 'text-primary border-b-2 border-primary'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'config' && (
          <CompanyConfigSection companyId={company.id} config={config} />
        )}

        {activeTab === 'users' && (
          <CompanyUsersSection
            companyId={company.id}
            users={users}
            onCreateAdmin={() => setIsCreateAdminOpen(true)}
          />
        )}

        {activeTab === 'stats' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-primary/5 rounded-lg p-6 border border-primary/20">
                <div className="text-sm text-text-secondary mb-1">Trajets</div>
                <div className="text-3xl font-bold text-text-primary">
                  {stats.totalTrips}
                </div>
              </div>
              <div className="bg-primary/5 rounded-lg p-6 border border-primary/20">
                <div className="text-sm text-text-secondary mb-1">Kilomètres</div>
                <div className="text-3xl font-bold text-text-primary">
                  {stats.totalKm.toFixed(1)}
                </div>
              </div>
              <div className="bg-primary/5 rounded-lg p-6 border border-primary/20">
                <div className="text-sm text-text-secondary mb-1">Points</div>
                <div className="text-3xl font-bold text-text-primary">
                  {stats.totalPoints}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <CreateAdminModal
        isOpen={isCreateAdminOpen}
        onClose={() => setIsCreateAdminOpen(false)}
        companyId={company.id}
        companyName={company.name}
      />
    </>
  )
}
