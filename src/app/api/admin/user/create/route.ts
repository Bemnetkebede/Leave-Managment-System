import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  try {
    const supabase = createClient();
    const { data: { user: currentUser }, error: authError } = await supabase.auth.getUser();

    if (authError || !currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify Admin status
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', currentUser.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { email, fullName, role, department } = await request.json();

    if (!email || !fullName) {
      return NextResponse.json({ error: 'Missing details' }, { status: 400 });
    }

    const serviceClient = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // 1. Create the Auth User (Manual creation so we can set password or invite)
    // We'll use invite so they can set their own password
    const { data: authData, error: authInviteError } = await serviceClient.auth.admin.inviteUserByEmail(email, {
      data: { full_name: fullName }
    });

    if (authInviteError) throw authInviteError;

    const newUserId = authData.user.id;

    // 2. Create the Profile
    const { error: profileError } = await serviceClient
      .from('profiles')
      .insert({
        id: newUserId,
        email,
        full_name: fullName,
        role: role || 'employee',
        user_dpt: department || 'General'
      });

    if (profileError) throw profileError;

    // 3. Initialize Balance (21 days by default)
    await serviceClient.from('leave_balances').insert({
      user_id: newUserId,
      year: new Date().getFullYear(),
      total_days: 21,
      used_days: 0,
      balance: 21
    });

    return NextResponse.json({ success: true, user: authData.user });
  } catch (err: any) {
    console.error('Admin create user error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
