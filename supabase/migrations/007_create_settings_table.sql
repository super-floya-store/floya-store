CREATE TABLE settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(100) UNIQUE NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  updated_by UUID REFERENCES users(id),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO settings (key, value, description) VALUES
  ('store_name', '{"ar": "فلويا ستور", "en": "Floya Store"}', 'Store display name'),
  ('store_description', '{"ar": "", "en": ""}', 'Store description'),
  ('store_phone', '"0555123456"', 'Contact phone number'),
  ('store_whatsapp', '"213555123456"', 'WhatsApp number with country code'),
  ('store_email', '"contact@floya.dz"', 'Contact email'),
  ('store_address', '{"ar": "", "en": ""}', 'Store address'),
  ('delivery_fees', '{}', 'JSON object mapping wilaya codes to delivery fees'),
  ('free_delivery_threshold', '"5000"', 'Free delivery above this amount in DZD'),
  ('currency', '"DZD"', 'Store currency code'),
  ('logo_url', '""', 'Store logo URL'),
  ('hero_images', '[]', 'Array of hero banner image URLs'),
  ('social_links', '{}', 'Social media links JSON'),
  ('seo_defaults', '{}', 'Default SEO settings'),
  ('email_notifications', '{"new_order": true, "status_change": true}', 'Email notification preferences');
