'use client'

import { Reward } from '@/types'
import RewardsTable from './RewardsTable'
import CreateRewardModal from './CreateRewardModal'
import { Gift, Plus } from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface RewardsPageClientProps {
  rewards: Reward[]
}

export default function RewardsPageClient({ rewards }: RewardsPageClientProps) {
  const router = useRouter()
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  const handleSuccess = () => {
    router.refresh()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-primary flex items-center gap-3">
            <Gift className="w-8 h-8 text-primary" />
            Récompenses
          </h1>
          <p className="text-text-secondary mt-2">
            Gérez les offres B&apos;Cycs disponibles dans l&apos;application
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          <span>Nouvelle récompense</span>
        </button>
      </div>

      <div className="card">
        {rewards && rewards.length > 0 ? (
          <RewardsTable rewards={rewards} />
        ) : (
          <div className="text-center py-12">
            <Gift className="w-16 h-16 text-text-tertiary mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-text-primary mb-2">
              Aucune récompense
            </h3>
            <p className="text-text-secondary mb-4">
              Créez votre première récompense pour commencer
            </p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="btn-primary flex items-center gap-2 mx-auto"
            >
              <Plus className="w-5 h-5" />
              <span>Nouvelle récompense</span>
            </button>
          </div>
        )}
      </div>

      <CreateRewardModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleSuccess}
      />
    </div>
  )
}
