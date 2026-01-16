import { NextRequest, NextResponse } from 'next/server'
import { createServerAdminClient } from '@/lib/supabase-server'
import { isSuperAdmin } from '@/utils/auth'

export async function PUT(request: NextRequest) {
  try {
    const admin = await isSuperAdmin()
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const adminClient = createServerAdminClient()

    // Mettre à jour chaque clé de configuration
    const updates = Object.entries(body).map(([key, value]) => ({
      key,
      value: String(value),
      updated_at: new Date().toISOString(),
    }))

    // Utiliser upsert pour créer ou mettre à jour
    const { error } = await adminClient
      .from('app_config')
      .upsert(updates, { onConflict: 'key' })

    if (error) {
      console.error('Error updating app config:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error in PUT /api/app-config:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
