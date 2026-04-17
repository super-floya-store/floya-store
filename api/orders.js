import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    switch (req.method) {
      case 'GET':
        // Get orders (admin only)
        const authHeader = req.headers.authorization;
        if (!authHeader || !verifyAdminToken(authHeader)) {
          return res.status(401).json({ error: 'Unauthorized' });
        }

        const { data: orders, error } = await supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        return res.status(200).json(orders);

      case 'POST':
        // Create new order (public)
        const { productId, productName, productPrice, customerName, customerState, customerPhone } = req.body;

        // Validate required fields
        if (!productId || !customerName || !customerState || !customerPhone) {
          return res.status(400).json({ error: 'Missing required fields' });
        }

        // Validate phone number (Algerian format)
        const phoneRegex = /^(0[5-7])[0-9]{8}$/;
        const cleanPhone = customerPhone.replace(/\s/g, '');
        if (!phoneRegex.test(cleanPhone)) {
          return res.status(400).json({ error: 'Invalid phone number format' });
        }

        const { data: newOrder, error: insertError } = await supabase
          .from('orders')
          .insert([{
            product_id: productId,
            product_name: productName,
            product_price: productPrice,
            customer_name: customerName,
            customer_state: customerState,
            customer_phone: cleanPhone,
            status: 'جديد'
          }])
          .select()
          .single();

        if (insertError) throw insertError;
        return res.status(201).json(newOrder);

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
