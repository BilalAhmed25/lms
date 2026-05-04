const express = require('express');
const router = express.Router();
const { con } = require('../database');
const authenticateToken = require('../authenticateToken');
const { uploadToCloudinary } = require('../cloudinaryHelper');

// Middleware that populates req.user but doesn't block if token is missing
const optionalAuth = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return next();
    const token = authHeader.split(' ')[1];
    if (!token) return next();
    require('jsonwebtoken').verify(token, process.env.SECRET_KEY, (err, user) => {
        if (!err) req.user = user;
        next();
    });
};

// List available courses (Public with optional filtering for Teachers)
router.get('/classes', optionalAuth, async (req, res) => {
    try {
        let sql = `
            SELECT 
                c.ID, 
                c.Name, 
                c.Slug,
                c.ShortIntro,
                c.Fee,
                c.OriginalFee,
                c.Thumbnail,
                c.AverageRating,
                c.ReviewsCount,
                u.Name as TeacherName,
                (SELECT COUNT(*) FROM LMS_Modules WHERE CourseID = c.ID) as ModulesCount,
                (SELECT COUNT(*) FROM LMS_Enrollments WHERE CourseID = c.ID AND Status = 'approved') as StudentCount,
                (SELECT COUNT(*) FROM LMS_Sessions WHERE CourseID = c.ID) as SessionCount,
                (SELECT COUNT(*) FROM LMS_Assignments WHERE CourseID = c.ID) as TaskCount
            FROM LMS_Courses c
            LEFT JOIN Users u ON c.TeacherID = u.ID
            WHERE c.Status = "active"
        `;
        let params = [];

        // If a user is authenticated and is a Teacher, only show their courses
        // (Assuming the token is optionally checked here or via middleware)
        // Since this route is 'Public', we check if req.user exists from authenticateToken
        if (req.user && req.user.Role === 'Teacher') {
            sql += " AND c.TeacherID = ?";
            params.push(req.user.ID);
        }

        const [rows] = await con.execute(sql, params);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json('Fetch failed');
    }
});

// Get single course details by SLUG (Public)
router.get('/classes/:slug', async (req, res) => {
    try {
        const [courseRows] = await con.execute(`
            SELECT 
                c.*, 
                u.Name as TeacherName,
                u.ProfileImage as TeacherImage,
                u.Email as TeacherEmail,
                (SELECT COUNT(*) FROM LMS_Enrollments WHERE CourseID = c.ID AND Status = "approved") as EnrolledCount
            FROM LMS_Courses c
            LEFT JOIN Users u ON c.TeacherID = u.ID
            WHERE c.Slug = ? OR c.ID = ?
        `, [req.params.slug, req.params.slug]);

        if (courseRows.length === 0) return res.status(404).json('Course not found');

        const [moduleRows] = await con.execute(`
            SELECT * FROM LMS_Modules 
            WHERE CourseID = ? 
            ORDER BY OrderIndex ASC
        `, [courseRows[0].ID]);

        const course = courseRows[0];
        course.Modules = moduleRows;

        res.json(course);
    } catch (err) {
        console.error(err);
        res.status(500).json('Fetch failed');
    }
});

router.use(authenticateToken);

// Student enrollment history
router.get('/my-history', async (req, res) => {
    try {
        const [rows] = await con.execute(`
            SELECT e.*, c.Name as ClassName, c.Slug, (SELECT COUNT(*) FROM LMS_Assignments a WHERE a.CourseID = e.CourseID) as TotalTasks, (SELECT COUNT(*) FROM LMS_Submissions s JOIN LMS_Assignments a ON s.AssignmentID = a.ID WHERE a.CourseID = e.CourseID AND s.StudentID = e.UserID) as SubmittedTasks, (SELECT COUNT(*) FROM LMS_Submissions s JOIN LMS_Assignments a ON s.AssignmentID = a.ID WHERE a.CourseID = e.CourseID AND s.StudentID = e.UserID AND s.Status = 'graded') as GradedTasks FROM LMS_Enrollments e JOIN LMS_Courses c ON e.CourseID = c.ID WHERE e.UserID = ? ORDER BY e.CreatedAt DESC
        `, [req.user.ID]);
        res.json(rows);
    } catch (err) {
        res.status(500).json('Fetch failed');
    }
});

// Check enrollment status for a specific course
router.get('/status/:courseId', async (req, res) => {
    try {
        const [rows] = await con.execute(
            'SELECT Status, CreatedAt FROM LMS_Enrollments WHERE UserID = ? AND CourseID = ?',
            [req.user.ID, req.params.courseId]
        );
        res.json(rows[0] || null);
    } catch (err) {
        res.status(500).json('Check failed');
    }
});

// Request enrollment
router.post('/request', async (req, res) => {
    if (req.user.Role !== 'Student') return res.status(403).json('Students only');
    try {
        const { classId, amountPaid, receiptBase64 } = req.body;
        const receiptUrl = await uploadToCloudinary(receiptBase64, 'lms_receipts');
        
        await con.execute(
            'INSERT INTO LMS_Enrollments (UserID, CourseID, ReceiptUrl, AmountPaid) VALUES (?, ?, ?, ?)',
            [req.user.ID, classId, receiptUrl, amountPaid || 0]
        );
        res.json('Request submitted');
    } catch (err) {
        res.status(500).json('Submission failed');
    }
});

// Admin view pending
router.get('/admin/pending', async (req, res) => {
    if (req.user.Role !== 'Admin') return res.status(403).json('Admin only');
    try {
        const [rows] = await con.execute(`
            SELECT e.*, c.Name as ClassName, u.Name as StudentName, u.Email as StudentEmail
            FROM LMS_Enrollments e
            JOIN LMS_Courses c ON e.CourseID = c.ID
            JOIN Users u ON e.UserID = u.ID
            WHERE e.Status = 'pending'
        `);
        res.json(rows);
    } catch (err) {
        res.status(500).json('Fetch failed');
    }
});

// Admin approve
router.put('/admin/approve/:id', async (req, res) => {
    if (req.user.Role !== 'Admin') return res.status(403).json('Admin only');
    try {
        await con.execute('UPDATE LMS_Enrollments SET Status = "approved" WHERE ID = ?', [req.params.id]);
        res.json('Approved');
    } catch (err) {
        res.status(500).json('Approval failed');
    }
});

// Admin reject
router.put('/admin/reject/:id', async (req, res) => {
    if (req.user.Role !== 'Admin') return res.status(403).json('Admin only');
    const { reason, remarks } = req.body;
    try {
        await con.execute(
            'UPDATE LMS_Enrollments SET Status = "rejected", RejectionReason = ?, AdminRemarks = ? WHERE ID = ?', 
            [reason || 'Invalid Payment Proof', remarks || '', req.params.id]
        );
        res.json('Rejected');
    } catch (err) {
        console.error(err);
        res.status(500).json('Rejection failed');
    }
});

module.exports = router;

