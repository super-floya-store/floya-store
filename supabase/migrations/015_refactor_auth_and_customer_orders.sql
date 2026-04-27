ALTER TABLE users
  ADD COLUMN IF NOT EXISTS is_vip BOOLEAN NOT NULL DEFAULT false;

UPDATE users SET role = 'admin' WHERE role IN ('admin', 'super_admin');
UPDATE users SET role = 'customer' WHERE role = 'viewer';

ALTER TABLE users
  DROP CONSTRAINT IF EXISTS users_role_check;

ALTER TABLE users
  ADD CONSTRAINT users_role_check
  CHECK (role IN ('admin', 'customer'));

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS refund_status VARCHAR(30) NOT NULL DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS vip_discount_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS priority_fulfillment BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS receipt_issued_at TIMESTAMPTZ;

ALTER TABLE orders
  DROP CONSTRAINT IF EXISTS orders_refund_status_check;

ALTER TABLE orders
  ADD CONSTRAINT orders_refund_status_check
  CHECK (refund_status IN ('none', 'requested', 'approved', 'rejected', 'refunded'));

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_refund_status ON orders(refund_status);

ALTER TABLE customer_profiles
  ADD COLUMN IF NOT EXISTS user_id UUID UNIQUE REFERENCES users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS email VARCHAR(100);

CREATE INDEX IF NOT EXISTS idx_customer_profiles_user_id ON customer_profiles(user_id);
