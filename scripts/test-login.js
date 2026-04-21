const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

const supabaseUrl = 'https://gfvzlcnvdfeommqmcxig.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmdnpsY252ZGZlb21tcW1jeGlnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjcxMTg5MiwiZXhwIjoyMDkyMjg3ODkyfQ.bCE7RVwGbttLPrsElkN4UBsR_FTH1RR-H_C7FhsimIU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testLogin() {
    const username = 'admin';
    const password = 'FloyaAdmin2024!';

    console.log('Testing login...');
    console.log('Username:', username);
    console.log('Password:', password);
    console.log('');

    const { data: users, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('username', username)
        .eq('is_active', true);

    if (error) {
        console.error('Database error:', error);
        return;
    }

    if (!users || users.length === 0) {
        console.log('No user found with username:', username);
        return;
    }

    const user = users[0];
    console.log('User found:');
    console.log('  ID:', user.id);
    console.log('  Username:', user.username);
    console.log('  is_active:', user.is_active);
    console.log('');

    console.log('Testing password comparison...');
    const isValid = await bcrypt.compare(password, user.password_hash);
    console.log('Password valid:', isValid);

    if (!isValid) {
        console.log('');
        console.log('Trying to rehash password...');
        const newHash = await bcrypt.hash(password, 12);
        console.log('New hash:', newHash);
        console.log('Hash matches:', newHash === user.password_hash);
    }
}

testLogin().catch(console.error);
