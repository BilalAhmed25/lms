const express = require('express');
const router = express.Router();
const { con } = require('../database');
const authenticateToken = require('../authenticateToken');

router.use(authenticateToken);

// Add to wishlist
router.post('/add', async (req, res) => {
    try {
        const { courseId } = req.body;
        await con.execute(
            'INSERT IGNORE INTO LMS_Wishlist (UserID, CourseID) VALUES (?, ?)',
            [req.user.ID, courseId]
        );
        res.json('Added to wishlist');
    } catch (err) {
        console.error(err);
        res.status(500).json('Failed to add to wishlist');
    }
});

// Remove from wishlist
router.post('/remove', async (req, res) => {
    try {
        const { courseId } = req.body;
        await con.execute(
            'DELETE FROM LMS_Wishlist WHERE UserID = ? AND CourseID = ?',
            [req.user.ID, courseId]
        );
        res.json('Removed from wishlist');
    } catch (err) {
        console.error(err);
        res.status(500).json('Failed to remove from wishlist');
    }
});

// Get user wishlist
router.get('/', async (req, res) => {
    try {
        const [rows] = await con.execute(`
            SELECT c.*, u.Name as TeacherName 
            FROM LMS_Wishlist w
            JOIN LMS_Courses c ON w.CourseID = c.ID
            LEFT JOIN Users u ON c.TeacherID = u.ID
            WHERE w.UserID = ?
        `, [req.user.ID]);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json('Fetch failed');
    }
});

module.exports = router;
