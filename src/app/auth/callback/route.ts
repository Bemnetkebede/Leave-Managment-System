import { createClient } from '@/lib/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // if "next" is in search params, use it as the redirect URL
  const next = searchParams.get('next') ?? '/dashboard'

  console.log('Auth Callback: Processing request', { code: code ? 'Present' : 'Missing', next })

  if (code) {
    const supabase = createClient()
    const { data: exchangeData, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!exchangeError && exchangeData.user && exchangeData.session) {
      const user = exchangeData.user;
      const fullName = user.user_metadata?.full_name || user.user_metadata?.name || user.user_metadata?.given_name || user.email?.split('@')[0] || 'User';
      
      console.log('Auth Callback: Syncing profile for user', { id: user.id, fullName })

      // Manual Profile Sync (Safety Net)
      // Using direct client with session token to bypass potential cookie lagging in this specific request
      const authenticatedSupabase = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          global: {
            headers: {
              Authorization: `Bearer ${exchangeData.session.access_token}`
            }
          }
        }
      )

      await authenticatedSupabase
        .from('profiles')
        .upsert({
          id: user.id,
          email: user.email!,
          full_name: fullName,
          role: 'employee',
        }, { onConflict: 'id' });

      return NextResponse.redirect(`${origin}${next}`)
    }
    
    console.error('Auth Callback: Exchange error', exchangeError)
    return NextResponse.redirect(`${origin}/login?error=auth_exchange_failed&error_description=${encodeURIComponent(exchangeError?.message || 'Exchange failed')}`)
  }

  // return the user to login with an error message
  return NextResponse.redirect(`${origin}/login?error=auth-code-error`)
}
