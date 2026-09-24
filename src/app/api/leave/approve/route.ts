import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';

export async function PATCH(request: Request) {
  try {
    // Step 1: Verify the caller is authenticated (uses session cookie)
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Step 2: Verify the caller has manager/admin role
    const { data: profile, error: profileError } = await (supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single() as any);

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const role = (profile as any).role as string;
    if (role !== 'manager' && role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: Requires manager or admin role' }, { status: 403 });
    }

    // Step 3: Parse the request body
    const body = await request.json();
    const { request_id, status, manager_note } = body;

    if (!request_id || !status) {
      return NextResponse.json({ error: 'Missing request_id or status' }, { status: 400 });
    }

    if (!['approved', 'rejected'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    // Step 4: Use service role client to bypass RLS for the update
    const serviceClient = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data, error } = await serviceClient
      .from('leave_requests')
      .update({ status, manager_note: manager_note ?? null })
      .eq('id', request_id)
      .select()
      .single();

    if (error) {
      console.error('Supabase update error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Step 5: If approved, deduct from leave_balances
    if (status === 'approved') {
      try {
        const { data: requestData } = await serviceClient
          .from('leave_requests')
          .select('user_id, days, start_date')
          .eq('id', request_id)
          .single();

        if (requestData) {
          const year = new Date(requestData.start_date).getFullYear();
          const daysToDeduct = requestData.days || 1;

          // Fetch current balance
          const { data: balanceData } = await serviceClient
            .from('leave_balances')
            .select('used_days, balance, total_days')
            .eq('user_id', requestData.user_id)
            .eq('year', year)
            .single();

          if (balanceData) {
            const newUsed = (balanceData.used_days || 0) + daysToDeduct;
            const newBalance = (balanceData.total_days || 0) - newUsed;

            await serviceClient
              .from('leave_balances')
              .update({ 
                used_days: newUsed,
                balance: newBalance,
                Balance: newBalance // Supporting both case variations if they exist
              } as any)
              .eq('user_id', requestData.user_id)
              .eq('year', year);
          }
        }
      } catch (balErr) {
        console.warn('Failed to update leave balance:', balErr);
      }
    }

    // Step 6: Notify the employee about the decision
    try {
      const { data: updatedRequest } = await serviceClient
        .from('leave_requests')
        .select('user_id, leave_type, start_date')
        .eq('id', request_id)
        .single();

      if (updatedRequest) {
        await serviceClient.from('notifications').insert({
          user_id: updatedRequest.user_id,
          title: `Leave Request ${status.charAt(0).toUpperCase() + status.slice(1)}`,
          message: `Your ${updatedRequest.leave_type} leave request for ${updatedRequest.start_date} has been ${status}. ${manager_note ? `Note: ${manager_note}` : ''}`,
          type: status === 'approved' ? 'leave_approved' : 'leave_rejected',
          related_request_id: request_id,
        });
      }
    } catch (notifErr) {
      console.warn('Failed to send employee notification:', notifErr);
    }

    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
