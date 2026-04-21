const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_KEY must be set');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function resetAdminPassword() {
    const newPassword = process.argv[2] || 'FloyaAdmin2024!';
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Check if admin exists
    const { data: existing, error: checkError } = await supabase
        .from('admin_users')
        .select('*')
        .eq('username', 'admin');

    if (checkError) {
        console.error('Error checking admin:', checkError);
        process.exit(1);
    }

    if (existing && existing.length > 0) {
        // Update existing admin
        const { error: updateError } = await supabase
            .from('admin_users')
            .update({ password_hash: hashedPassword })
            .eq('username', 'admin');

        if (updateError) {
            console.error('Error updating password:', updateError);
            process.exit(1);
        }
        console.log('✅ Admin password updated successfully');
    } else {
        // Create new admin
        const { error: insertError } = await supabase
            .from('admin_users')
            .insert({
                username: 'admin',
                password_hash: hashedPassword,
                role: 'admin',
                is_active: true
            });

        if (insertError) {
            console.error('Error creating admin:', insertError);
            process.exit(1);
        }
        console.log('✅ Admin user created successfully');
    }

    console.log('');
    console.log('╔════════════════════════════════════════════════════════╗');
    console.log('║  ADMIN LOGIN CREDENTIALS                               ║');
    console.log('╠════════════════════════════════════════════════════════╣');
    console.log('║  Username: admin                                       ║');
    console.log(`║  Password: ${newPassword.padEnd(36)}  ║`);
    console.log('╚════════════════════════════════════════════════════════╝');
}

resetAdminPassword().catch(err => {
    console.error('Error:', err);
    process.exit(1);
});
