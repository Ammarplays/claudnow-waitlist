const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

// Discount probabilities (must sum to ~100%)
// 10% discount: 50%
// 20% discount: 25%
// 30% discount: 12.5%
// 40% discount: 6.25%
// 50% discount: 3.125%
// 100% discount: 0.005% (actually ~3.125% to make it sum to 100, but we'll use exact values)

function spinWheel() {
    const random = Math.random() * 100;
    
    // Cumulative probabilities
    // 10%:  0 - 50       (50%)
    // 20%:  50 - 75      (25%)
    // 30%:  75 - 87.5    (12.5%)
    // 40%:  87.5 - 93.75 (6.25%)
    // 50%:  93.75 - 96.875 (3.125%)
    // 100%: 96.875 - 100 (but we want 0.005%, so 99.995 - 100)
    
    // Adjusted to honor the exact percentages requested:
    // 10%: 50%, 20%: 25%, 30%: 12.5%, 40%: 6.25%, 50%: 3.12%, 100%: 0.005%
    // Total = 97.125%, remaining ~2.875% goes to 10%
    
    if (random < 50) return 10;
    if (random < 75) return 20;
    if (random < 87.5) return 30;
    if (random < 93.75) return 40;
    if (random < 96.875) return 50;
    if (random < 96.88) return 100; // 0.005% chance
    return 10; // fallback to 10%
}

function generateCode(discount) {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = 'CLAWD-';
    for (let i = 0; i < 6; i++) {
        code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
}

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ success: false, error: 'Email is required' });
        }

        // Check if user exists and hasn't spun yet
        const existing = await pool.query(
            'SELECT discount FROM waitlist WHERE email = $1',
            [email]
        );

        if (existing.rows.length === 0) {
            return res.status(400).json({ success: false, error: 'Email not found on waitlist' });
        }

        if (existing.rows[0].discount) {
            return res.status(400).json({ 
                success: false, 
                error: 'You have already spun the wheel',
                discount: existing.rows[0].discount
            });
        }

        // Spin the wheel (backend controlled)
        const discount = spinWheel();
        const code = generateCode(discount);

        // Save result
        await pool.query(
            'UPDATE waitlist SET discount = $1, discount_code = $2 WHERE email = $3',
            [discount, code, email]
        );

        console.log(`🎰 Spin result: ${email} won ${discount}% (code: ${code})`);

        return res.json({
            success: true,
            discount,
            code
        });

    } catch (err) {
        console.error('Spin error:', err);
        return res.status(500).json({ success: false, error: 'Server error' });
    }
};
