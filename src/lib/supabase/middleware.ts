import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const url = request.nextUrl.clone()
  const path = url.pathname

  // Public paths that don't require authentication or onboarding
  const isPublicPath = path.startsWith('/signin') || 
                       path.startsWith('/signup') || 
                       path.startsWith('/auth') ||
                       path === '/'

  if (user) {
    // If user is logged in, check if they have a department
    const { data: profile } = await supabase
      .from('profiles')
      .select('user_dpt')
      .eq('id', user.id)
      .single()

    const hasDepartment = !!profile?.user_dpt

    // If no department and not on onboarding page, redirect to onboarding
    if (!hasDepartment && path !== '/onboarding' && !isPublicPath) {
      url.pathname = '/onboarding'
      return NextResponse.redirect(url)
    }

    // If they have a department and are trying to go to onboarding, redirect to dashboard
    if (hasDepartment && path === '/onboarding') {
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }

    // If they are on a public path (like signin) but are logged in, redirect to dashboard/onboarding
    if (isPublicPath && path !== '/') {
      url.pathname = hasDepartment ? '/dashboard' : '/onboarding'
      return NextResponse.redirect(url)
    }
  } else {
    // If user is NOT logged in and trying to access a protected path, redirect to signin
    if (!isPublicPath && path !== '/onboarding') {
      url.pathname = '/signin'
      return NextResponse.redirect(url)
    }
  }

  return response
}

