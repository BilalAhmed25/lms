const express = require('express');
const router = express.Router();
const { con } = require('../database');
const authenticateToken = require('../authenticateToken');

router.use(authenticateToken);

// GET CURRENT USER PROFILE
router.get('/me', async (req, res) => {
    try {
        const query = `
            SELECT u.ID, u.Email, u.Name, u.Role, u.Status, u.CreatedAt
            FROM Users u
            WHERE u.ID = ?
        `;
        const [rows] = await con.execute(query, [req.user.ID]);
        if (rows.length === 0) return res.status(404).json('User not found');
        res.json(rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json('Failed to fetch profile');
    }
});

module.exports = router;
