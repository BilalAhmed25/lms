const express = require('express');
const router = express.Router();
const { con } = require('../database');
const authenticateToken = require('../authenticateToken');
const { uploadToCloudinary } = require('../cloudinaryHelper');

router.use(authenticateToken);

// ─── TEACHER DASHBOARD DATA ──────────────────────────────────────────────

// Get all pending submissions for assignments created by the teacher
router.get('/submissions/pending', async (req, res) => {
    if (req.user.Role === 'Student') return res.status(403).json('Forbidden');
    try {
        const [rows] = await con.execute(`
            SELECT s.*, u.Name as StudentName, a.Title as AssignmentTitle, a.MaxMarks
            FROM LMS_Submissions s
            JOIN Users u ON s.StudentID = u.ID
            JOIN LMS_Assignments a ON s.AssignmentID = a.ID
            WHERE a.TeacherID = ? AND s.Status = 'submitted'
            ORDER BY s.SubmittedAt DESC
        `, [req.user.ID]);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json('Fetch failed');
    }
});

// Get all graded submissions for assignments created by the teacher
router.get('/submissions/graded', async (req, res) => {
    if (req.user.Role === 'Student') return res.status(403).json('Forbidden');
    try {
        const [rows] = await con.execute(`
            SELECT s.*, u.Name as StudentName, a.Title as AssignmentTitle, a.MaxMarks
            FROM LMS_Submissions s
            JOIN Users u ON s.StudentID = u.ID
            JOIN LMS_Assignments a ON s.AssignmentID = a.ID
            WHERE a.TeacherID = ? AND s.Status = 'graded'
            ORDER BY s.SubmittedAt DESC
        `, [req.user.ID]);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json('Fetch failed');
    }
});

// Get all sessions for the teacher (all courses)
router.get('/teacher/sessions', async (req, res) => {
    if (req.user.Role === 'Student') return res.status(403).json('Forbidden');
    try {
        const [rows] = await con.execute(`
            SELECT s.*, c.Name as CourseName
            FROM LMS_Sessions s
            JOIN LMS_Courses c ON s.CourseID = c.ID
            WHERE s.TeacherID = ?
            ORDER BY s.SessionDate DESC
        `, [req.user.ID]);
        res.json(rows);
    } catch (err) {
        res.status(500).json('Fetch failed');
    }
});

// Get all content (Assignments & Resources) for the teacher
router.get('/teacher/content', async (req, res) => {
    if (req.user.Role === 'Student') return res.status(403).json('Forbidden');
    try {
        const [assignments] = await con.execute(`
            SELECT a.*, c.Name as CourseName, 'assignment' as ContentType
            FROM LMS_Assignments a
            JOIN LMS_Courses c ON a.CourseID = c.ID
            WHERE a.TeacherID = ?
            ORDER BY a.CreatedAt DESC
        `, [req.user.ID]);

        const [resources] = await con.execute(`
            SELECT r.*, c.Name as CourseName, 'resource' as ContentType
            FROM LMS_Resources r
            JOIN LMS_Courses c ON r.CourseID = c.ID
            WHERE r.TeacherID = ?
            ORDER BY r.CreatedAt DESC
        `, [req.user.ID]);

        res.json({ assignments, resources });
    } catch (err) {
        res.status(500).json('Fetch failed');
    }
});

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
        const { courseId, title, description, sessionDate, date, durationMinutes, duration, zoomLink } = req.body;

        // Sanitize: replace empty strings / undefined with null or defaults
        const safeStr = (v) => (v !== undefined && v !== '' ? v : null);
        const safeInt = (v, def) => (v !== undefined && v !== '' && !isNaN(v) ? parseInt(v) : def);

        // Map frontend fields (date/duration) to backend fields (sessionDate/durationMinutes) if needed
        const finalDate = safeStr(sessionDate || date);
        const finalDuration = safeInt(durationMinutes || duration, 60);

        await con.execute(`
            INSERT INTO LMS_Sessions (CourseID, TeacherID, Title, Description, SessionDate, DurationMinutes, ZoomLink)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [
            safeStr(courseId),
            req.user.ID,
            safeStr(title),
            safeStr(description),
            finalDate,
            finalDuration,
            safeStr(zoomLink)
        ]);
        res.json('Session scheduled');
    } catch (err) {
        console.error(err);
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

        // Sanitize: replace empty strings / undefined with null or defaults
        const safeStr = (v) => (v !== undefined && v !== '' ? v : null);
        const safeInt = (v, def) => (v !== undefined && v !== '' && !isNaN(v) ? parseInt(v) : def);

        let resolvedFileURL = fileURL || null;
        if (resolvedFileURL && resolvedFileURL.startsWith('data:')) {
            resolvedFileURL = await uploadToCloudinary(resolvedFileURL, 'lms_assignments');
        }

        await con.execute(
            `INSERT INTO LMS_Assignments 
            (TeacherID, CourseID, Type, Title, Description, Questions, FileURL, DueDate, MaxMarks, PassingMarks, TimeLimitMinutes) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                req.user.ID,
                safeStr(courseId),
                type || 'assignment',
                safeStr(title),
                safeStr(description),
                questions ? JSON.stringify(questions) : null,
                resolvedFileURL,
                safeStr(dueDate),
                safeInt(maxMarks, 100),
                safeInt(passingMarks, 40),
                safeInt(timeLimitMinutes, 0)
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

// Get MY submissions for a specific course (Student only)
router.get('/my-submissions/:courseId', async (req, res) => {
    try {
        const [rows] = await con.execute(`
            SELECT s.*, a.Title as AssignmentTitle
            FROM LMS_Submissions s
            JOIN LMS_Assignments a ON s.AssignmentID = a.ID
            WHERE s.StudentID = ? AND a.CourseID = ?
        `, [req.user.ID, req.params.courseId]);
        res.json(rows);
    } catch (err) {
        console.error(err);
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

// ─── RESOURCES (Handouts, PDFs) ───────────────────────────────────────────

// Get resources for a course
router.get('/resources/:courseId', async (req, res) => {
    try {
        const [rows] = await con.execute(`
            SELECT r.*, u.Name as TeacherName
            FROM LMS_Resources r
            JOIN Users u ON r.TeacherID = u.ID
            WHERE r.CourseID = ?
            ORDER BY r.CreatedAt DESC
        `, [req.params.courseId]);
        res.json(rows);
    } catch (err) {
        res.status(500).json('Fetch failed');
    }
});

// Create resource (Teacher/Admin only)
router.post('/resources', async (req, res) => {
    if (req.user.Role === 'Student') return res.status(403).json('Forbidden');
    try {
        const { courseId, title, description, fileURL, fileType } = req.body;

        let resolvedFileURL = fileURL;
        if (resolvedFileURL && resolvedFileURL.startsWith('data:')) {
            resolvedFileURL = await uploadToCloudinary(resolvedFileURL, 'lms_resources');
        }

        await con.execute(`
            INSERT INTO LMS_Resources (CourseID, TeacherID, Title, Description, FileURL, FileType)
            VALUES (?, ?, ?, ?, ?, ?)
        `, [courseId, req.user.ID, title, description, resolvedFileURL, fileType || 'PDF']);
        res.json('Resource uploaded');
    } catch (err) {
        res.status(500).json('Upload failed');
    }
});

// ─── ANNOUNCEMENTS ────────────────────────────────────────────────────────

// Get announcements for a course
router.get('/announcements/:courseId', async (req, res) => {
    try {
        const [rows] = await con.execute(`
            SELECT a.*, u.Name as AuthorName
            FROM LMS_Announcements a
            JOIN Users u ON a.AuthorID = u.ID
            WHERE a.CourseID = ?
            ORDER BY a.CreatedAt DESC
        `, [req.params.courseId]);
        res.json(rows);
    } catch (err) {
        res.status(500).json('Fetch failed');
    }
});

// Create announcement
router.post('/announcements', async (req, res) => {
    if (req.user.Role === 'Student') return res.status(403).json('Forbidden');
    try {
        const { courseId, title, content } = req.body;
        await con.execute(`
            INSERT INTO LMS_Announcements (CourseID, AuthorID, Title, Content)
            VALUES (?, ?, ?, ?)
        `, [courseId, req.user.ID, title, content]);
        res.json('Announcement posted');
    } catch (err) {
        res.status(500).json('Posting failed');
    }
});

module.exports = router;
