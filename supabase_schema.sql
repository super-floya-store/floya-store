-- Floya Store Database Schema for Supabase

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Products table
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    price INTEGER NOT NULL,
    promo_price INTEGER,
    category TEXT NOT NULL,
    image TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id),
    product_name TEXT NOT NULL,
    product_price INTEGER NOT NULL,
    customer_name TEXT NOT NULL,
    customer_state TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    status TEXT DEFAULT 'جديد',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Insert default products
INSERT INTO products (name, description, price, promo_price, category, image) VALUES
('مزهرية خرسانية أنيقة', 'مزهرية يدوية الصنع من الخرسانة المصقولة، مثالية للزهور الطبيعية والاصطناعية.', 2500, 1800, 'ديكور', 'https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=400&h=400&fit=crop'),
('حامل شموع خرساني', 'حامل شموع بتصميم عصري من الخرسانة الناعمة، يضيف جوا دافئا وأنيقا لغرفتك.', 1200, NULL, 'ديكور', 'https://images.unsplash.com/photo-1603006905003-be475563bc59?w=400&h=400&fit=crop'),
('لوحة اسماء للأطفال', 'لوحة اسم مخصصة للطفل من الخرسانة الملونة، هدية مميزة لحفلات الميلاد.', 800, NULL, 'اطفال', 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=400&fit=crop'),
('طقم توزيعات خرسانية', 'طقم توزيعات متناسق يشمل صناديق صغيرة مع بطاقات مراسلة.', 3000, 2200, 'توزيعات', 'https://images.unsplash.com/photo-1513519245088-0e12902e35ca?w=400&h=400&fit=crop'),
('صندوق هدية فاخر', 'صندوق هدية خرساني فاخر مع بطاقة مخصصة، مناسب لهدايا الزفاف.', 3500, NULL, 'الهدايا', 'https://images.unsplash.com/photo-1512909006721-3d6018887383?w=400&h=400&fit=crop'),
('اصيص نباتات خرساني', 'اصيص بتصميم مينيمال من الخرسانة المتينة، مناسب للنباتات الداخلية.', 1800, 1400, 'ديكور', 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=400&h=400&fit=crop'),
('حصالة أطفال على شكل قلب', 'حصالة خرسانية بتصميم قلب لطيف، تعليم الطفل الادخار بهدية جميلة.', 600, NULL, 'اطفال', 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop'),
('طبق ديكور خرساني جديد', 'طبق ديكور خرساني مصقول يدويا، يمكن استخدامه كطبق حلويات.', 2000, NULL, 'جديد', 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=400&h=400&fit=crop'),
('مجموعة توزيعات زفاف', 'مجموعة توزيعات أنيقة ومتناسقة خاصة بالزفاف.', 4500, 3500, 'توزيعات', 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400&h=400&fit=crop'),
('مفتاح خرساني كهدية', 'قطعة ديكور على شكل مفتاح من الخرسانة، هدية رمزية مميزة.', 500, NULL, 'الهدايا', 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=400&h=400&fit=crop');

-- Enable RLS (Row Level Security) - but allow all for now since we handle auth in API
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access on products
CREATE POLICY "Allow public read on products" ON products
    FOR SELECT USING (true);

-- Create policies for admin operations (we'll handle in API)
CREATE POLICY "Allow all operations on products" ON products
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on orders" ON orders
    FOR ALL USING (true) WITH CHECK (true);
