WITH extra_catalog_products AS (
  SELECT * FROM (
    VALUES
      ('saffron-noir-parfum', 'سافرون نوار بارفان', 'Saffron Noir Parfum', 'fragrances', 'عطر غني بالزعفران والجلد والعنبر لإضافة خيار أكثر جرأة داخل قسم العطور.', 'A bolder saffron, leather, and amber scent that adds more depth to the fragrances lineup.', 15400.00, 13900.00, 8, true, ARRAY['saffron','luxury','evening'], '/demo-catalog/fragrances.svg'),
      ('pear-bloom-veil', 'بير بلوم فيل', 'Pear Bloom Veil', 'fragrances', 'رائحة فاكهية زهرية ناعمة مثالية للعروض الخفيفة والأنثوية.', 'A soft fruity-floral veil built for lighter and more feminine product collections.', 7100.00, NULL, 17, false, ARRAY['pear','floral','fresh'], '/demo-catalog/fragrances.svg'),
      ('smoked-iris-edition', 'سموكد آيرس إديشن', 'Smoked Iris Edition', 'fragrances', 'إصدار أكثر هدوءاً ولمسة بودرية راقية لمجموعة العطور.', 'A smoother powdery iris edition that brings a refined niche profile to the fragrance shelf.', 11800.00, 10400.00, 10, false, ARRAY['iris','powdery','niche'], '/demo-catalog/fragrances.svg'),
      ('ocean-cotton-splash', 'أوشن كوتون سبلاش', 'Ocean Cotton Splash', 'fragrances', 'خيار يومي نظيف ومنعش لعرض أسعار متنوعة داخل الفئة.', 'A crisp everyday splash that broadens the range with a cleaner fresh-wear option.', 5900.00, NULL, 30, false, ARRAY['clean','cotton','daily'], '/demo-catalog/fragrances.svg'),

      ('ceramide-barrier-milk', 'سيرامايد باريير ميلك', 'Ceramide Barrier Milk', 'skincare', 'حليب ترطيب داعم للحاجز الطبيعي للبشرة بقوام مريح وخفيف.', 'A barrier-support moisturizing milk with a light texture for premium skincare merchandising.', 5800.00, 5200.00, 25, true, ARRAY['ceramide','barrier','hydration'], '/demo-catalog/skincare.svg'),
      ('marine-dew-tonic', 'مارين ديو تونيك', 'Marine Dew Tonic', 'skincare', 'تونر منعش يمنح قسم العناية خياراً خفيفاً سريع الاستخدام.', 'A refreshing tonic that gives the skincare grid a quicker lightweight recovery product.', 4300.00, NULL, 34, false, ARRAY['tonic','refresh','daily'], '/demo-catalog/skincare.svg'),
      ('vitamin-c-lustre-gel', 'فيتامين سي لاستر جل', 'Vitamin C Lustre Gel', 'skincare', 'جل إشراقة يومي مناسب للعروض المتوسطة والسريعة.', 'A daily glow gel that rounds out the category with an easy mid-tier brightening option.', 6400.00, 5890.00, 18, true, ARRAY['vitamin-c','brightening','gel'], '/demo-catalog/skincare.svg'),
      ('calm-cloud-mask', 'كالم كلاود ماسك', 'Calm Cloud Mask', 'skincare', 'قناع مهدئ بملمس كريمي يعزز صورة العناية الهادئة داخل المتجر.', 'A soothing cream mask that strengthens the calm premium look of the skincare collection.', 5100.00, NULL, 21, false, ARRAY['mask','calming','cream'], '/demo-catalog/skincare.svg'),

      ('mint-scalp-reset', 'مينت سكالب ريسيت', 'Mint Scalp Reset', 'haircare', 'علاج فروة منعش يضيف منتجاً متخصصاً إلى قسم الشعر.', 'A mint scalp treatment that adds a more specialized care product to haircare.', 4700.00, NULL, 16, false, ARRAY['scalp','mint','treatment'], '/demo-catalog/haircare.svg'),
      ('cashmere-silk-serum', 'كاشمير سيلك سيروم', 'Cashmere Silk Serum', 'haircare', 'سيروم تنعيم فاخر يرفع من حضور المنتجات اللامعة في الفئة.', 'A smoothing luxury serum designed to elevate glossy high-end haircare merchandising.', 6100.00, 5490.00, 14, true, ARRAY['serum','smooth','shine'], '/demo-catalog/haircare.svg'),
      ('curl-memory-cream', 'كيرل ميموري كريم', 'Curl Memory Cream', 'haircare', 'كريم تمويج يضيف تنوعاً أكبر لأنماط الشعر المختلفة.', 'A curl-defining cream that expands the category toward textured-hair styling needs.', 4400.00, NULL, 20, false, ARRAY['curl','styling','cream'], '/demo-catalog/haircare.svg'),
      ('rose-protein-rinse', 'روز بروتين رينس', 'Rose Protein Rinse', 'haircare', 'بلسم بروتين خفيف بسعر مناسب وتجربة بصرية متناسقة.', 'A lightweight protein conditioner with balanced pricing and clean visual presentation.', 3800.00, 3400.00, 28, false, ARRAY['conditioner','protein','daily'], '/demo-catalog/haircare.svg'),

      ('fig-amber-reeds', 'فيغ أمبر ريدز', 'Fig Amber Reeds', 'home-scent', 'فواحة منزلية أكثر دفئاً ولمسة ديكور مناسبة للعرض.', 'A warmer reed diffuser that adds a cozy decorative note to the home-scent collection.', 5900.00, NULL, 13, false, ARRAY['diffuser','fig','amber'], '/demo-catalog/home-candles.svg'),
      ('tea-room-candle', 'تي روم كاندل', 'Tea Room Candle', 'home-scent', 'شمعة بروح الشاي الأبيض تناسب العروض الهادئة والراقية.', 'A white-tea candle built for calmer luxury arrangements and premium room styling.', 4700.00, 4250.00, 19, true, ARRAY['candle','tea','calm'], '/demo-catalog/home-candles.svg'),
      ('winter-spice-room-mist', 'وينتر سبايس روم ميست', 'Winter Spice Room Mist', 'home-scent', 'رذاذ منزلي موسمي يضيف طابعاً دافئاً إلى الفئة.', 'A seasonal room mist that gives the category a warmer holiday-style option.', 3600.00, NULL, 24, false, ARRAY['mist','seasonal','spice'], '/demo-catalog/home-candles.svg'),
      ('cotton-dawn-lantern', 'كوتون دون لانترن', 'Cotton Dawn Lantern', 'home-scent', 'منتج عطري منزلي ناعم يساعد على تنويع الصفحة بصرياً.', 'A soft cotton-scented home piece that helps diversify the product grid visually.', 5200.00, NULL, 11, false, ARRAY['cotton','home','decor'], '/demo-catalog/home-candles.svg'),

      ('midnight-gifting-edit', 'ميدنايت جيفتينغ إيديت', 'Midnight Gifting Edit', 'gift-sets', 'صندوق هدايا أغمق طابعاً ومناسب للمواسم الراقية.', 'A darker premium gift box tailored for more elevated seasonal campaigns.', 15900.00, 14300.00, 9, true, ARRAY['gift','premium','seasonal'], '/demo-catalog/gift-sets.svg'),
      ('daily-ritual-duo', 'ديلي ريتشوال ديو', 'Daily Ritual Duo', 'gift-sets', 'مجموعة ثنائية بسيطة تجمع العناية اليومية مع عرض سعر جذاب.', 'A simple two-piece set that supports accessible gifting and everyday bundles.', 6900.00, 6200.00, 26, false, ARRAY['duo','routine','gift'], '/demo-catalog/gift-sets.svg'),
      ('celebration-luxe-tray', 'سيليبريشن لوكس تراي', 'Celebration Luxe Tray', 'gift-sets', 'صينية هدايا فاخرة موجهة للمناسبات والعروض المميزة.', 'A luxe celebratory tray positioned for events, occasions, and premium gifting.', 17100.00, NULL, 6, true, ARRAY['occasion','luxe','gift'], '/demo-catalog/gift-sets.svg'),
      ('soft-glow-mini-box', 'سوفت جلو ميني بوكس', 'Soft Glow Mini Box', 'gift-sets', 'صندوق صغير أنيق مناسب للهدايا السريعة والبطاقات المصغرة.', 'A smaller polished gift box that works well for lighter offers and compact cards.', 7600.00, NULL, 18, false, ARRAY['mini','gift','soft-glow'], '/demo-catalog/gift-sets.svg')
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
FROM extra_catalog_products p
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
