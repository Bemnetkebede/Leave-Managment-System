import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function PATCH(request: Request) {
  try {
    const supabase = createClient();
    
    // Authenticate the user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Role verification
    const { data: profile, error: profileError } = await (supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single() as any);

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Enforce 403 Forbidden for insufficient roles
    const role = (profile as any).role as string;
    if (role !== 'manager' && role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: Requires manager or admin role' }, { status: 403 });
    }

    // Parse specific payload required for patch
    const body = await request.json();
    const { request_id, status, manager_note } = body;

    if (!request_id || !status) {
      return NextResponse.json({ error: 'Missing request_id or status' }, { status: 400 });
    }

    if (!['approved', 'rejected'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status. Must be approved or rejected.' }, { status: 400 });
    }

    // Update operation
    const { data, error } = await (supabase
      .from('leave_requests')
      .update({
        status,
        manager_note
      } as any)
      .eq('id', request_id)
      .select()
      .single() as any);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
