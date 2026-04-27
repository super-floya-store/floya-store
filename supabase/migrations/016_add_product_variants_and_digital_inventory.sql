ALTER TABLE products
  ADD COLUMN IF NOT EXISTS product_type VARCHAR(30) NOT NULL DEFAULT 'physical_simple';

ALTER TABLE products
  DROP CONSTRAINT IF EXISTS products_product_type_check;

ALTER TABLE products
  ADD CONSTRAINT products_product_type_check
  CHECK (product_type IN ('physical_simple', 'physical_variant', 'digital_account'));

CREATE TABLE IF NOT EXISTS product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  sku VARCHAR(120),
  size VARCHAR(50),
  color VARCHAR(80),
  name_ar VARCHAR(200),
  name_en VARCHAR(200),
  price_override DECIMAL(10, 2),
  promo_price_override DECIMAL(10, 2),
  stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
  low_stock_threshold INTEGER NOT NULL DEFAULT 3 CHECK (low_stock_threshold >= 0),
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT product_variants_price_check CHECK (price_override IS NULL OR price_override >= 0),
  CONSTRAINT product_variants_promo_check CHECK (
    promo_price_override IS NULL
    OR promo_price_override >= 0
    OR (price_override IS NOT NULL AND promo_price_override < price_override)
  )
);

CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_active ON product_variants(is_active);

DROP TRIGGER IF EXISTS trg_product_variants_updated_at ON product_variants;
CREATE TRIGGER trg_product_variants_updated_at BEFORE UPDATE ON product_variants FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TABLE IF NOT EXISTS digital_inventory_units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,
  title VARCHAR(200),
  payload TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'available',
  order_item_id UUID,
  reserved_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT digital_inventory_units_status_check CHECK (status IN ('available', 'reserved', 'delivered', 'revoked'))
);

CREATE INDEX IF NOT EXISTS idx_digital_inventory_units_product_id ON digital_inventory_units(product_id);
CREATE INDEX IF NOT EXISTS idx_digital_inventory_units_status ON digital_inventory_units(status);
CREATE INDEX IF NOT EXISTS idx_digital_inventory_units_order_item_id ON digital_inventory_units(order_item_id);

DROP TRIGGER IF EXISTS trg_digital_inventory_units_updated_at ON digital_inventory_units;
CREATE TRIGGER trg_digital_inventory_units_updated_at BEFORE UPDATE ON digital_inventory_units FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE order_items
  ADD COLUMN IF NOT EXISTS variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS variant_size VARCHAR(50),
  ADD COLUMN IF NOT EXISTS variant_color VARCHAR(80),
  ADD COLUMN IF NOT EXISTS variant_label VARCHAR(200),
  ADD COLUMN IF NOT EXISTS product_type VARCHAR(30) NOT NULL DEFAULT 'physical_simple',
  ADD COLUMN IF NOT EXISTS fulfillment_status VARCHAR(20) NOT NULL DEFAULT 'pending';

ALTER TABLE order_items
  DROP CONSTRAINT IF EXISTS order_items_product_type_check;

ALTER TABLE order_items
  ADD CONSTRAINT order_items_product_type_check
  CHECK (product_type IN ('physical_simple', 'physical_variant', 'digital_account'));

ALTER TABLE order_items
  DROP CONSTRAINT IF EXISTS order_items_fulfillment_status_check;

ALTER TABLE order_items
  ADD CONSTRAINT order_items_fulfillment_status_check
  CHECK (fulfillment_status IN ('pending', 'reserved', 'delivered', 'released'));
