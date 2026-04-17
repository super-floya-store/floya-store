import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  const { id } = req.query;

  // Verify admin token
  const authHeader = req.headers.authorization;
  if (!authHeader || !verifyAdminToken(authHeader)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    switch (req.method) {
      case 'PUT':
        // Update order status
        const { status } = req.body;
        const { data: updatedOrder, error: updateError } = await supabase
          .from('orders')
          .update({ status })
          .eq('id', id)
          .select()
          .single();

        if (updateError) throw updateError;
        return res.status(200).json(updatedOrder);

      case 'DELETE':
        // Delete order
        const { error: deleteError } = await supabase
          .from('orders')
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
  console.log('Auth header:', authHeader);
  const token = authHeader.replace('Bearer ', '');
  const expectedToken = process.env.ADMIN_TOKEN || 'admin-secret-token';
  console.log('Token match:', token === expectedToken, 'Token length:', token.length, 'Expected length:', expectedToken.length);
  return token === expectedToken;
}
