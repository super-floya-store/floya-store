WITH category_seed AS (
  SELECT *
  FROM (
    VALUES
      ('fragrances', 'عطور', 'Fragrances', 'عطور يومية وفاخرة للاختبار داخل المتجر.', 'Premium perfumes and daily mists for storefront testing.', '/demo-catalog/fragrances.svg', 10),
      ('skincare', 'العناية بالبشرة', 'Skincare', 'مرطبات وسيرومات وغسولات بتقديم تجريبي راقٍ.', 'Hydration, serums, and cleansers for premium storefront demos.', '/demo-catalog/skincare.svg', 20),
      ('haircare', 'العناية بالشعر', 'Haircare', 'ماسكات وشامبوهات وزيوت للشعر ضمن كتالوج تجريبي.', 'Masks, shampoos, and oils for a richer product demo.', '/demo-catalog/haircare.svg', 30),
      ('home-scent', 'العطور المنزلية', 'Home Scent', 'شموع وفواحات لاختبار العرض البصري وتجربة الفئات.', 'Candles and diffusers for testing visual merchandising.', '/demo-catalog/home-candles.svg', 40),
      ('gift-sets', 'هدايا وعروض', 'Gift Sets', 'باقات جاهزة للهدايا والعروض الموسمية.', 'Curated bundles and seasonal gifting sets.', '/demo-catalog/gift-sets.svg', 50)
  ) AS t(slug, name_ar, name_en, description_ar, description_en, image_url, sort_order)
),
upsert_categories AS (
  INSERT INTO categories (
    slug,
    name_ar,
    name_en,
    description_ar,
    description_en,
    image_url,
    sort_order,
    is_active
  )
  SELECT
    slug,
    name_ar,
    name_en,
    description_ar,
    description_en,
    image_url,
    sort_order,
    true
  FROM category_seed
  ON CONFLICT (slug)
  DO UPDATE SET
    name_ar = EXCLUDED.name_ar,
    name_en = EXCLUDED.name_en,
    description_ar = EXCLUDED.description_ar,
    description_en = EXCLUDED.description_en,
    image_url = EXCLUDED.image_url,
    sort_order = EXCLUDED.sort_order,
    is_active = true
  RETURNING id, slug
),
catalog_products AS (
  SELECT * FROM (
    VALUES
      ('amber-veil-elixir', 'إكسير أمبر فيل', 'Amber Veil Elixir', 'fragrances', 'عطر دافئ بنفحات العنبر والفانيلا والمسك بلمسة فاخرة للاستخدام اليومي.', 'A warm amber fragrance with vanilla and musk, built for premium daily wear.', 9800.00, 8400.00, 18, true, ARRAY['luxury','amber','signature'], '/demo-catalog/fragrances.svg'),
      ('citrus-atelier-mist', 'سيترس أتيليه ميست', 'Citrus Atelier Mist', 'fragrances', 'بخاخ منعش بلمسة حمضية نظيفة ومظهر مثالي لاختبار بطاقات المنتجات.', 'A bright citrus mist made to test cleaner catalog cards and hero imagery.', 6200.00, NULL, 26, false, ARRAY['fresh','citrus'], '/demo-catalog/fragrances.svg'),
      ('midnight-oud-reserve', 'ميدنايت عود ريزيرف', 'Midnight Oud Reserve', 'fragrances', 'تركيبة أعمق مع خشب العود والتوابل لإحساس مسائي راقٍ.', 'A deeper oud and spice blend tailored for evening-focused luxury merchandising.', 13200.00, 11900.00, 9, true, ARRAY['oud','evening','best-seller'], '/demo-catalog/fragrances.svg'),
      ('velvet-rose-essence', 'فيلفت روز إيسنس', 'Velvet Rose Essence', 'fragrances', 'ورد ناعم بقاعدة مخملية يمنح المتجر منتجاً أنيقاً للتجربة.', 'Velvet rose with a soft dry-down for elegant premium-store testing.', 8700.00, NULL, 14, false, ARRAY['rose','floral'], '/demo-catalog/fragrances.svg'),

      ('peptide-cloud-cream', 'بيبتايد كلاود كريم', 'Peptide Cloud Cream', 'skincare', 'كريم مرطب بقوام خفيف ونتيجة بصرية ممتازة في بطاقات الفئة.', 'A light peptide moisturizer that reads beautifully across category cards.', 5400.00, 4700.00, 31, true, ARRAY['hydration','cream','peptide'], '/demo-catalog/skincare.svg'),
      ('glass-skin-serum', 'غلاس سكين سيروم', 'Glass Skin Serum', 'skincare', 'سيروم يمنح إشراقة ولمعة ناعمة لتجربة متجر أكثر فخامة.', 'A radiance serum designed for premium glow-focused storefront demos.', 6900.00, NULL, 24, true, ARRAY['serum','radiance'], '/demo-catalog/skincare.svg'),
      ('botanical-cleanse-gel', 'بوتانيكال كلينز جل', 'Botanical Cleanse Gel', 'skincare', 'غسول يومي منعش مناسب لاختبار الأسعار المتوسطة والمنتجات الأساسية.', 'A fresh daily cleanser for testing core-price skincare merchandising.', 3900.00, NULL, 42, false, ARRAY['cleanser','daily'], '/demo-catalog/skincare.svg'),
      ('night-repair-concentrate', 'نايت ريبير كونسنتريت', 'Night Repair Concentrate', 'skincare', 'علاج ليلي مركز يوصل إحساس العناية المتميزة في العرض.', 'A concentrated overnight treatment that signals a high-end skincare shelf.', 7600.00, 6990.00, 16, true, ARRAY['night','repair','premium'], '/demo-catalog/skincare.svg'),

      ('silk-revival-mask', 'سيلك ريفايفل ماسك', 'Silk Revival Mask', 'haircare', 'ماسك ترميم غني يمنح فئة الشعر حضوراً أقوى في الصفحة الرئيسية.', 'A rich repair mask that gives the haircare section stronger visual weight.', 4600.00, 3990.00, 27, true, ARRAY['mask','repair'], '/demo-catalog/haircare.svg'),
      ('argan-shine-oil', 'أرجان شاين أويل', 'Argan Shine Oil', 'haircare', 'زيت نهائي ناعم للشعر اللامع وتجربة صور جذابة.', 'A finishing oil built for glossy, premium-looking product art.', 5200.00, NULL, 22, false, ARRAY['oil','shine'], '/demo-catalog/haircare.svg'),
      ('volume-root-lift', 'فوليوم روت ليفت', 'Volume Root Lift', 'haircare', 'سبراي خفيف لرفع الجذور وإضافة تنوع جيد لقسم الاختبار.', 'A lightweight root-lift spray that expands the haircare test mix.', 4100.00, NULL, 19, false, ARRAY['volume','spray'], '/demo-catalog/haircare.svg'),
      ('cocoa-smooth-shampoo', 'كاكاو سموث شامبو', 'Cocoa Smooth Shampoo', 'haircare', 'شامبو تنعيم يومي بسعر مناسب وبطاقة منتج واضحة.', 'An everyday smoothing shampoo with clean mid-range pricing.', 3500.00, 3150.00, 38, true, ARRAY['shampoo','smooth'], '/demo-catalog/haircare.svg'),

      ('linen-amber-candle', 'شمعة لينن أمبر', 'Linen Amber Candle', 'home-scent', 'شمعة منزلية أنيقة تدعم اختبار البطاقات الهادئة والمنتجات الموسمية.', 'A soft amber candle for testing calm, premium home-scent layouts.', 4800.00, NULL, 12, true, ARRAY['candle','home'], '/demo-catalog/home-candles.svg'),
      ('cedar-mist-diffuser', 'سيدار ميست ديفيوزر', 'Cedar Mist Diffuser', 'home-scent', 'فواحة عيدان بتصميم بسيط يليق بالعرض الراقي.', 'A clean reed diffuser suited to elevated storefront presentation.', 5600.00, 4990.00, 15, true, ARRAY['diffuser','cedar'], '/demo-catalog/home-candles.svg'),
      ('vanilla-evening-candle', 'شمعة فانيلا إيفنينغ', 'Vanilla Evening Candle', 'home-scent', 'شمعة دافئة للنهايات اليومية ومحتوى تصوير تجريبي جميل.', 'A warm vanilla candle made for polished evening-style product grids.', 4500.00, NULL, 0, false, ARRAY['vanilla','candle'], '/demo-catalog/home-candles.svg'),
      ('quiet-room-spray', 'كوايت روم سبراي', 'Quiet Room Spray', 'home-scent', 'رذاذ منزلي سريع لإضافة منتج خفيف داخل نفس الفئة.', 'A room spray that adds a lighter fast-moving product to the category.', 3200.00, NULL, 29, false, ARRAY['spray','home'], '/demo-catalog/home-candles.svg'),

      ('signature-gift-box', 'سيغنتشر جيفت بوكس', 'Signature Gift Box', 'gift-sets', 'باقة فاخرة مكونة من عناصر مختارة لعرض المنتجات المجمعة.', 'A luxury curated bundle built to showcase giftable product bundles.', 14800.00, 13200.00, 11, true, ARRAY['gift','bundle','featured'], '/demo-catalog/gift-sets.svg'),
      ('self-care-weekend-kit', 'سلف كير ويكند كيت', 'Self Care Weekend Kit', 'gift-sets', 'طقم عطلة يتضمن عناية واسترخاء ومظهر ممتاز للتجربة.', 'A weekend self-care kit tailored for premium landing-page tests.', 11200.00, 9800.00, 13, true, ARRAY['kit','self-care'], '/demo-catalog/gift-sets.svg'),
      ('bridal-glow-set', 'برايدال جلو سيت', 'Bridal Glow Set', 'gift-sets', 'مجموعة مناسبة للمناسبات والهدايا الراقية.', 'A polished occasion set for event and gifting storefront scenarios.', 13600.00, NULL, 7, false, ARRAY['bridal','gift'], '/demo-catalog/gift-sets.svg'),
      ('mini-discovery-collection', 'ميني ديسكفري كوليكشن', 'Mini Discovery Collection', 'gift-sets', 'تشكيلة مصغرة مناسبة لاختبار العروض الصغيرة والسريعة.', 'A smaller discovery bundle ideal for testing lighter offer cards.', 7900.00, 7200.00, 21, false, ARRAY['mini','discovery'], '/demo-catalog/gift-sets.svg')
  ) AS t(slug, name_ar, name_en, category_slug, description_ar, description_en, price, promo_price, stock_quantity, is_featured, tags, image_url)
)
INSERT INTO products (
  slug,
  name_ar,
  name_en,
  description_ar,
  description_en,
  price,
  promo_price,
  category_id,
  images,
  primary_image_index,
  product_type,
  stock_quantity,
  is_published,
  is_featured,
  low_stock_threshold,
  tags,
  seo_title,
  seo_description
)
SELECT
  p.slug,
  p.name_ar,
  p.name_en,
  p.description_ar,
  p.description_en,
  p.price,
  p.promo_price,
  c.id,
  ARRAY[p.image_url],
  0,
  'physical_simple',
  p.stock_quantity,
  true,
  p.is_featured,
  3,
  p.tags,
  p.name_en,
  left(p.description_en, 150)
FROM catalog_products p
JOIN categories c ON c.slug = p.category_slug
ON CONFLICT (slug)
DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_en = EXCLUDED.name_en,
  description_ar = EXCLUDED.description_ar,
  description_en = EXCLUDED.description_en,
  price = EXCLUDED.price,
  promo_price = EXCLUDED.promo_price,
  category_id = EXCLUDED.category_id,
  images = EXCLUDED.images,
  primary_image_index = EXCLUDED.primary_image_index,
  product_type = EXCLUDED.product_type,
  stock_quantity = EXCLUDED.stock_quantity,
  is_published = true,
  is_featured = EXCLUDED.is_featured,
  low_stock_threshold = EXCLUDED.low_stock_threshold,
  tags = EXCLUDED.tags,
  seo_title = EXCLUDED.seo_title,
  seo_description = EXCLUDED.seo_description;
