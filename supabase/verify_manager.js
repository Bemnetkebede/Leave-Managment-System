const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Missing Supabase environment variables in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifySetup() {
  console.log('🔍 Diagnosing Manager System Setup...\n');

  // 1. Fetch All Profiles
  const { data: profiles, error: profileError } = await supabase
    .from('profiles')
    .select('id, email, full_name, role, manager_id');

  if (profileError) {
    console.error('❌ Error fetching profiles:', profileError.message);
    return;
  }

  console.log('--- Profiles & Roles ---');
  profiles.forEach(p => {
    const roleIcon = p.role === 'manager' ? '👔' : p.role === 'admin' ? '🛡️' : '👤';
    console.log(`${roleIcon} ${p.full_name || 'No Name'} (${p.email})`);
    console.log(`   ID: ${p.id}`);
    console.log(`   Role: ${p.role}`);
    console.log(`   Managed By ID: ${p.manager_id || 'None'}`);
    console.log('------------------------');
  });

  // 2. Identify Managers and their Teams
  const managers = profiles.filter(p => p.role === 'manager' || p.role === 'admin');
  
  if (managers.length === 0) {
    console.log('\n⚠️ WARNING: No users have been assigned the "manager" or "admin" role yet.');
  } else {
    console.log('\n--- Team Structures ---');
    managers.forEach(m => {
      const team = profiles.filter(p => p.manager_id === m.id);
      console.log(`👔 Manager: ${m.full_name} (${m.email})`);
      if (team.length > 0) {
        console.log(`   Team Members (${team.length}):`);
        team.forEach(tm => console.log(`     - 👤 ${tm.full_name} (${tm.email})`));
      } else {
        console.log('   ⚠️ Team: No employees are assigned to this manager yet.');
      }
      console.log('');
    });
  }

  // 3. Check Pending Requests
  const { data: requests, error: reqError } = await supabase
    .from('leave_requests')
    .select('id, user_id, status')
    .eq('status', 'pending');

  if (reqError) {
    console.error('❌ Error fetching requests:', reqError.message);
  } else {
    console.log(`--- Leave Requests ---`);
    console.log(`📥 Total Pending Requests: ${requests.length}`);
    if (requests.length > 0) {
        requests.forEach(r => {
            const requester = profiles.find(p => p.id === r.user_id);
            console.log(`   - Request from: ${requester?.full_name || 'Unknown'} (Status: ${r.status})`);
        });
    }
  }

  console.log('\n💡 Tip: To see the "Approvals" dashboard, you must log in as one of the Managers listed above.');
}

verifySetup();
