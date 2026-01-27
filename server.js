require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Database connection
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Middleware
app.use(express.json());
app.use(express.static('.'));

// Initialize database table
async function initDB() {
    try {
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
        console.log('✅ Database initialized');
    } catch (err) {
        console.error('❌ Database init error:', err.message);
    }
}

// API: Join waitlist
app.post('/api/waitlist', async (req, res) => {
    const { email, name, platform, usecases } = req.body;

    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }

    try {
        // Check if already exists
        const existing = await pool.query(
            'SELECT id FROM waitlist WHERE email = $1',
            [email]
        );

        if (existing.rows.length > 0) {
            return res.json({ success: true, message: "You're already on the waitlist!" });
        }

        // Insert new entry
        await pool.query(
            'INSERT INTO waitlist (email, name, platform, usecases) VALUES ($1, $2, $3, $4)',
            [email, name || null, platform || null, JSON.stringify(usecases || [])]
        );

        console.log(`📝 New signup: ${email}`);
        res.json({ success: true, message: "You're on the list!" });

    } catch (err) {
        console.error('❌ Error:', err.message);
        res.status(500).json({ error: 'Failed to join waitlist' });
    }
});

// API: Get waitlist count
app.get('/api/waitlist/count', async (req, res) => {
    try {
        const result = await pool.query('SELECT COUNT(*) FROM waitlist');
        res.json({ count: parseInt(result.rows[0].count) });
    } catch (err) {
        res.json({ count: 0 });
    }
});

// Serve index.html for all other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
app.listen(PORT, async () => {
    await initDB();
    console.log(`🚀 Waitlist server running on port ${PORT}`);
});
