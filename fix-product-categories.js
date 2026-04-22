// Script to fix product categories in Supabase
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://gfvzlcnvdfeommqmcxig.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmdnpsY252ZGZlb21tcW1jeGlnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjcxMTg5MiwiZXhwIjoyMDkyMjg3ODkyfQ.bCE7RVwGbttLPrsElkN4UBsR_FTH1RR-H_C7FhsimIU';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function fixCategories() {
    console.log('Fixing product categories...\n');

    // Update electronics -> جديد
    const { data: eData, error: eError } = await supabase
        .from('products')
        .update({ category: 'جديد' })
        .eq('category', 'electronics');

    if (eError) console.error('Error updating electronics:', eError.message);
    else console.log(`✓ Updated ${eData?.length || 'electronics'} products to 'جديد'`);

    // Update accessories -> ديكور
    const { data: aData, error: aError } = await supabase
        .from('products')
        .update({ category: 'ديكور' })
        .eq('category', 'accessories');

    if (aError) console.error('Error updating accessories:', aError.message);
    else console.log(`✓ Updated ${aData?.length || 'accessories'} products to 'ديكور'`);

    console.log('\nDone! Refresh your store at https://floya-store-nine.vercel.app/');
}

fixCategories();
