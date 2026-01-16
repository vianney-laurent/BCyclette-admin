import { NextRequest, NextResponse } from 'next/server'
import { createServerAdminClient } from '@/lib/supabase-server'
import { isSuperAdmin } from '@/utils/auth'

export async function POST(request: NextRequest) {
  try {
    const admin = await isSuperAdmin()
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { companyId, email, firstName, lastName, password } = body

    if (!companyId || !email || !firstName || !lastName || !password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    const adminClient = createServerAdminClient()

    // Créer l'utilisateur dans auth.users
    const { data: authUser, error: authError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirmer l'email
      user_metadata: {
        first_name: firstName,
        last_name: lastName,
        role: 'admin',
      },
    })

    if (authError || !authUser.user) {
      console.error('Error creating auth user:', authError)
      return NextResponse.json(
        { error: authError?.message || 'Error creating user' },
        { status: 500 }
      )
    }

    // Mettre à jour l'utilisateur dans la table users
    const { error: userError } = await adminClient
      .from('users')
      .update({
        first_name: firstName,
        last_name: lastName,
        role: 'admin',
        company_id: companyId,
        account_type: 'b2b2c',
      })
      .eq('id', authUser.user.id)

    if (userError) {
      console.error('Error updating user:', userError)
      // Nettoyer : supprimer l'utilisateur auth si la mise à jour échoue
      await adminClient.auth.admin.deleteUser(authUser.user.id)
      return NextResponse.json(
        { error: userError.message },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { success: true, userId: authUser.user.id },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Error in POST /api/companies/create-admin:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
