const express = require('express');
const router = express.Router();
const { con } = require('../database');
const authenticateToken = require('../authenticateToken');

router.use(authenticateToken);

const isAdmin = (req, res, next) => {
    if (req.user.Role !== 'Admin') return res.status(403).json('Admin only');
    next();
};

// STATS
router.get('/stats', isAdmin, async (req, res) => {
    try {
        const [[{ users }]] = await con.execute('SELECT COUNT(*) as users FROM Users');
        const [[{ teachers }]] = await con.execute('SELECT COUNT(*) as teachers FROM Users WHERE Role = "Teacher"');
        const [[{ students }]] = await con.execute('SELECT COUNT(*) as students FROM Users WHERE Role = "Student"');
        const [[{ pending }]] = await con.execute('SELECT COUNT(*) as pending FROM LMS_Enrollments WHERE Status = "pending"');

        res.json({ totalUsers: users, totalTeachers: teachers, totalStudents: students, pendingEnrollments: pending });
    } catch (err) {
        res.status(500).json('Stats failed');
    }
});

// USERS
router.get('/users', isAdmin, async (req, res) => {
    try {
        const { role } = req.query;
        let query = 'SELECT ID, Name, Email, Role, Status, CreatedAt FROM Users';
        let params = [];
        if (role) {
            query += ' WHERE Role = ?';
            params.push(role);
        }
        const [rows] = await con.execute(query, params);
        res.json(rows);
    } catch (err) {
        res.status(500).json('Fetch failed');
    }
});

router.put('/users/:id/status', isAdmin, async (req, res) => {
    try {
        await con.execute('UPDATE Users SET Status = ? WHERE ID = ?', [req.body.status, req.params.id]);
        res.json('Status updated');
    } catch (err) {
        res.status(500).json('Update failed');
    }
});

// COURSES (Detailed Management)
router.get('/classes', isAdmin, async (req, res) => {
    try {
        const [rows] = await con.execute(`
            SELECT c.*, u.Name as TeacherName,
            (SELECT COUNT(*) FROM LMS_Enrollments e WHERE e.CourseID = c.ID AND e.Status = 'approved') as EnrollmentCount,
            (SELECT COUNT(*) FROM LMS_Assignments a WHERE a.CourseID = c.ID) as AssignmentCount,
            (SELECT COUNT(*) FROM LMS_Submissions s 
             JOIN LMS_Assignments a ON s.AssignmentID = a.ID 
             WHERE a.CourseID = c.ID AND s.Marks IS NOT NULL) as GradedCount
            FROM LMS_Courses c
            LEFT JOIN Users u ON c.TeacherID = u.ID
        `);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json('Fetch failed');
    }
});

router.post('/classes', isAdmin, async (req, res) => {
    try {
        const { name, fee, description, teacherId } = req.body;
        await con.execute('INSERT INTO LMS_Courses (Name, Fee, Description, TeacherID) VALUES (?, ?, ?, ?)', 
            [name, fee, description, teacherId || null]);
        res.json('Course created');
    } catch (err) {
        res.status(500).json('Creation failed');
    }
});

router.put('/courses/:id/update', isAdmin, async (req, res) => {
    try {
        const { status, teacherId } = req.body;
        await con.execute('UPDATE LMS_Courses SET Status = ?, TeacherID = ? WHERE ID = ?', 
            [status, teacherId || null, req.params.id]);
        res.json('Course updated');
    } catch (err) {
        res.status(500).json('Update failed');
    }
});

module.exports = router;
