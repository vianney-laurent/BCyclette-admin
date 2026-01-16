import { NextRequest, NextResponse } from 'next/server'
import { createServerAdminClient } from '@/lib/supabase-server'
import { isSuperAdmin } from '@/utils/auth'

export async function POST(request: NextRequest) {
  try {
    // Vérifier que l'utilisateur est super-admin
    const admin = await isSuperAdmin()
    if (!admin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { name, fmd_budget_per_year, employee_count } = body

    if (!name || fmd_budget_per_year === undefined || employee_count === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const adminClient = createServerAdminClient()
    
    const { data, error } = await adminClient
      .from('companies')
      .insert({
        name,
        fmd_budget_per_year,
        employee_count,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating company:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ data }, { status: 201 })
  } catch (error: any) {
    console.error('Error in POST /api/companies:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
