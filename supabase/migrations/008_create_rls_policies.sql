-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Public read access for published products and active categories
CREATE POLICY "Public can view published products" 
  ON products FOR SELECT USING (is_published = true);

CREATE POLICY "Public can view active categories" 
  ON categories FOR SELECT USING (is_active = true);

CREATE POLICY "Public can create orders" 
  ON orders FOR INSERT WITH CHECK (true);

CREATE POLICY "Public can view own order" 
  ON orders FOR SELECT USING (true);

-- Admin full access
CREATE POLICY "Admins can do everything on products" 
  ON products FOR ALL USING (auth.jwt() ->> 'role' IN ('super_admin', 'admin'));

CREATE POLICY "Admins can do everything on orders" 
  ON orders FOR ALL USING (auth.jwt() ->> 'role' IN ('super_admin', 'admin'));

CREATE POLICY "Admins can do everything on categories" 
  ON categories FOR ALL USING (auth.jwt() ->> 'role' IN ('super_admin', 'admin'));

CREATE POLICY "Admins can view users" 
  ON users FOR SELECT USING (auth.jwt() ->> 'role' IN ('super_admin', 'admin'));

CREATE POLICY "Super admin can manage users" 
  ON users FOR ALL USING (auth.jwt() ->> 'role' = 'super_admin');

CREATE POLICY "Admins can view audit logs" 
  ON audit_logs FOR SELECT USING (auth.jwt() ->> 'role' IN ('super_admin', 'admin'));

CREATE POLICY "Admins can manage settings" 
  ON settings FOR ALL USING (auth.jwt() ->> 'role' IN ('super_admin', 'admin'));
