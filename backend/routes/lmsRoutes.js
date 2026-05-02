const express = require('express');
const router = express.Router();
const { con } = require('../database');
const authenticateToken = require('../authenticateToken');
const { uploadToCloudinary } = require('../cloudinaryHelper');

router.use(authenticateToken);

// ─── ASSIGNMENTS ───────────────────────────────────────────────────────────

// Get assignments for a course
router.get('/assignments/:courseId', async (req, res) => {
    try {
        const [rows] = await con.execute(`
            SELECT a.*, u.Name as TeacherName
            FROM LMS_Assignments a
            JOIN Users u ON a.TeacherID = u.ID
            WHERE a.CourseID = ?
        `, [req.params.courseId]);
        res.json(rows);
    } catch (err) {
        res.status(500).json('Fetch failed');
    }
});

// Create assignment (Teacher/Admin only)
router.post('/assignments', async (req, res) => {
    if (req.user.Role === 'Student') return res.status(403).json('Forbidden');
    try {
        const { courseId, title, description, fileURL, dueDate, maxMarks } = req.body;
        
        let resolvedFileURL = fileURL;
        if (resolvedFileURL && resolvedFileURL.startsWith('data:')) {
            resolvedFileURL = await uploadToCloudinary(resolvedFileURL, 'lms_assignments');
        }

        await con.execute(
            'INSERT INTO LMS_Assignments (TeacherID, CourseID, Title, Description, FileURL, DueDate, MaxMarks) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [req.user.ID, courseId, title, description, resolvedFileURL, dueDate, maxMarks || 100]
        );
        res.json('Assignment created');
    } catch (err) {
        res.status(500).json('Creation failed');
    }
});

// ─── SUBMISSIONS ───────────────────────────────────────────────────────────

// Submit work (Student only)
router.post('/submissions', async (req, res) => {
    if (req.user.Role !== 'Student') return res.status(403).json('Students only');
    try {
        const { assignmentId, fileURL, textResponse } = req.body;
        
        let resolvedFileURL = fileURL;
        if (resolvedFileURL && resolvedFileURL.startsWith('data:')) {
            resolvedFileURL = await uploadToCloudinary(resolvedFileURL, 'lms_submissions');
        }

        await con.execute(
            'INSERT INTO LMS_Submissions (AssignmentID, StudentID, FileURL, TextResponse) VALUES (?, ?, ?, ?)',
            [assignmentId, req.user.ID, resolvedFileURL, textResponse]
        );
        res.json('Work submitted');
    } catch (err) {
        res.status(500).json('Submission failed');
    }
});

// Get submissions for an assignment (Teacher/Admin only)
router.get('/submissions/:assignmentId', async (req, res) => {
    if (req.user.Role === 'Student') return res.status(403).json('Forbidden');
    try {
        const [rows] = await con.execute(`
            SELECT s.*, u.Name as StudentName, u.Email as StudentEmail
            FROM LMS_Submissions s
            JOIN Users u ON s.StudentID = u.ID
            WHERE s.AssignmentID = ?
        `, [req.params.assignmentId]);
        res.json(rows);
    } catch (err) {
        res.status(500).json('Fetch failed');
    }
});

module.exports = router;
