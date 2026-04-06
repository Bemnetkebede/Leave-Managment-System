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

    /* 
     * Security:
     * We don't manually filter by employee/manager logic here because
     * Supabase RLS policies implicitly return only the allowed records!
     * 1. Employees see own records.
     * 2. Managers see own + team's records.
     */
    const { data, error } = await supabase
      .from('leave_requests')
      .select(`
        *,
        profiles ( full_name, email )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
