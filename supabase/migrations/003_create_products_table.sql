CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_ar VARCHAR(200) NOT NULL,
  name_en VARCHAR(200) NOT NULL,
  slug VARCHAR(200) UNIQUE NOT NULL,
  description_ar TEXT,
  description_en TEXT,
  price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
  promo_price DECIMAL(10, 2) CHECK (promo_price >= 0 AND promo_price < price),
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  images TEXT[] DEFAULT '{}',
  primary_image_index INTEGER DEFAULT 0,
  stock_quantity INTEGER DEFAULT 0 CHECK (stock_quantity >= 0),
  is_published BOOLEAN NOT NULL DEFAULT true,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  weight DECIMAL(8, 2),
  tags TEXT[] DEFAULT '{}',
  seo_title VARCHAR(60),
  seo_description VARCHAR(160),
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_published ON products(is_published);
CREATE INDEX idx_products_featured ON products(is_featured);
CREATE INDEX idx_products_created ON products(created_at DESC);
CREATE INDEX idx_products_price ON products(price);
CREATE INDEX idx_products_stock ON products(stock_quantity);
CREATE INDEX idx_products_name_ar ON products USING gin(to_tsvector('arabic', name_ar));
CREATE INDEX idx_products_name_en ON products USING gin(to_tsvector('english', name_en));
