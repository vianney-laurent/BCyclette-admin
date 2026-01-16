import { createServerClient } from '@/lib/supabase-server'

/**
 * Vérifie si l'utilisateur actuel est un super-admin
 * @returns true si super-admin, false sinon
 */
export async function isSuperAdmin(): Promise<boolean> {
  try {
    const supabase = await createServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      console.error('Auth error:', authError)
      return false
    }
    
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('super_admin, role')
      .eq('id', user.id)
      .single()
    
    if (userError) {
      console.error('Error fetching user data:', userError)
      return false
    }
    
    // PostgreSQL peut retourner un boolean ou une string selon la version
    // Vérifier les deux cas
    const superAdminValue = userData?.super_admin
    const isAdmin = superAdminValue === true || superAdminValue === 'true' || superAdminValue === 't'
    
    console.log('Super admin check:', { 
      userId: user.id, 
      super_admin: superAdminValue, 
      super_admin_type: typeof superAdminValue,
      role: userData?.role,
      isAdmin 
    })
    
    return isAdmin
  } catch (error) {
    console.error('Error checking super admin:', error)
    return false
  }
}

/**
 * Récupère l'utilisateur actuel avec ses informations
 */
export async function getCurrentUser() {
  try {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return null
    
    const { data: userData } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()
    
    return userData
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}
