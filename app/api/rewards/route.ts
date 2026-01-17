import { NextRequest, NextResponse } from 'next/server'
import { createServerAdminClient } from '@/lib/supabase-server'
import { isSuperAdmin } from '@/utils/auth'

// GET - Récupérer tous les rewards
export async function GET() {
  try {
    // Vérifier que l'utilisateur est super-admin
    const isAdmin = await isSuperAdmin()
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 403 }
      )
    }

    const adminClient = createServerAdminClient()

    const { data: rewards, error } = await adminClient
      .from('rewards')
      .select('*')
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching rewards:', error)
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des rewards' },
        { status: 500 }
      )
    }

    return NextResponse.json(rewards)
  } catch (error: any) {
    console.error('Error in GET /api/rewards:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    )
  }
}

// POST - Créer un nouveau reward
export async function POST(request: NextRequest) {
  try {
    // Vérifier que l'utilisateur est super-admin
    const isAdmin = await isSuperAdmin()
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 403 }
      )
    }

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
    if (!partner_name || !point_cost) {
      return NextResponse.json(
        { error: 'Le nom du partenaire et le coût en points sont requis' },
        { status: 400 }
      )
    }

    if (point_cost < 0) {
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

    const { data: reward, error } = await adminClient
      .from('rewards')
      .insert({
        partner_name,
        point_cost: parseInt(point_cost),
        description: description || null,
        stock_quantity: stock_quantity !== undefined ? parseInt(stock_quantity) : 0,
        image_url: image_url || null,
        is_active: is_active !== undefined ? is_active : true,
        priority: priority !== undefined ? parseInt(priority) : 0,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating reward:', error)
      return NextResponse.json(
        { error: 'Erreur lors de la création du reward' },
        { status: 500 }
      )
    }

    return NextResponse.json(reward, { status: 201 })
  } catch (error: any) {
    console.error('Error in POST /api/rewards:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    )
  }
}
