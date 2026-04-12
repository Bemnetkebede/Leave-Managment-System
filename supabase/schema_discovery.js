
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function discover() {
  console.log('--- Probing Profiles ---');
  const { data: profiles, error: pError } = await supabase.from('profiles').select('*').limit(1);
  if (pError) console.error('Profiles Error:', pError.message);
  else console.log('Profiles Columns:', Object.keys(profiles[0] || {}));

  console.log('\n--- Probing Leave Balances ---');
  // Attempt a dummy insert to see missing columns error
  const { error: bError } = await supabase.from('leave_balances').insert({ user_id: '00000000-0000-0000-0000-000000000000' });
  if (bError) {
    console.log('Leave Balances Error Code:', bError.code);
    console.log('Leave Balances Error Message:', bError.message);
    console.log('Leave Balances Error Details:', bError.details);
  } else {
    console.log('Leave Balances insert worked (unexpectedly)!');
  }

  console.log('\n--- Probing Leave Requests ---');
  const { error: rError } = await supabase.from('leave_requests').insert({ user_id: '00000000-0000-0000-0000-000000000000' });
  if (rError) {
    console.log('Leave Requests Error Message:', rError.message);
  }
}

discover();
