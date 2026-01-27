const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

// Initialize table
async function initTable() {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS waitlist (
            id SERIAL PRIMARY KEY,
            email VARCHAR(255) UNIQUE NOT NULL,
            name VARCHAR(255),
            platform VARCHAR(50),
            usecases TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);
}

module.exports = async (req, res) => {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        await initTable();

        // GET - return count
        if (req.method === 'GET') {
            const result = await pool.query('SELECT COUNT(*) FROM waitlist');
            return res.json({ count: parseInt(result.rows[0].count) });
        }

        // POST - add to waitlist
        if (req.method === 'POST') {
            const { email, name, platform, usecases } = req.body;

            if (!email) {
                return res.status(400).json({ success: false, error: 'Email is required' });
            }

            // Check if exists
            const existing = await pool.query(
                'SELECT id FROM waitlist WHERE email = $1',
                [email]
            );

            if (existing.rows.length > 0) {
                return res.json({ success: true, message: "You're already on the waitlist!" });
            }

            // Insert
            await pool.query(
                'INSERT INTO waitlist (email, name, platform, usecases) VALUES ($1, $2, $3, $4)',
                [email, name || null, platform || null, JSON.stringify(usecases || [])]
            );

            return res.json({ success: true, message: "You're on the list!" });
        }

        return res.status(405).json({ error: 'Method not allowed' });

    } catch (err) {
        console.error('Error:', err);
        return res.status(500).json({ success: false, error: 'Database error' });
    }
};
