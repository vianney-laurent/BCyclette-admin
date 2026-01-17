import { createServerAdminClient } from '@/lib/supabase-server'
import { Reward } from '@/types'
import RewardsTable from '@/components/RewardsTable'
import RewardsPageClient from '@/components/RewardsPageClient'
import { Gift } from 'lucide-react'

export default async function RewardsPage() {
  const adminClient = createServerAdminClient()

  const { data: rewards, error } = await adminClient
    .from('rewards')
    .select('*')
    .order('priority', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching rewards:', error)
  }

  return (
    <RewardsPageClient rewards={(rewards as Reward[]) || []} />
  )
}
