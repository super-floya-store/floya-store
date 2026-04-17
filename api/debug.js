export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  return res.status(200).json({
    admin_username_set: !!process.env.ADMIN_USERNAME,
    admin_password_set: !!process.env.ADMIN_PASSWORD,
    admin_token_set: !!process.env.ADMIN_TOKEN,
    admin_token_length: process.env.ADMIN_TOKEN ? process.env.ADMIN_TOKEN.length : 0,
    supabase_url_set: !!process.env.SUPABASE_URL,
    supabase_service_key_set: !!process.env.SUPABASE_SERVICE_ROLE_KEY
  });
}
