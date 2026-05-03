const express = require('express');
const router = express.Router();
const { con } = require('../database');
const authenticateToken = require('../authenticateToken');
const { uploadToCloudinary } = require('../cloudinaryHelper');

router.use(authenticateToken);

// ─── SESSIONS (Live Classes) ──────────────────────────────────────────────

// Get sessions for a course
router.get('/sessions/:courseId', async (req, res) => {
    try {
        const [rows] = await con.execute(`
            SELECT s.*, u.Name as TeacherName
            FROM LMS_Sessions s
            JOIN Users u ON s.TeacherID = u.ID
            WHERE s.CourseID = ?
            ORDER BY s.SessionDate ASC
        `, [req.params.courseId]);
        res.json(rows);
    } catch (err) {
        res.status(500).json('Fetch failed');
    }
});

// Create session (Teacher/Admin only)
router.post('/sessions', async (req, res) => {
    if (req.user.Role === 'Student') return res.status(403).json('Forbidden');
    try {
        const { courseId, title, description, sessionDate, durationMinutes, zoomLink } = req.body;
        await con.execute(`
            INSERT INTO LMS_Sessions (CourseID, TeacherID, Title, Description, SessionDate, DurationMinutes, ZoomLink)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [courseId, req.user.ID, title, description, sessionDate, durationMinutes || 60, zoomLink]);
        res.json('Session scheduled');
    } catch (err) {
        res.status(500).json('Scheduling failed');
    }
});

// Update session status
router.put('/sessions/:id/status', async (req, res) => {
    if (req.user.Role === 'Student') return res.status(403).json('Forbidden');
    try {
        await con.execute('UPDATE LMS_Sessions SET Status = ? WHERE ID = ?', [req.body.status, req.params.id]);
        res.json('Status updated');
    } catch (err) {
        res.status(500).json('Update failed');
    }
});

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

// Create assignment/quiz (Teacher/Admin only)
router.post('/assignments', async (req, res) => {
    if (req.user.Role === 'Student') return res.status(403).json('Forbidden');
    try {
        const { courseId, type, title, description, questions, fileURL, dueDate, maxMarks, passingMarks, timeLimitMinutes } = req.body;
        
        let resolvedFileURL = fileURL;
        if (resolvedFileURL && resolvedFileURL.startsWith('data:')) {
            resolvedFileURL = await uploadToCloudinary(resolvedFileURL, 'lms_assignments');
        }

        await con.execute(
            `INSERT INTO LMS_Assignments 
            (TeacherID, CourseID, Type, Title, Description, Questions, FileURL, DueDate, MaxMarks, PassingMarks, TimeLimitMinutes) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                req.user.ID, courseId, type || 'assignment', title, description, 
                questions ? JSON.stringify(questions) : null, 
                resolvedFileURL, dueDate, maxMarks || 100, passingMarks || 40, timeLimitMinutes || 0
            ]
        );
        res.json('Content created');
    } catch (err) {
        console.error(err);
        res.status(500).json('Creation failed');
    }
});

// ─── SUBMISSIONS ───────────────────────────────────────────────────────────

// Submit work (Student only)
router.post('/submissions', async (req, res) => {
    if (req.user.Role !== 'Student') return res.status(403).json('Students only');
    try {
        const { assignmentId, fileURL, textResponse, answers } = req.body;
        
        let resolvedFileURL = fileURL;
        if (resolvedFileURL && resolvedFileURL.startsWith('data:')) {
            resolvedFileURL = await uploadToCloudinary(resolvedFileURL, 'lms_submissions');
        }

        await con.execute(
            'INSERT INTO LMS_Submissions (AssignmentID, StudentID, FileURL, TextResponse, Answers) VALUES (?, ?, ?, ?, ?)',
            [assignmentId, req.user.ID, resolvedFileURL, textResponse, answers ? JSON.stringify(answers) : null]
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
            ORDER BY s.SubmittedAt DESC
        `, [req.params.assignmentId]);
        res.json(rows);
    } catch (err) {
        res.status(500).json('Fetch failed');
    }
});

// Grade submission
router.put('/submissions/:id/grade', async (req, res) => {
    if (req.user.Role === 'Student') return res.status(403).json('Forbidden');
    try {
        const { marks, feedback } = req.body;
        await con.execute(
            'UPDATE LMS_Submissions SET Marks = ?, Feedback = ?, Status = "graded", GradedBy = ? WHERE ID = ?',
            [marks, feedback, req.user.ID, req.params.id]
        );
        res.json('Graded successfully');
    } catch (err) {
        res.status(500).json('Grading failed');
    }
});

module.exports = router;
