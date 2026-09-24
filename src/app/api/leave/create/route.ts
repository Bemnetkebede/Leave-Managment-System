import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { leave_type, start_date, end_date, reason } = await request.json();

    if (!leave_type || !start_date || !end_date || !reason) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const serviceClient = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 1. Overlap Check (Server-side)
    const { data: existing, error: fetchError } = await serviceClient
      .from('leave_requests')
      .select('id')
      .eq('user_id', user.id)
      .in('status', ['pending', 'approved'])
      .lte('start_date', end_date)
      .gte('end_date', start_date);

    if (fetchError) throw fetchError;

    if (existing && existing.length > 0) {
      return NextResponse.json({ 
        error: 'You already have a pending or approved leave request for these dates.' 
      }, { status: 400 });
    }

    // 2. Insert new leave request
    const { data, error } = await serviceClient
      .from('leave_requests')
      .insert({
        user_id: user.id,
        leave_type,
        start_date,
        end_date,
        reason,
        status: 'pending'
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // 3. Notify All Managers/Admins
    try {
      const { data: profile } = await serviceClient
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();

      const employeeName = profile?.full_name || user.email || 'An employee';

      const { data: managers } = await serviceClient
        .from('profiles')
        .select('id')
        .in('role', ['manager', 'admin'])
        .neq('id', user.id);

      if (managers && managers.length > 0) {
        const notifications = managers.map((m: any) => ({
          user_id: m.id,
          title: 'New Leave Request',
          message: `${employeeName} submitted a leave request from ${start_date} to ${end_date}.`,
          type: 'leave_request',
          related_request_id: data.id,
        }));

        await serviceClient.from('notifications').insert(notifications);
      }
    } catch (notifErr) {
      console.warn('Failed to send manager notifications:', notifErr);
    }

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error: any) {
    console.error('API Error /api/leave/create:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
