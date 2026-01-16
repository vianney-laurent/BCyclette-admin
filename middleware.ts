import { createServerClient } from '@supabase/ssr'
import { createAdminClient } from '@/lib/supabase'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const pathname = request.nextUrl.pathname
  const isLoginPage = pathname === '/login'
  const isAdminRoute = pathname.startsWith('/companies') || 
                       pathname.startsWith('/app-config') ||
                       pathname.startsWith('/users') ||
                       pathname.startsWith('/stats')

  // Créer le client Supabase avec gestion des cookies
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // Rafraîchir la session
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Fonction helper pour vérifier le super-admin
  const checkSuperAdmin = async (userId: string): Promise<boolean> => {
    try {
      const adminClient = createAdminClient()
      const { data: userData, error: userError } = await adminClient
        .from('users')
        .select('super_admin')
        .eq('id', userId)
        .single()

      if (userError || !userData) {
        return false
      }

      return userData.super_admin === true || 
             userData.super_admin === 'true' || 
             userData.super_admin === 't'
    } catch (error) {
      return false
    }
  }

  // Si sur une route admin, vérifier l'authentification
  if (isAdminRoute) {
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }

    const isSuperAdmin = await checkSuperAdmin(user.id)
    
    if (!isSuperAdmin) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }

    return response
  }

  // Si sur /login et déjà connecté en tant que super-admin, rediriger vers /stats
  if (isLoginPage && user) {
    const isSuperAdmin = await checkSuperAdmin(user.id)
    
    if (isSuperAdmin) {
      const url = request.nextUrl.clone()
      url.pathname = '/stats'
      return NextResponse.redirect(url)
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
