import { NextRequest, NextResponse } from 'next/server'
import { createServerAdminClient } from '@/lib/supabase-server'
import { isSuperAdmin } from '@/utils/auth'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await isSuperAdmin()
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    const adminClient = createServerAdminClient()

    // Mettre à jour chaque clé de configuration avec validation
    const updates = Object.entries(body).map(([key, value]) => {
      let finalValue = String(value)
      
      // Validation spéciale pour fmd_rate_per_km
      if (key === 'fmd_rate_per_km') {
        const numValue = parseFloat(finalValue)
        if (isNaN(numValue) || numValue < 0) {
          finalValue = '0.25' // Valeur par défaut si invalide
        } else {
          // Formater avec 2 décimales max
          finalValue = numValue.toFixed(2)
        }
      }
      
      return {
        company_id: id,
        key,
        value: finalValue,
      }
    })

    // Utiliser upsert pour créer ou mettre à jour
    const { error } = await adminClient
      .from('company_config')
      .upsert(updates, { onConflict: 'company_id,key' })

    if (error) {
      console.error('Error updating company config:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error in PUT /api/companies/[id]/config:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
