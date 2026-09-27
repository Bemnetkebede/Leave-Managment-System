const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkDpt() {
  const { data: users } = await supabase.from('profiles').select('id, full_name, user_dpt');
  users.forEach(u => console.log(`"${u.full_name}" -> dpt: "${u.user_dpt}" (length: ${u.user_dpt?.length})`));
}
checkDpt();
