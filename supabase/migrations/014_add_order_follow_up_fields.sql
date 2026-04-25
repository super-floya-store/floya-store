ALTER TABLE orders
ADD COLUMN IF NOT EXISTS estimated_delivery_days INTEGER,
ADD COLUMN IF NOT EXISTS estimated_delivery_date DATE,
ADD COLUMN IF NOT EXISTS follow_up_message TEXT;

COMMENT ON COLUMN orders.estimated_delivery_days IS 'Estimated delivery window in days after payment confirmation';
COMMENT ON COLUMN orders.estimated_delivery_date IS 'Customer-facing estimated delivery date';
COMMENT ON COLUMN orders.follow_up_message IS 'Public follow-up message shown to the customer';
