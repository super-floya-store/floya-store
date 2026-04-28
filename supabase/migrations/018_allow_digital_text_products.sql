ALTER TABLE products
  DROP CONSTRAINT IF EXISTS products_product_type_check;

ALTER TABLE products
  ADD CONSTRAINT products_product_type_check
  CHECK (product_type IN ('physical_simple', 'physical_variant', 'digital_account', 'digital_text'));

ALTER TABLE order_items
  DROP CONSTRAINT IF EXISTS order_items_product_type_check;

ALTER TABLE order_items
  ADD CONSTRAINT order_items_product_type_check
  CHECK (product_type IN ('physical_simple', 'physical_variant', 'digital_account', 'digital_text'));
