import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = createClient();
    
    // Authenticate the user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Explicitly restrict to 'admin' role
    const { data: profile, error: profileError } = await (supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single() as any);

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    if ((profile as any).role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: Administrator access required' }, { status: 403 });
    }

    // Assuming policies/system settings tie into retrieving public holidays and rules
    const { data: holidays, error: holidaysError } = await supabase
      .from('holidays')
      .select('*')
      .order('date', { ascending: true });

    if (holidaysError) {
      return NextResponse.json({ error: holidaysError.message }, { status: 400 });
    }

    // Returning aggregated policies/settings
    const systemPolicies = {
      globalLeaveLimit: 20,
      carryOverAllowed: false,
      workflow: 'manager_approval_only',
      holidays: holidays || []
    };

    return NextResponse.json({ success: true, data: systemPolicies }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
 
