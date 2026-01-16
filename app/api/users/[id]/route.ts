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
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params
    const body = await request.json()
    const { 
      email, 
      first_name, 
      last_name, 
      role, 
      super_admin,
      account_type,
      company_id 
    } = body

    if (!email || !role || !account_type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const adminClient = createServerAdminClient()

    // Mettre à jour l'utilisateur dans la table users
    const { data, error } = await adminClient
      .from('users')
      .update({
        email,
        first_name: first_name || null,
        last_name: last_name || null,
        role,
        super_admin: super_admin || false,
        account_type,
        company_id: company_id || null,
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating user:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    // Mettre à jour l'email dans auth.users si nécessaire
    if (email) {
      const { data: authUser, error: authError } = await adminClient
        .from('users')
        .select('email')
        .eq('id', id)
        .single()

      if (!authError && authUser?.email !== email) {
        // Note: La mise à jour de l'email dans auth.users nécessite généralement
        // une confirmation par email. On peut laisser cela de côté pour l'instant
        // ou utiliser auth.admin.updateUserById() si nécessaire
        console.log('Email update in auth.users would require email confirmation')
      }
    }

    return NextResponse.json({ data }, { status: 200 })
  } catch (error: any) {
    console.error('Error in PUT /api/users/[id]:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await isSuperAdmin()
    if (!admin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params

    const adminClient = createServerAdminClient()

    // Vérifier que l'utilisateur existe
    const { data: userData, error: userError } = await adminClient
      .from('users')
      .select('id, super_admin')
      .eq('id', id)
      .single()

    if (userError || !userData) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Empêcher la suppression d'un super-admin (sécurité)
    if (userData.super_admin) {
      return NextResponse.json(
        { error: 'Cannot delete super-admin user' },
        { status: 403 }
      )
    }

    // Supprimer l'utilisateur de auth.users (cela supprimera automatiquement l'enregistrement dans users grâce à ON DELETE CASCADE)
    const { error: deleteError } = await adminClient.auth.admin.deleteUser(id)

    if (deleteError) {
      console.error('Error deleting user from auth:', deleteError)
      return NextResponse.json(
        { error: deleteError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error: any) {
    console.error('Error in DELETE /api/users/[id]:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
