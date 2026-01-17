import { NextRequest, NextResponse } from 'next/server'
import { createServerAdminClient } from '@/lib/supabase-server'
import { isSuperAdmin } from '@/utils/auth'

// PATCH - Activer/Désactiver un reward
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Vérifier que l'utilisateur est super-admin
    const isAdmin = await isSuperAdmin()
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 403 }
      )
    }

    const { id } = params
    const body = await request.json()
    const { is_active } = body

    if (typeof is_active !== 'boolean') {
      return NextResponse.json(
        { error: 'is_active doit être un booléen' },
        { status: 400 }
      )
    }

    const adminClient = createServerAdminClient()

    const { data: reward, error } = await adminClient
      .from('rewards')
      .update({ is_active })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error toggling reward:', error)
      return NextResponse.json(
        { error: 'Erreur lors de la mise à jour du reward' },
        { status: 500 }
      )
    }

    if (!reward) {
      return NextResponse.json(
        { error: 'Reward non trouvé' },
        { status: 404 }
      )
    }

    return NextResponse.json(reward)
  } catch (error: any) {
    console.error('Error in PATCH /api/rewards/[id]/toggle:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    )
  }
}
