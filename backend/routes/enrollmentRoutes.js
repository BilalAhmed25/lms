const express = require('express');
const router = express.Router();
const { con } = require('../database');
const authenticateToken = require('../authenticateToken');
const { uploadToCloudinary } = require('../cloudinaryHelper');

router.use(authenticateToken);

// List available courses
router.get('/classes', async (req, res) => {
    try {
        const [rows] = await con.execute('SELECT ID, Name, Fee FROM LMS_Courses WHERE Status = "active"');
        res.json(rows);
    } catch (err) {
        res.status(500).json('Fetch failed');
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

module.exports = router;
