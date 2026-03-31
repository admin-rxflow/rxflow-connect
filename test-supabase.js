import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  "https://qhmpqqemuwbhazsxbcib.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFobXBxcWVtdXdiaGF6c3hiY2liIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4MTU2NzYsImV4cCI6MjA5MDM5MTY3Nn0.IcpRFX9qd_ge7BuRShbJ3EWBvZ4immYcUO4ww3Bri8g"
);

async function test() {
  console.log('Testing connection to rx_tenants...');
  const { data: tenants, error: err1 } = await supabase.from('rx_tenants').select('id, name, email').limit(5);
  console.log('Tenants:', tenants, err1?.message);

  const { data: users, error: err2 } = await supabase.from('rx_tenant_users').select('*').limit(5);
  console.log('Tenant Users:', users, err2?.message);

  const { data: profiles, error: err3 } = await supabase.from('rx_profiles').select('*').limit(5);
  console.log('Profiles:', profiles, err3?.message);
}

test();
