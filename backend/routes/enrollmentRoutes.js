const express = require('express');
const router = express.Router();
const { con } = require('../database');
const authenticateToken = require('../authenticateToken');
const { uploadToCloudinary } = require('../cloudinaryHelper');

router.use(authenticateToken);

// ─── STUDENT ROUTES ───────────────────────────────────────────────────────────

// GET /enrollment/classes - List all available classes with their fees
router.get('/classes', async (req, res) => {
    try {
        const [rows] = await con.execute('SELECT ID, Name, Fee FROM Classes WHERE SchoolId = ?', [req.user.SchoolID]);
        res.json(rows);
    } catch (err) {
        res.status(500).json('Failed to fetch classes');
    }
});

// POST /enrollment/request - Submit enrollment request with receipt
router.post('/request', async (req, res) => {
    if (req.user.RoleID !== 4) return res.status(403).json('Students only');
    
    try {
        const { classId, amountPaid, receiptBase64 } = req.body;
        if (!classId || !receiptBase64) return res.status(400).json('Class and receipt are required');

        // Get Student ID
        const [studentRows] = await con.execute('SELECT ID FROM Students WHERE UserID = ?', [req.user.ID]);
        if (studentRows.length === 0) return res.status(404).json('Student profile not found');
        const studentId = studentRows[0].ID;

        // Upload receipt to Cloudinary
        const receiptUrl = await uploadToCloudinary(receiptBase64, 'lms_receipts');
        if (!receiptUrl) return res.status(500).json('Failed to upload receipt');

        await con.execute(
            'INSERT INTO LMS_EnrollmentRequests (SchoolId, StudentId, ClassId, ReceiptUrl, AmountPaid) VALUES (?, ?, ?, ?, ?)',
            [req.user.SchoolID, studentId, classId, receiptUrl, amountPaid || 0]
        );

        res.json('Enrollment request submitted for verification');
    } catch (err) {
        console.error(err);
        res.status(500).json('Failed to submit request');
    }
});

// GET /enrollment/my-history - Student's payment/enrollment history
router.get('/my-history', async (req, res) => {
    if (req.user.RoleID !== 4) return res.status(403).json('Students only');
    try {
        const [studentRows] = await con.execute('SELECT ID FROM Students WHERE UserID = ?', [req.user.ID]);
        const studentId = studentRows[0].ID;

        const [rows] = await con.execute(`
            SELECT er.*, c.Name as ClassName 
            FROM LMS_EnrollmentRequests er
            JOIN Classes c ON er.ClassId = c.ID
            WHERE er.StudentId = ?
            ORDER BY er.CreatedAt DESC
        `, [studentId]);
        res.json(rows);
    } catch (err) {
        res.status(500).json('Failed to fetch history');
    }
});

// ─── ADMIN ROUTES ─────────────────────────────────────────────────────────────

// GET /enrollment/admin/pending - List all pending requests
router.get('/admin/pending', async (req, res) => {
    const roleId = req.user.RoleId || req.user.RoleID;
    if (roleId > 2) return res.status(403).json('Admin only');
    try {
        const schoolId = req.user.SchoolId || req.user.SchoolID || null;
        const [rows] = await con.execute(`
            SELECT er.*, c.Name as ClassName, u.Name as StudentName, u.Email as StudentEmail
            FROM LMS_EnrollmentRequests er
            JOIN Classes c ON er.ClassId = c.ID
            JOIN Students s ON er.StudentId = s.ID
            JOIN Users u ON s.UserID = u.ID
            WHERE (er.SchoolId = ? OR ? IS NULL) AND er.Status = 'pending'
        `, [schoolId, schoolId]);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json('Failed to fetch pending requests');
    }
});

// PUT /enrollment/admin/approve/:id - Approve enrollment
router.put('/admin/approve/:id', async (req, res) => {
    if (req.user.RoleID > 2) return res.status(403).json('Admin only');
    
    const connection = await con.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Get request details
        const [request] = await connection.execute('SELECT * FROM LMS_EnrollmentRequests WHERE ID = ?', [req.params.id]);
        if (request.length === 0) throw new Error('Request not found');

        // 2. Update request status
        await connection.execute(
            'UPDATE LMS_EnrollmentRequests SET Status = "approved" WHERE ID = ?',
            [req.params.id]
        );

        // 3. Update Student ClassID
        await connection.execute(
            'UPDATE Students SET ClassId = ? WHERE ID = ?',
            [request[0].ClassId, request[0].StudentId]
        );

        await connection.commit();
        res.json('Enrollment approved and student enrolled in class');
    } catch (err) {
        await connection.rollback();
        console.error(err);
        res.status(500).json('Failed to approve enrollment');
    } finally {
        connection.release();
    }
});

// GET ALL ENROLLMENTS (Admin Only)
router.get('/admin/all', authenticateToken, async (req, res) => {
    if (req.user.RoleID > 2) return res.status(403).json('Admin access only');
    try {
        const query = `
            SELECT er.*, u.Name as StudentName, u.Email as StudentEmail, c.Name as ClassName 
            FROM LMS_EnrollmentRequests er
            JOIN Users u ON er.UserID = u.ID
            JOIN Classes c ON er.ClassID = c.ID
            ORDER BY er.CreatedAt DESC
        `;
        const [rows] = await con.execute(query);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json('Failed to fetch all enrollments');
    }
});

// DISAPPROVE/REMOVE ENROLLMENT (Admin Only)
router.delete('/admin/:id', authenticateToken, async (req, res) => {
    if (req.user.RoleID > 2) return res.status(403).json('Admin access only');
    const connection = await con.getConnection();
    try {
        await connection.beginTransaction();
        const [enrollment] = await connection.execute('SELECT UserID FROM LMS_EnrollmentRequests WHERE ID = ?', [req.params.id]);
        if (enrollment.length > 0) {
            // Remove ClassId from student
            await connection.execute('UPDATE Students SET ClassId = NULL WHERE UserID = ?', [enrollment[0].UserID]);
            // Delete request
            await connection.execute('DELETE FROM LMS_EnrollmentRequests WHERE ID = ?', [req.params.id]);
        }
        await connection.commit();
        res.json('Enrollment removed');
    } catch (err) {
        await connection.rollback();
        console.error(err);
        res.status(500).json('Failed to remove enrollment');
    } finally {
        connection.release();
    }
});

module.exports = router;
