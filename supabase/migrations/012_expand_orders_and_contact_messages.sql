ALTER TABLE orders
ADD COLUMN IF NOT EXISTS payment_transaction_id VARCHAR(120),
ADD COLUMN IF NOT EXISTS payment_receipt_url TEXT,
ADD COLUMN IF NOT EXISTS payment_submitted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS payment_reviewed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS payment_review_notes TEXT;

ALTER TABLE orders
DROP CONSTRAINT IF EXISTS orders_payment_status_check;

ALTER TABLE orders
ADD CONSTRAINT orders_payment_status_check
CHECK (payment_status IN ('pending', 'submitted', 'paid', 'rejected', 'failed', 'refunded'));

CREATE TABLE IF NOT EXISTS contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name VARCHAR(100) NOT NULL,
  customer_email VARCHAR(100),
  customer_phone VARCHAR(20),
  subject VARCHAR(200),
  message TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'resolved', 'archived')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contact_messages_status ON contact_messages(status);
CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON contact_messages(created_at DESC);

DROP TRIGGER IF EXISTS trg_contact_messages_updated_at ON contact_messages;
CREATE TRIGGER trg_contact_messages_updated_at BEFORE UPDATE ON contact_messages FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE categories
ADD COLUMN IF NOT EXISTS seo_title VARCHAR(60),
ADD COLUMN IF NOT EXISTS seo_description VARCHAR(160);

INSERT INTO settings (key, value, description)
VALUES (
  'baridimob_rip',
  '"00799999004419717033"',
  'BaridiMob CCP/RIP used for payment instructions'
)
ON CONFLICT (key) DO NOTHING;
