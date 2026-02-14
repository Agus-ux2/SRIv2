const { Pool } = require('pg');
const { randomUUID } = require('crypto');

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: 5432,
  ssl: { rejectUnauthorized: false }
});

exports.handler = async (event) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
  };
  try {
    const body = JSON.parse(event.body || '{}');
    const grain_type = body.grain_type;
    const company_id = body.company_id;
    if (!grain_type || !company_id) {
      return { statusCode: 400, headers, body: JSON.stringify({ success: false, error: 'Missing: grain_type, company_id' }) };
    }
    const id = randomUUID();
    const result = await pool.query(
      'INSERT INTO settlements (id, grain_type, total_gross_kg, total_net_kg, total_waste_kg, company_id, settlement_number, settlement_date, base_price_per_ton, gross_amount, commercial_discount, commission_amount, paritarias_amount, freight_amount, net_amount, status, created_at, updated_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,NOW(),NOW()) RETURNING id, settlement_number, grain_type, total_gross_kg, company_id, status, created_at',
      [id, grain_type, body.total_gross_kg||0, body.total_net_kg||0, body.total_waste_kg||0, company_id, body.settlement_number||('SRI-'+Date.now()), body.settlement_date||new Date().toISOString().split('T')[0], body.base_price_per_ton||0, body.gross_amount||0, body.commercial_discount||0, body.commission_amount||0, body.paritarias_amount||0, body.freight_amount||0, body.net_amount||0, 'pending']
    );
    return { statusCode: 201, headers, body: JSON.stringify({ success: true, data: result.rows[0] }) };
  } catch (err) {
    console.error('Error:', err);
    return { statusCode: 500, headers, body: JSON.stringify({ success: false, error: err.message }) };
  }
};
