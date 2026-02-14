const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST, user: process.env.DB_USER,
  password: process.env.DB_PASSWORD, database: process.env.DB_NAME,
  port: 5432, ssl: { rejectUnauthorized: false }
});

exports.handler = async (event) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };

  try {
    const id = event.pathParameters?.id;
    if (!id) return { statusCode: 400, headers, body: JSON.stringify({ success: false, error: 'Missing id' }) };

    const settlementRes = await pool.query('SELECT * FROM settlements WHERE id = $1', [id]);
    if (!settlementRes.rows.length) {
      return { statusCode: 404, headers, body: JSON.stringify({ success: false, error: 'Not found' }) };
    }

    const ctgsRes = await pool.query(`
      SELECT c.*, 
             json_agg(qa ORDER BY qa.analysis_date DESC) FILTER (WHERE qa.id IS NOT NULL) as analyses
      FROM ctg_entries c
      LEFT JOIN quality_analyses qa ON qa.ctg_entry_id = c.id
      WHERE c.settlement_id = $1
      GROUP BY c.id
      ORDER BY c.created_at
    `, [id]);

    return {
      statusCode: 200, headers,
      body: JSON.stringify({
        success: true,
        data: { ...settlementRes.rows[0], ctgs: ctgsRes.rows }
      })
    };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, headers, body: JSON.stringify({ success: false, error: err.message }) };
  }
};
