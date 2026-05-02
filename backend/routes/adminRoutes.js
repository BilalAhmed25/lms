const express = require('express');
const router = express.Router();
const { con } = require('../database');
const authenticateToken = require('../authenticateToken');

router.use(authenticateToken);

// Middleware to ensure admin
const isAdmin = (req, res, next) => {
    const roleId = req.user.RoleId || req.user.RoleID;
    if (roleId > 2) return res.status(403).json('Admin access only');
    next();
};

// ─── USER MANAGEMENT ───────────────────────────────────────────────────────────

// GET ALL USERS (Filtered by role)
router.get('/users', isAdmin, async (req, res) => {
    try {
        const { role } = req.query;
        let query = `
            SELECT u.ID, u.Email, u.Name, u.Status, u.CreatedAt, r.Name as RoleName,
                   s.ClassId, c.Name as ClassName
            FROM Users u
            JOIN Roles r ON u.RoleID = r.ID
            LEFT JOIN Students s ON u.ID = s.UserID
            LEFT JOIN Classes c ON s.ClassId = c.ID
            WHERE (u.SchoolId = ? OR u.SchoolId IS NULL)
        `;
        const schoolId = req.user.SchoolId || req.user.SchoolID || null;
        const params = [schoolId];
        if (role) {
            query += ' AND r.Name = ?';
            params.push(role);
        }
        const [rows] = await con.execute(query, params);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json('Failed to fetch users');
    }
});

// UPDATE USER STATUS (Activate/Deactivate)
router.put('/users/:id/status', isAdmin, async (req, res) => {
    try {
        const { status } = req.body;
        await con.execute('UPDATE Users SET Status = ? WHERE ID = ?', [status, req.params.id]);
        res.json('Status updated');
    } catch (err) {
        console.error(err);
        res.status(500).json('Failed to update status');
    }
});

// GET ALL CLASSES
router.get('/classes', isAdmin, async (req, res) => {
    try {
        const schoolId = req.user.SchoolId || req.user.SchoolID || null;
        const [rows] = await con.execute('SELECT * FROM Classes WHERE (SchoolId = ? OR SchoolId IS NULL)', [schoolId]);
        res.json(rows);
    } catch (err) {
        res.status(500).json('Failed to fetch classes');
    }
});

// CREATE NEW CLASS (COURSE ANNOUNCEMENT)
router.post('/classes', isAdmin, async (req, res) => {
    try {
        const schoolId = req.user.SchoolId || req.user.SchoolID || null;
        const { name, fee, description } = req.body;
        await con.execute(
            'INSERT INTO Classes (SchoolId, Name, Fee, Description) VALUES (?, ?, ?, ?)',
            [schoolId, name, fee, description || '']
        );
        res.status(201).json('Course announced successfully');
    } catch (err) {
        console.error(err);
        res.status(500).json('Failed to announce course');
    }
});

// ─── ANALYTICS ───────────────────────────────────────────────────────────────

router.get('/stats', isAdmin, async (req, res) => {
    try {
        const schoolId = req.user.SchoolId || req.user.SchoolID || null;
        const [users] = await con.execute('SELECT COUNT(*) as count FROM Users WHERE (SchoolId = ? OR ? IS NULL)', [schoolId, schoolId]);
        const [students] = await con.execute('SELECT COUNT(*) as count FROM Users WHERE RoleID = 4 AND (SchoolId = ? OR ? IS NULL)', [schoolId, schoolId]);
        const [teachers] = await con.execute('SELECT COUNT(*) as count FROM Users WHERE RoleID = 3 AND (SchoolId = ? OR ? IS NULL)', [schoolId, schoolId]);
        const [enrollments] = await con.execute('SELECT COUNT(*) as count FROM LMS_EnrollmentRequests WHERE Status = "pending"');
        
        res.json({
            totalUsers: users[0].count,
            totalStudents: students[0].count,
            totalTeachers: teachers[0].count,
            pendingEnrollments: enrollments[0].count
        });
    } catch (err) {
        console.error(err);
        res.status(500).json('Failed to fetch stats');
    }
});

module.exports = router;
