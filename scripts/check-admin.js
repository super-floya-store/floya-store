const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://gfvzlcnvdfeommqmcxig.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmdnpsY252ZGZlb21tcW1jeGlnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjcxMTg5MiwiZXhwIjoyMDkyMjg3ODkyfQ.bCE7RVwGbttLPrsElkN4UBsR_FTH1RR-H_C7FhsimIU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAdmin() {
    const { data: admins, error } = await supabase
        .from('admin_users')
        .select('*');

    if (error) {
        console.error('Error:', error);
        return;
    }

    console.log('Admin users found:', admins.length);
    console.log('');

    admins.forEach((admin, i) => {
        console.log(`Admin ${i + 1}:`);
        console.log('  ID:', admin.id);
        console.log('  Username:', admin.username);
        console.log('  Role:', admin.role);
        console.log('  is_active:', admin.is_active);
        console.log('  Password hash (first 20 chars):', admin.password_hash?.substring(0, 20) + '...');
        console.log('');
    });
}

checkAdmin();
