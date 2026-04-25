ALTER TABLE categories
ADD COLUMN IF NOT EXISTS gallery_images TEXT[] DEFAULT '{}';

CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type VARCHAR(20) NOT NULL CHECK (entity_type IN ('product', 'category')),
  entity_id UUID NOT NULL,
  customer_name VARCHAR(100) NOT NULL,
  customer_email VARCHAR(100),
  rating INTEGER NOT NULL DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
  comment TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes TEXT,
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_comments_entity ON comments(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_comments_status ON comments(status);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at DESC);

DROP TRIGGER IF EXISTS trg_comments_updated_at ON comments;
CREATE TRIGGER trg_comments_updated_at BEFORE UPDATE ON comments FOR EACH ROW EXECUTE FUNCTION update_updated_at();

INSERT INTO settings (key, value, description)
VALUES
  ('admin_notification_email', '"contact@floya.dz"', 'Admin email for notifications'),
  ('email_sender_name', '"Floya Store"', 'Sender display name for transactional emails'),
  ('email_sender_address', '"onboarding@resend.dev"', 'Sender email address for transactional emails'),
  ('order_email_enabled', 'true', 'Enable order confirmation and status emails'),
  (
    'email_templates',
    '{
      "order_confirmation": {
        "subject": "تأكيد طلبك {{order_number}}",
        "html": "<div dir=\"rtl\" style=\"font-family:Tahoma,Arial,sans-serif;line-height:1.9;color:#111827\"><h2>شكراً لك {{customer_name}}</h2><p>تم استلام طلبك بنجاح برقم <strong>{{order_number}}</strong>.</p><p>إجمالي الطلب: <strong>{{order_total}}</strong></p><p>سنقوم بالتواصل معك قريباً لتأكيد وتجهيز الطلب.</p></div>"
      },
      "order_status_update": {
        "subject": "تحديث حالة الطلب {{order_number}}",
        "html": "<div dir=\"rtl\" style=\"font-family:Tahoma,Arial,sans-serif;line-height:1.9;color:#111827\"><h2>مرحباً {{customer_name}}</h2><p>تم تحديث حالة طلبك <strong>{{order_number}}</strong> إلى: <strong>{{order_status}}</strong>.</p><p>{{tracking_block}}</p></div>"
      },
      "new_comment": {
        "subject": "تعليق جديد بانتظار المراجعة",
        "html": "<div dir=\"rtl\" style=\"font-family:Tahoma,Arial,sans-serif;line-height:1.9;color:#111827\"><h2>تعليق جديد</h2><p>تم إرسال تعليق جديد على {{entity_type}}.</p><p><strong>الاسم:</strong> {{customer_name}}</p><p><strong>التقييم:</strong> {{rating}}/5</p><p><strong>النص:</strong> {{comment}}</p></div>"
      }
    }',
    'Customizable transactional email templates'
  )
ON CONFLICT (key) DO NOTHING;

INSERT INTO users (username, email, password_hash, full_name, role, is_active)
VALUES (
  'ADMINFLOYA',
  'admin@floya.dz',
  '$2a$12$PjatGvQKmRWIaGk/n6FCoeJckmLd6AYta.hOYygD5osPnwvPjArea',
  'Floya Store Admin',
  'super_admin',
  true
)
ON CONFLICT (username) DO NOTHING;
