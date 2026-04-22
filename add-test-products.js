// Script to add test products to Supabase
const { createClient } = require('@supabase/supabase-js');

// Your Supabase credentials
const SUPABASE_URL = 'https://gfvzlcnvdfeommqmcxig.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmdnpsY252ZGZlb21tcW1jeGlnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjcxMTg5MiwiZXhwIjoyMDkyMjg3ODkyfQ.bCE7RVwGbttLPrsElkN4UBsR_FTH1RR-H_C7FhsimIU';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Test products to add
const products = [
    {
        id: 'prod_' + Date.now() + '_1',
        name: 'هاتف ذكي Pro Max',
        description: 'هاتف ذكي متطور مع شاشة 6.7 بوصة وكاميرا 108MP',
        price: 89999,
        promo_price: 79999,
        category: 'electronics',
        image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500',
        stock: 50,
        is_active: true
    },
    {
        id: 'prod_' + Date.now() + '_2',
        name: 'سماعات بلوتوث لاسلكية',
        description: 'سماعات عالية الجودة مع عزل ضوضاء وبطارية تدوم 30 ساعة',
        price: 15999,
        promo_price: 12999,
        category: 'electronics',
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
        stock: 100,
        is_active: true
    },
    {
        id: 'prod_' + Date.now() + '_3',
        name: 'ساعة ذكية رياضية',
        description: 'ساعة ذكية مع تتبع اللياقة البدنية ومقاومة للماء',
        price: 29999,
        promo_price: 24999,
        category: 'electronics',
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500',
        stock: 75,
        is_active: true
    },
    {
        id: 'prod_' + Date.now() + '_4',
        name: 'حقيبة ظهر عصرية',
        description: 'حقيبة ظهر أنيقة وعملية مناسبة للعمل والسفر',
        price: 8999,
        promo_price: 6999,
        category: 'accessories',
        image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500',
        stock: 200,
        is_active: true
    },
    {
        id: 'prod_' + Date.now() + '_5',
        name: 'نظارات شمسية كلاسيك',
        description: 'نظارات شمسية بأنيقة مع حماية UV400',
        price: 5999,
        promo_price: 4499,
        category: 'accessories',
        image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500',
        stock: 150,
        is_active: true
    }
];

async function addProducts() {
    console.log('Adding test products to Supabase...\n');

    for (const product of products) {
        const { data, error } = await supabase
            .from('products')
            .insert(product)
            .select();

        if (error) {
            console.error(`Error adding ${product.name}:`, error.message);
        } else {
            console.log(`✓ Added: ${product.name} - ${product.price} د.ج`);
        }
    }

    console.log('\nDone! Check your store at https://floya-store-nine.vercel.app/');
}

addProducts();
