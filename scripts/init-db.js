const db = require('../database');
const bcrypt = require('bcryptjs');

async function init() {
    console.log('Initializing database...');

    // Seed sample products if empty
    const productCount = await db.get('SELECT COUNT(*) as count FROM products');
    if (productCount.count === 0) {
        console.log('Seeding sample products...');

        const sampleProducts = [
            {
                id: 'prod_1',
                name: 'مزهرية خرسانية أنيقة',
                description: 'مزهرية خرسانية يدوية الصنع، مثالية لديكور المنزل والمكاتب. متوفرة بألوان متعددة.',
                price: 1500,
                promo_price: 1200,
                category: 'ديكور',
                image: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=400&h=400',
                stock: 10
            },
            {
                id: 'prod_2',
                name: 'حامل شموع خرساني',
                description: 'حامل شموع بتصميم عصري أنيق، مناسب لجميع المناسبات.',
                price: 800,
                promo_price: null,
                category: 'ديكور',
                image: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400&h=400',
                stock: 15
            },
            {
                id: 'prod_3',
                name: 'توزيعات أطفال - حيوانات خرسانية',
                description: 'مجموعة من الحيوانات الخرسانية الصغيرة، هدية مثالية للأطفال.',
                price: 300,
                promo_price: 250,
                category: 'اطفال',
                image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd7e4?w=400&h=400',
                stock: 50
            },
            {
                id: 'prod_4',
                name: 'وعاء نباتات خرساني',
                description: 'وعاء نباتات بأشكال هندسية عصرية، مناسب للنباتات الصغيرة.',
                price: 2200,
                promo_price: null,
                category: 'جديد',
                image: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=400&h=400',
                stock: 8
            },
            {
                id: 'prod_5',
                name: 'ساعة خرسانية مودرن',
                description: 'ساعة حائط بتصميم صناعي عصري، تضيف لمسة فنية لمنزلك.',
                price: 3500,
                promo_price: 2999,
                category: 'الهدايا',
                image: 'https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?w=400&h=400',
                stock: 5
            },
            {
                id: 'prod_6',
                name: 'منظم مكتب خرساني',
                description: 'منظم مكتب متكامل لحفظ الأقلام والأدوات المكتبية.',
                price: 1800,
                promo_price: null,
                category: 'توزيعات',
                image: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=400&h=400',
                stock: 12
            }
        ];

        for (const p of sampleProducts) {
            await db.run(
                `INSERT INTO products (id, name, description, price, promo_price, category, image, stock)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [p.id, p.name, p.description, p.price, p.promo_price, p.category, p.image, p.stock]
            );
        }
        console.log(`${sampleProducts.length} products seeded`);
    }

    // Ensure admin exists
    const adminCount = await db.get('SELECT COUNT(*) as count FROM admin_users');
    if (adminCount.count === 0) {
        console.log('Creating default admin...');
        const hashedPassword = await bcrypt.hash('admin123', 12);
        await db.run(
            'INSERT INTO admin_users (username, password_hash, role) VALUES (?, ?, ?)',
            ['admin', hashedPassword, 'admin']
        );
        console.log('Default admin created: username=admin, password=admin123');
    }

    console.log('Database initialization complete!');
    process.exit(0);
}

init().catch(err => {
    console.error('Initialization error:', err);
    process.exit(1);
});
