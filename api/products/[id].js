import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  const { id } = req.query;

  try {
    switch (req.method) {
      case 'GET':
        const { data: product, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        if (!product) return res.status(404).json({ error: 'Product not found' });
        return res.status(200).json(product);

      case 'PUT':
        // Update product (admin only)
        const authHeader = req.headers.authorization;
        if (!authHeader || !verifyAdminToken(authHeader)) {
          return res.status(401).json({ error: 'Unauthorized' });
        }

        const { name, description, price, promoPrice, category, image } = req.body;
        const { data: updatedProduct, error: updateError } = await supabase
          .from('products')
          .update({ name, description, price, promoPrice, category, image, updated_at: new Date() })
          .eq('id', id)
          .select()
          .single();

        if (updateError) throw updateError;
        return res.status(200).json(updatedProduct);

      case 'DELETE':
        // Delete product (admin only)
        const delAuthHeader = req.headers.authorization;
        if (!delAuthHeader || !verifyAdminToken(delAuthHeader)) {
          return res.status(401).json({ error: 'Unauthorized' });
        }

        const { error: deleteError } = await supabase
          .from('products')
          .delete()
          .eq('id', id);

        if (deleteError) throw deleteError;
        return res.status(204).end();

      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: error.message });
  }
}

function verifyAdminToken(authHeader) {
  const token = authHeader.replace('Bearer ', '');
  const expectedToken = process.env.ADMIN_TOKEN || 'admin-secret-token';
  return token === expectedToken;
}
