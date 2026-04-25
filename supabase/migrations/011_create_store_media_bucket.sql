INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'store-media',
  'store-media',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public can view store media"
ON storage.objects FOR SELECT
USING (bucket_id = 'store-media');

CREATE POLICY "Authenticated users can upload store media"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'store-media');

CREATE POLICY "Authenticated users can update store media"
ON storage.objects FOR UPDATE
USING (bucket_id = 'store-media');

CREATE POLICY "Authenticated users can delete store media"
ON storage.objects FOR DELETE
USING (bucket_id = 'store-media');
