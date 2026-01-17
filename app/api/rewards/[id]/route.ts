import { NextRequest, NextResponse } from 'next/server'
import { createServerAdminClient } from '@/lib/supabase-server'
import { isSuperAdmin } from '@/utils/auth'

// PUT - Modifier un reward
export async function PUT(
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
    const {
      partner_name,
      point_cost,
      description,
      stock_quantity,
      image_url,
      is_active,
      priority,
    } = body

    // Validation
    if (point_cost !== undefined && point_cost < 0) {
      return NextResponse.json(
        { error: 'Le coût en points doit être positif' },
        { status: 400 }
      )
    }

    if (stock_quantity !== undefined && stock_quantity < 0) {
      return NextResponse.json(
        { error: 'La quantité en stock doit être positive' },
        { status: 400 }
      )
    }

    const adminClient = createServerAdminClient()

    // Construire l'objet de mise à jour
    const updateData: any = {}
    if (partner_name !== undefined) updateData.partner_name = partner_name
    if (point_cost !== undefined) updateData.point_cost = parseInt(point_cost)
    if (description !== undefined) updateData.description = description || null
    if (stock_quantity !== undefined) updateData.stock_quantity = parseInt(stock_quantity)
    if (image_url !== undefined) updateData.image_url = image_url || null
    if (is_active !== undefined) updateData.is_active = is_active
    if (priority !== undefined) updateData.priority = parseInt(priority)

    const { data: reward, error } = await adminClient
      .from('rewards')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating reward:', error)
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
    console.error('Error in PUT /api/rewards/[id]:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    )
  }
}

// DELETE - Supprimer un reward
export async function DELETE(
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

    const adminClient = createServerAdminClient()

    const { error } = await adminClient
      .from('rewards')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting reward:', error)
      return NextResponse.json(
        { error: 'Erreur lors de la suppression du reward' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error in DELETE /api/rewards/[id]:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    )
  }
}
