import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    switch (req.method) {
      case 'GET':
        // Get all products
        const { data: products, error } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        return res.status(200).json(products);

      case 'POST':
        // Create new product (admin only)
        const authHeader = req.headers.authorization;
        if (!authHeader || !verifyAdminToken(authHeader)) {
          return res.status(401).json({ error: 'Unauthorized' });
        }

        const { name, description, price, promoPrice, category, image } = req.body;
        const { data: newProduct, error: insertError } = await supabase
          .from('products')
          .insert([{ name, description, price, promoPrice, category, image }])
          .select()
          .single();

        if (insertError) throw insertError;
        return res.status(201).json(newProduct);

      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: error.message });
  }
}

function verifyAdminToken(authHeader) {
  console.log('Auth header:', authHeader);
  const token = authHeader.replace('Bearer ', '');
  const expectedToken = process.env.ADMIN_TOKEN || 'admin-secret-token';
  console.log('Token match:', token === expectedToken, 'Token length:', token.length, 'Expected length:', expectedToken.length);
  return token === expectedToken;
}
