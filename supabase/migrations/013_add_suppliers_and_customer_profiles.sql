CREATE TABLE IF NOT EXISTS suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(120) NOT NULL,
  contact_name VARCHAR(120),
  phone VARCHAR(30),
  email VARCHAR(120),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_suppliers_name ON suppliers(name);

DROP TRIGGER IF EXISTS trg_suppliers_updated_at ON suppliers;
CREATE TRIGGER trg_suppliers_updated_at BEFORE UPDATE ON suppliers FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE products
ADD COLUMN IF NOT EXISTS supplier_id UUID REFERENCES suppliers(id),
ADD COLUMN IF NOT EXISTS low_stock_threshold INTEGER DEFAULT 3;

CREATE TABLE IF NOT EXISTS customer_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone VARCHAR(20) UNIQUE NOT NULL,
  full_name VARCHAR(120),
  notes TEXT,
  is_blacklisted BOOLEAN NOT NULL DEFAULT false,
  is_vip BOOLEAN NOT NULL DEFAULT false,
  fraud_flags INTEGER NOT NULL DEFAULT 0,
  last_order_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_customer_profiles_phone ON customer_profiles(phone);
CREATE INDEX IF NOT EXISTS idx_customer_profiles_blacklisted ON customer_profiles(is_blacklisted);
CREATE INDEX IF NOT EXISTS idx_customer_profiles_vip ON customer_profiles(is_vip);

DROP TRIGGER IF EXISTS trg_customer_profiles_updated_at ON customer_profiles;
CREATE TRIGGER trg_customer_profiles_updated_at BEFORE UPDATE ON customer_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
