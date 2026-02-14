const { Pool } = require('pg');

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
    const page = parseInt(event.queryStringParameters?.page || '1');
    const limit = parseInt(event.queryStringParameters?.limit || '20');
    const offset = (page - 1) * limit;
    const grain = event.queryStringParameters?.grain;

    let query = `
      SELECT id, settlement_number, grain_type, total_gross_kg, total_net_kg,
             company_id, status, settlement_date, created_at
      FROM settlements
    `;
    const params = [];

    if (grain) {
      params.push(grain);
      query += ` WHERE grain_type = $${params.length}`;
    }

    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const countQuery = grain
      ? `SELECT COUNT(*) FROM settlements WHERE grain_type = $1`
      : `SELECT COUNT(*) FROM settlements`;
    const countParams = grain ? [grain] : [];

    const [result, countResult] = await Promise.all([
      pool.query(query, params),
      pool.query(countQuery, countParams)
    ]);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        data: result.rows,
        pagination: {
          page,
          limit,
          total: parseInt(countResult.rows[0].count),
          pages: Math.ceil(countResult.rows[0].count / limit)
        }
      })
    };
  } catch (err) {
    console.error('Error:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ success: false, error: err.message }
)
    };
  }
};
