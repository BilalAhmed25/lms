var express = require('express'),
    router = express.Router();

const { con } = require('../database');
const { uploadToCloudinary } = require('../cloudinaryHelper');
const authenticateToken = require('../authenticateToken');
const NotificationService = require('../notificationService');

router.use(authenticateToken);

// ─── Helper: resolve StaffID from UserID (for teachers) ───────────────────────
async function getStaffID(userID) {
    const [rows] = await con.execute('SELECT ID FROM Staff WHERE UserID = ?', [userID]);
    return rows.length > 0 ? rows[0].ID : null;
}

// ─── RBAC helpers ──────────────────────────────────────────────────────────────
const isAdminOrTeacher = (req) => req.user.RoleID === 2 || req.user.RoleID === 3;
const isAdmin          = (req) => req.user.RoleID === 2;
const isTeacher        = (req) => req.user.RoleID === 3;
const isStudent        = (req) => req.user.RoleID === 4;

// ══════════════════════════════════════════════════════════════════════════════
// ASSIGNMENTS
// ══════════════════════════════════════════════════════════════════════════════

// GET /lms/assignments  — Teacher sees own, Admin sees all, Student sees their class
router.get('/assignments', async function (req, res) {
    try {
        let query = `
            SELECT a.*, 
                CONCAT(st.FirstName, ' ', st.LastName) as TeacherName,
                c.Name as ClassName, 
                sec.Name as SectionName,
                s.Name as SubjectName,
                (SELECT COUNT(*) FROM LMS_AssignmentSubmissions sub WHERE sub.AssignmentID = a.ID) as SubmissionCount
            FROM LMS_Assignments a
            JOIN Staff st ON a.StaffID = st.ID
            JOIN Classes c ON a.ClassID = c.ID
            LEFT JOIN Sections sec ON a.SectionID = sec.ID
            JOIN Subjects s ON a.SubjectID = s.ID
            WHERE a.SchoolID = ?
        `;
        const params = [req.user.SchoolID];

        if (isTeacher(req)) {
            const staffID = await getStaffID(req.user.ID);
            if (!staffID) return res.status(403).json('Teacher profile not found');
            query += ' AND a.StaffID = ?';
            params.push(staffID);
        } else if (isStudent(req)) {
            // Students see assignments for their class/section
            const [student] = await con.execute('SELECT ClassID, SectionID FROM Students WHERE UserID = ?', [req.user.ID]);
            if (student.length === 0) return res.status(404).json('Student profile not found');
            query += ' AND a.ClassID = ? AND (a.SectionID IS NULL OR a.SectionID = ?) AND a.Status = "active"';
            params.push(student[0].ClassID, student[0].SectionID);
        }

        query += ' ORDER BY a.DueDate ASC';
        const [rows] = await con.execute(query, params);
        res.json(rows);
    } catch (error) {
        console.error('GET /lms/assignments error:', error);
        res.status(500).json('Failed to fetch assignments');
    }
});

// POST /lms/assignments  — Teacher / Admin only
router.post('/assignments', async function (req, res) {
    if (!isAdminOrTeacher(req)) return res.status(403).json('Forbidden');
    try {
        const { classID, sectionID, subjectID, title, description, fileURL, dueDate, maxMarks } = req.body;
        if (!classID || !subjectID || !title || !dueDate) return res.status(400).json('classID, subjectID, title and dueDate are required');

        let staffID;
        if (isAdmin(req)) {
            staffID = req.body.staffID || await getStaffID(req.user.ID);
        } else {
            staffID = await getStaffID(req.user.ID);
        }
        if (!staffID) return res.status(400).json('Could not resolve staff profile');

        // Upload file to Cloudinary if base64 is provided
        let resolvedFileURL = fileURL || null;
        if (resolvedFileURL && resolvedFileURL.startsWith('data:')) {
            const uploaded = await uploadToCloudinary(resolvedFileURL, 'lms_assignments');
            if (uploaded) resolvedFileURL = uploaded;
        }

        await con.execute(
            'INSERT INTO LMS_Assignments (SchoolID, StaffID, ClassID, SectionID, SubjectID, Title, Description, FileURL, DueDate, MaxMarks) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [req.user.SchoolID, staffID, classID, sectionID || null, subjectID, title, description || null, resolvedFileURL, dueDate, maxMarks || 100]
        );

        // Async Notification
        NotificationService.notifyNewLmsItem(req.user.SchoolID, classID, sectionID, 'Assignment', title, subjectID, dueDate, req.user.ID);

        res.json('Assignment created');
    } catch (error) {
        console.error('POST /lms/assignments error:', error);
        res.status(500).json('Failed to create assignment');
    }
});

// PUT /lms/assignments/:id
router.put('/assignments/:id', async function (req, res) {
    if (!isAdminOrTeacher(req)) return res.status(403).json('Forbidden');
    try {
        const { classID, sectionID, subjectID, title, description, fileURL, dueDate, maxMarks, status } = req.body;

        let scopeClause = 'SchoolID = ?';
        const params = [req.user.SchoolID];

        if (isTeacher(req)) {
            const staffID = await getStaffID(req.user.ID);
            scopeClause += ' AND StaffID = ?';
            params.push(staffID);
        }

        // Upload new file to Cloudinary if base64 provided
        let resolvedFileURL = fileURL || null;
        if (resolvedFileURL && resolvedFileURL.startsWith('data:')) {
            const uploaded = await uploadToCloudinary(resolvedFileURL, 'lms_assignments');
            if (uploaded) resolvedFileURL = uploaded;
        }

        await con.execute(
            `UPDATE LMS_Assignments SET ClassID=?, SectionID=?, SubjectID=?, Title=?, Description=?, FileURL=?, DueDate=?, MaxMarks=?, Status=? WHERE ID=? AND ${scopeClause}`,
            [classID, sectionID || null, subjectID, title, description || null, resolvedFileURL, dueDate, maxMarks || 100, status || 'active', req.params.id, ...params]
        );
        res.json('Assignment updated');
    } catch (error) {
        console.error('PUT /lms/assignments/:id error:', error);
        res.status(500).json('Failed to update assignment');
    }
});

// DELETE /lms/assignments/:id
router.delete('/assignments/:id', async function (req, res) {
    if (!isAdminOrTeacher(req)) return res.status(403).json('Forbidden');
    try {
        let scopeClause = 'SchoolID = ?';
        const params = [req.user.SchoolID];

        if (isTeacher(req)) {
            const staffID = await getStaffID(req.user.ID);
            scopeClause += ' AND StaffID = ?';
            params.push(staffID);
        }

        await con.execute(`DELETE FROM LMS_Assignments WHERE ID = ? AND ${scopeClause}`, [req.params.id, ...params]);
        res.json('Assignment deleted');
    } catch (error) {
        res.status(500).json('Failed to delete assignment');
    }
});

// ─── ASSIGNMENT SUBMISSIONS ────────────────────────────────────────────────────

// GET /lms/submissions?assignmentID=
router.get('/submissions', async function (req, res) {
    try {
        const { assignmentID } = req.query;
        let query = `
            SELECT sub.*,
                CONCAT(st.FirstName, ' ', st.LastName) as StudentName,
                st.AdmissionNumber, st.RollNumber,
                a.Title as AssignmentTitle, a.MaxMarks, a.DueDate
            FROM LMS_AssignmentSubmissions sub
            JOIN Students st ON sub.StudentID = st.ID
            JOIN LMS_Assignments a ON sub.AssignmentID = a.ID
            WHERE a.SchoolID = ?
        `;
        const params = [req.user.SchoolID];

        if (isTeacher(req)) {
            const staffID = await getStaffID(req.user.ID);
            query += ' AND a.StaffID = ?';
            params.push(staffID);
        } else if (isStudent(req)) {
            const [student] = await con.execute('SELECT ID FROM Students WHERE UserID = ?', [req.user.ID]);
            if (student.length === 0) return res.status(404).json('Student not found');
            query += ' AND sub.StudentID = ? AND sub.MarksPublished = 1';
            params.push(student[0].ID);
        }

        if (assignmentID) { query += ' AND sub.AssignmentID = ?'; params.push(assignmentID); }
        query += ' ORDER BY sub.SubmittedAt DESC';

        const [rows] = await con.execute(query, params);
        res.json(rows);
    } catch (error) {
        console.error('GET /lms/submissions error:', error);
        res.status(500).json('Failed to fetch submissions');
    }
});

// GET /lms/my-submission?assignmentID=  — student's own (even unpublished)
router.get('/my-submission', async function (req, res) {
    if (!isStudent(req)) return res.status(403).json('Students only');
    try {
        const { assignmentID } = req.query;
        const [student] = await con.execute('SELECT ID FROM Students WHERE UserID = ?', [req.user.ID]);
        if (student.length === 0) return res.status(404).json('Student not found');

        const [rows] = await con.execute(
            'SELECT * FROM LMS_AssignmentSubmissions WHERE StudentID = ? AND AssignmentID = ?',
            [student[0].ID, assignmentID]
        );
        res.json(rows[0] || null);
    } catch (error) {
        res.status(500).json('Failed to fetch submission');
    }
});

// POST /lms/submissions  — Student submits
router.post('/submissions', async function (req, res) {
    if (!isStudent(req)) return res.status(403).json('Students only');
    try {
        const { assignmentID, fileURL, textResponse } = req.body;
        if (!assignmentID) return res.status(400).json('assignmentID is required');

        const [student] = await con.execute('SELECT ID FROM Students WHERE UserID = ?', [req.user.ID]);
        if (student.length === 0) return res.status(404).json('Student profile not found');
        const studentID = student[0].ID;

        // Upsert – allow resubmission before deadline
        const [existing] = await con.execute(
            'SELECT ID FROM LMS_AssignmentSubmissions WHERE AssignmentID = ? AND StudentID = ?',
            [assignmentID, studentID]
        );
        if (existing.length > 0) {
            await con.execute(
                'UPDATE LMS_AssignmentSubmissions SET FileURL=?, TextResponse=?, SubmittedAt=NOW() WHERE ID=?',
                [fileURL || null, textResponse || null, existing[0].ID]
            );
        } else {
            await con.execute(
                'INSERT INTO LMS_AssignmentSubmissions (AssignmentID, StudentID, FileURL, TextResponse) VALUES (?, ?, ?, ?)',
                [assignmentID, studentID, fileURL || null, textResponse || null]
            );
        }
        res.json('Submission saved');
    } catch (error) {
        console.error('POST /lms/submissions error:', error);
        res.status(500).json('Failed to submit');
    }
});

// PUT /lms/submissions/:id/grade  — Teacher/Admin grades
router.put('/submissions/:id/grade', async function (req, res) {
    if (!isAdminOrTeacher(req)) return res.status(403).json('Forbidden');
    try {
        const { marks, feedback } = req.body;
        await con.execute(
            'UPDATE LMS_AssignmentSubmissions SET Marks=?, Feedback=? WHERE ID=?',
            [marks, feedback || null, req.params.id]
        );
        res.json('Graded');
    } catch (error) {
        res.status(500).json('Failed to grade');
    }
});

// PUT /lms/submissions/:id/publish  — publish marks to student
router.put('/submissions/:id/publish', async function (req, res) {
    if (!isAdminOrTeacher(req)) return res.status(403).json('Forbidden');
    try {
        await con.execute(
            'UPDATE LMS_AssignmentSubmissions SET MarksPublished=1 WHERE ID=?',
            [req.params.id]
        );

        // Notify Student
        const [sub] = await con.execute('SELECT s.StudentID, s.Marks, a.Title, a.MaxMarks, s.GradeRemarks FROM LMS_AssignmentSubmissions s JOIN LMS_Assignments a ON s.AssignmentID = a.ID WHERE s.ID = ?', [req.params.id]);
        if (sub.length > 0) {
            NotificationService.notifyGradesPublished(req.user.SchoolID, sub[0].StudentID, sub[0].Title, sub[0].Marks, sub[0].MaxMarks, sub[0].GradeRemarks, req.user.ID);
        }

        res.json('Published');
    } catch (error) {
        res.status(500).json('Failed to publish');
    }
});

// PUT /lms/submissions/publish-all  — bulk publish for an assignment
router.put('/submissions/publish-all', async function (req, res) {
    if (!isAdminOrTeacher(req)) return res.status(403).json('Forbidden');
    try {
        const { assignmentID } = req.body;
        await con.execute(
            'UPDATE LMS_AssignmentSubmissions SET MarksPublished=1 WHERE AssignmentID=?',
            [assignmentID]
        );
        res.json('All marks published');
    } catch (error) {
        res.status(500).json('Failed to publish all');
    }
});

// ══════════════════════════════════════════════════════════════════════════════
// ASSESSMENTS
// ══════════════════════════════════════════════════════════════════════════════

// GET /lms/assessments
router.get('/assessments', async function (req, res) {
    try {
        let query = `
            SELECT a.*,
                CONCAT(st.FirstName, ' ', st.LastName) as TeacherName,
                c.Name as ClassName,
                sec.Name as SectionName,
                s.Name as SubjectName,
                (SELECT COUNT(*) FROM LMS_AssessmentSubmissions asub WHERE asub.AssessmentID = a.ID) as SubmissionCount
            FROM LMS_Assessments a
            JOIN Staff st ON a.StaffID = st.ID
            JOIN Classes c ON a.ClassID = c.ID
            LEFT JOIN Sections sec ON a.SectionID = sec.ID
            JOIN Subjects s ON a.SubjectID = s.ID
            WHERE a.SchoolID = ?
        `;
        const params = [req.user.SchoolID];

        if (isTeacher(req)) {
            const staffID = await getStaffID(req.user.ID);
            if (!staffID) return res.status(403).json('Teacher profile not found');
            query += ' AND a.StaffID = ?';
            params.push(staffID);
        } else if (isStudent(req)) {
            const [student] = await con.execute('SELECT ClassID, SectionID FROM Students WHERE UserID = ?', [req.user.ID]);
            if (student.length === 0) return res.status(404).json('Student not found');
            query += ' AND a.ClassID = ? AND (a.SectionID IS NULL OR a.SectionID = ?) AND a.Status = "active"';
            params.push(student[0].ClassID, student[0].SectionID);
        }

        query += ' ORDER BY a.StartDateTime DESC';
        const [rows] = await con.execute(query, params);
        // Strip Questions for non-teachers (security: students shouldn't see correct answers before submitting)
        if (isStudent(req)) {
            rows.forEach(r => {
                if (r.Questions) {
                    try {
                        const q = typeof r.Questions === 'string' ? JSON.parse(r.Questions) : r.Questions;
                        r.Questions = JSON.stringify(q.map(({ correctAnswer, ...rest }) => rest));
                    } catch { /* leave as-is */ }
                }
            });
        }
        res.json(rows);
    } catch (error) {
        console.error('GET /lms/assessments error:', error);
        res.status(500).json('Failed to fetch assessments');
    }
});

// POST /lms/assessments
router.post('/assessments', async function (req, res) {
    if (!isAdminOrTeacher(req)) return res.status(403).json('Forbidden');
    try {
        const { classID, sectionID, subjectID, title, description, assessmentType, timeLimitMinutes, cameraRestriction, totalMarks, startDateTime, endDateTime, status, questions } = req.body;
        if (!classID || !subjectID || !title || !assessmentType) return res.status(400).json('Required fields missing');

        let staffID;
        if (isAdmin(req)) {
            staffID = req.body.staffID || await getStaffID(req.user.ID);
        } else {
            staffID = await getStaffID(req.user.ID);
        }
        if (!staffID) return res.status(400).json('Could not resolve staff profile');

        await con.execute(
            `INSERT INTO LMS_Assessments (SchoolID, StaffID, ClassID, SectionID, SubjectID, Title, Description, AssessmentType, TimeLimitMinutes, CameraRestriction, TotalMarks, StartDateTime, EndDateTime, Status, Questions)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [req.user.SchoolID, staffID, classID, sectionID || null, subjectID, title, description || null, assessmentType, timeLimitMinutes || null, cameraRestriction ? 1 : 0, totalMarks || 100, startDateTime || null, endDateTime || null, status || 'draft', questions ? JSON.stringify(questions) : null]
        );

        // Async Notification (only if published/active)
        if (status !== 'draft') {
            NotificationService.notifyNewLmsItem(req.user.SchoolID, classID, sectionID, 'Assessment', title, subjectID, startDateTime || endDateTime, req.user.ID);
        }

        res.json('Assessment created');
    } catch (error) {
        console.error('POST /lms/assessments error:', error);
        res.status(500).json('Failed to create assessment');
    }
});

// PUT /lms/assessments/:id
router.put('/assessments/:id', async function (req, res) {
    if (!isAdminOrTeacher(req)) return res.status(403).json('Forbidden');
    try {
        const { classID, sectionID, subjectID, title, description, assessmentType, timeLimitMinutes, cameraRestriction, totalMarks, startDateTime, endDateTime, status, questions } = req.body;

        let scopeClause = 'SchoolID = ?';
        const params = [req.user.SchoolID];

        if (isTeacher(req)) {
            const staffID = await getStaffID(req.user.ID);
            scopeClause += ' AND StaffID = ?';
            params.push(staffID);
        }

        await con.execute(
            `UPDATE LMS_Assessments SET ClassID=?, SectionID=?, SubjectID=?, Title=?, Description=?, AssessmentType=?, TimeLimitMinutes=?, CameraRestriction=?, TotalMarks=?, StartDateTime=?, EndDateTime=?, Status=?, Questions=?
             WHERE ID=? AND ${scopeClause}`,
            [classID, sectionID || null, subjectID, title, description || null, assessmentType, timeLimitMinutes || null, cameraRestriction ? 1 : 0, totalMarks || 100, startDateTime || null, endDateTime || null, status || 'draft', questions ? JSON.stringify(questions) : null, req.params.id, ...params]
        );
        res.json('Assessment updated');
    } catch (error) {
        console.error('PUT /lms/assessments/:id error:', error);
        res.status(500).json('Failed to update assessment');
    }
});

// DELETE /lms/assessments/:id
router.delete('/assessments/:id', async function (req, res) {
    if (!isAdminOrTeacher(req)) return res.status(403).json('Forbidden');
    try {
        let scopeClause = 'SchoolID = ?';
        const params = [req.user.SchoolID];
        if (isTeacher(req)) {
            const staffID = await getStaffID(req.user.ID);
            scopeClause += ' AND StaffID = ?';
            params.push(staffID);
        }
        await con.execute(`DELETE FROM LMS_Assessments WHERE ID = ? AND ${scopeClause}`, [req.params.id, ...params]);
        res.json('Assessment deleted');
    } catch (error) {
        res.status(500).json('Failed to delete assessment');
    }
});

// ─── ASSESSMENT SUBMISSIONS ───────────────────────────────────────────────────

// GET /lms/assessment-submissions?assessmentID=
router.get('/assessment-submissions', async function (req, res) {
    try {
        const { assessmentID } = req.query;
        let query = `
            SELECT asub.*,
                CONCAT(st.FirstName, ' ', st.LastName) as StudentName,
                st.AdmissionNumber, st.RollNumber,
                a.Title as AssessmentTitle, a.TotalMarks, a.AssessmentType
            FROM LMS_AssessmentSubmissions asub
            JOIN Students st ON asub.StudentID = st.ID
            JOIN LMS_Assessments a ON asub.AssessmentID = a.ID
            WHERE a.SchoolID = ?
        `;
        const params = [req.user.SchoolID];

        if (isTeacher(req)) {
            const staffID = await getStaffID(req.user.ID);
            query += ' AND a.StaffID = ?';
            params.push(staffID);
        } else if (isStudent(req)) {
            const [student] = await con.execute('SELECT ID FROM Students WHERE UserID = ?', [req.user.ID]);
            if (student.length === 0) return res.status(404).json('Student not found');
            query += ' AND asub.StudentID = ? AND asub.MarksPublished = 1';
            params.push(student[0].ID);
        }

        if (assessmentID) { query += ' AND asub.AssessmentID = ?'; params.push(assessmentID); }
        query += ' ORDER BY asub.SubmittedAt DESC';

        const [rows] = await con.execute(query, params);
        res.json(rows);
    } catch (error) {
        console.error('GET /lms/assessment-submissions error:', error);
        res.status(500).json('Failed to fetch assessment submissions');
    }
});

// GET /lms/my-assessment-submission?assessmentID=
router.get('/my-assessment-submission', async function (req, res) {
    if (!isStudent(req)) return res.status(403).json('Students only');
    try {
        const { assessmentID } = req.query;
        const [student] = await con.execute('SELECT ID FROM Students WHERE UserID = ?', [req.user.ID]);
        if (student.length === 0) return res.status(404).json('Student not found');

        const [rows] = await con.execute(
            'SELECT * FROM LMS_AssessmentSubmissions WHERE StudentID = ? AND AssessmentID = ?',
            [student[0].ID, assessmentID]
        );
        res.json(rows[0] || null);
    } catch (error) {
        res.status(500).json('Failed to fetch submission');
    }
});

// POST /lms/assessment-submissions  — Student submits exam
router.post('/assessment-submissions', async function (req, res) {
    if (!isStudent(req)) return res.status(403).json('Students only');
    try {
        const { assessmentID, answers } = req.body;
        if (!assessmentID) return res.status(400).json('assessmentID is required');

        const [student] = await con.execute('SELECT ID FROM Students WHERE UserID = ?', [req.user.ID]);
        if (student.length === 0) return res.status(404).json('Student profile not found');
        const studentID = student[0].ID;

        // Prevent double submission
        const [existing] = await con.execute(
            'SELECT ID FROM LMS_AssessmentSubmissions WHERE AssessmentID = ? AND StudentID = ?',
            [assessmentID, studentID]
        );
        if (existing.length > 0) return res.status(400).json('Already submitted');

        // Auto-grade MCQ
        let autoScore = null;
        const [assessmentRows] = await con.execute('SELECT AssessmentType, Questions, TotalMarks FROM LMS_Assessments WHERE ID = ?', [assessmentID]);
        if (assessmentRows.length > 0 && assessmentRows[0].AssessmentType === 'MCQ') {
            const questions = typeof assessmentRows[0].Questions === 'string' ? JSON.parse(assessmentRows[0].Questions) : assessmentRows[0].Questions;
            const studentAnswers = typeof answers === 'string' ? JSON.parse(answers) : (answers || []);
            let correct = 0;
            let totalPossible = 0;
            questions.forEach((q, idx) => {
                const qMarks = parseFloat(q.marks) || (parseFloat(assessmentRows[0].TotalMarks) / questions.length);
                totalPossible += qMarks;
                const studentAns = studentAnswers.find(a => a.questionIndex === idx);
                if (studentAns && studentAns.answer === q.correctAnswer) {
                    correct += qMarks;
                }
            });
            autoScore = correct;
        }

        await con.execute(
            'INSERT INTO LMS_AssessmentSubmissions (AssessmentID, StudentID, Answers, AutoScore, StartedAt, SubmittedAt) VALUES (?, ?, ?, ?, NOW(), NOW())',
            [assessmentID, studentID, answers ? JSON.stringify(answers) : null, autoScore]
        );
        res.json({ message: 'Submitted', autoScore });
    } catch (error) {
        console.error('POST /lms/assessment-submissions error:', error);
        res.status(500).json('Failed to submit assessment');
    }
});

// PUT /lms/assessment-submissions/:id/grade  — Manual grading (Text type)
router.put('/assessment-submissions/:id/grade', async function (req, res) {
    if (!isAdminOrTeacher(req)) return res.status(403).json('Forbidden');
    try {
        const { manualScore, feedback } = req.body;
        await con.execute(
            'UPDATE LMS_AssessmentSubmissions SET ManualScore=?, Feedback=? WHERE ID=?',
            [manualScore, feedback || null, req.params.id]
        );
        res.json('Graded');
    } catch (error) {
        res.status(500).json('Failed to grade');
    }
});

// PUT /lms/assessment-submissions/:id/publish
router.put('/assessment-submissions/:id/publish', async function (req, res) {
    if (!isAdminOrTeacher(req)) return res.status(403).json('Forbidden');
    try {
        await con.execute(
            'UPDATE LMS_AssessmentSubmissions SET MarksPublished=1 WHERE ID=?',
            [req.params.id]
        );
        res.json('Published');
    } catch (error) {
        res.status(500).json('Failed to publish');
    }
});

// PUT /lms/assessment-submissions/publish-all
router.put('/assessment-submissions/publish-all', async function (req, res) {
    if (!isAdminOrTeacher(req)) return res.status(403).json('Forbidden');
    try {
        const { assessmentID } = req.body;
        await con.execute(
            'UPDATE LMS_AssessmentSubmissions SET MarksPublished=1 WHERE AssessmentID=?',
            [assessmentID]
        );
        res.json('All marks published');
    } catch (error) {
        res.status(500).json('Failed to publish all');
    }
});

// ══════════════════════════════════════════════════════════════════════════════
// RESULTS  — Student performance summary (all published marks)
// ══════════════════════════════════════════════════════════════════════════════
router.get('/results', async function (req, res) {
    if (!isStudent(req)) return res.status(403).json('Students only');
    try {
        const [student] = await con.execute('SELECT ID FROM Students WHERE UserID = ?', [req.user.ID]);
        if (student.length === 0) return res.status(404).json('Student not found');
        const studentID = student[0].ID;

        const [assignments] = await con.execute(`
            SELECT 'assignment' as Type, a.Title, a.MaxMarks as TotalMarks, s.Name as SubjectName,
                   sub.Marks as Score, sub.Feedback, sub.SubmittedAt, a.DueDate as Deadline
            FROM LMS_AssignmentSubmissions sub
            JOIN LMS_Assignments a ON sub.AssignmentID = a.ID
            JOIN Subjects s ON a.SubjectID = s.ID
            WHERE sub.StudentID = ? AND sub.MarksPublished = 1
        `, [studentID]);

        const [assessments] = await con.execute(`
            SELECT 'assessment' as Type, a.Title, a.TotalMarks, s.Name as SubjectName, a.AssessmentType,
                   COALESCE(asub.ManualScore, asub.AutoScore) as Score, asub.Feedback, asub.SubmittedAt, a.EndDateTime as Deadline
            FROM LMS_AssessmentSubmissions asub
            JOIN LMS_Assessments a ON asub.AssessmentID = a.ID
            JOIN Subjects s ON a.SubjectID = s.ID
            WHERE asub.StudentID = ? AND asub.MarksPublished = 1
        `, [studentID]);

        res.json({ assignments, assessments });
    } catch (error) {
        console.error('GET /lms/results error:', error);
        res.status(500).json('Failed to fetch results');
    }
});

// ══════════════════════════════════════════════════════════════════════════════
// GRADEBOOK  — Teacher/Admin overview
// ══════════════════════════════════════════════════════════════════════════════
router.get('/gradebook', async function (req, res) {
    if (!isAdminOrTeacher(req)) return res.status(403).json('Forbidden');
    try {
        const { type, id } = req.query; // type: 'assignment' | 'assessment', id: the record ID

        if (type === 'assignment') {
            const [assignment] = await con.execute('SELECT * FROM LMS_Assignments WHERE ID = ? AND SchoolID = ?', [id, req.user.SchoolID]);
            if (assignment.length === 0) return res.status(404).json('Assignment not found');

            // All students in the class/section
            let studentQuery = 'SELECT st.ID, CONCAT(st.FirstName, " ", st.LastName) as Name, st.RollNumber, st.AdmissionNumber FROM Students st WHERE st.ClassID = ? AND st.SchoolID = ?';
            const studentParams = [assignment[0].ClassID, req.user.SchoolID];
            if (assignment[0].SectionID) { studentQuery += ' AND st.SectionID = ?'; studentParams.push(assignment[0].SectionID); }

            const [students] = await con.execute(studentQuery, studentParams);
            const [submissions] = await con.execute('SELECT * FROM LMS_AssignmentSubmissions WHERE AssignmentID = ?', [id]);
            const subMap = {};
            submissions.forEach(s => subMap[s.StudentID] = s);

            const rows = students.map(s => ({ ...s, submission: subMap[s.ID] || null }));
            res.json({ record: assignment[0], rows });

        } else if (type === 'assessment') {
            const [assessment] = await con.execute('SELECT * FROM LMS_Assessments WHERE ID = ? AND SchoolID = ?', [id, req.user.SchoolID]);
            if (assessment.length === 0) return res.status(404).json('Assessment not found');

            let studentQuery = 'SELECT st.ID, CONCAT(st.FirstName, " ", st.LastName) as Name, st.RollNumber, st.AdmissionNumber FROM Students st WHERE st.ClassID = ? AND st.SchoolID = ?';
            const studentParams = [assessment[0].ClassID, req.user.SchoolID];
            if (assessment[0].SectionID) { studentQuery += ' AND st.SectionID = ?'; studentParams.push(assessment[0].SectionID); }

            const [students] = await con.execute(studentQuery, studentParams);
            const [submissions] = await con.execute('SELECT * FROM LMS_AssessmentSubmissions WHERE AssessmentID = ?', [id]);
            const subMap = {};
            submissions.forEach(s => subMap[s.StudentID] = s);

            const rows = students.map(s => ({ ...s, submission: subMap[s.ID] || null }));
            // Strip correct answers before sending
            if (assessment[0].Questions) {
                try {
                    const qs = typeof assessment[0].Questions === 'string' ? JSON.parse(assessment[0].Questions) : assessment[0].Questions;
                    assessment[0].Questions = JSON.stringify(qs.map(({ correctAnswer, ...rest }) => rest));
                } catch { /* leave */ }
            }
            res.json({ record: assessment[0], rows });
        } else {
            return res.status(400).json('type must be assignment or assessment');
        }
    } catch (error) {
        console.error('GET /lms/gradebook error:', error);
        res.status(500).json('Failed to fetch gradebook');
    }
});

// ══════════════════════════════════════════════════════════════════════════════
// ATTENDANCE - Student View
// ══════════════════════════════════════════════════════════════════════════════
router.get('/my-attendance', async (req, res) => {
    if (!isStudent(req)) return res.status(403).json('Students only');
    try {
        const { year, month } = req.query;
        const [studentRows] = await con.execute('SELECT ID FROM Students WHERE UserID = ?', [req.user.ID]);
        if (studentRows.length === 0) return res.status(404).json('Student not found');
        const studentID = studentRows[0].ID;

        let query = 'SELECT * FROM StudentAttendance WHERE StudentID = ? AND SchoolID = ?';
        const params = [studentID, req.user.SchoolID];

        if (year && month) {
            query += ' AND YEAR(Date) = ? AND MONTH(Date) = ?';
            params.push(year, month);
        }

        query += ' ORDER BY Date DESC';
        const [rows] = await con.execute(query, params);
        
        const total = rows.length;
        const present = rows.filter(r => r.Status === 'Present').length;
        const absent = rows.filter(r => r.Status === 'Absent').length;

        res.json({ attendance: rows, summary: { totalDays: total, presentCount: present, absentCount: absent } });
    } catch (err) {
        console.error('GET /lms/my-attendance error:', err);
        res.status(500).json('Failed to fetch attendance');
    }
});

// ══════════════════════════════════════════════════════════════════════════════
// SUBJECTS & TIMETABLE - Student View
// ══════════════════════════════════════════════════════════════════════════════

router.get('/my-subjects', async (req, res) => {
    if (!isStudent(req)) return res.status(403).json('Students only');
    try {
        const [studentRows] = await con.execute('SELECT ClassID, SectionID FROM Students WHERE UserID = ?', [req.user.ID]);
        if (studentRows.length === 0) return res.status(404).json('Student not found');
        const { ClassID, SectionID } = studentRows[0];

        const [subjects] = await con.execute(`
            SELECT s.*, 
                   (SELECT CONCAT(st.FirstName, ' ', st.LastName) 
                    FROM TeacherAssignments ta 
                    JOIN Staff st ON ta.StaffID = st.ID 
                    WHERE ta.SubjectID = s.ID AND ta.ClassID = ? AND (ta.SectionID IS NULL OR ta.SectionID = ?) AND ta.SchoolID = ?
                    LIMIT 1) as TeacherName
            FROM Subjects s
            JOIN ClassSubjects cs ON s.ID = cs.SubjectID
            WHERE cs.ClassID = ? AND s.SchoolID = ? AND s.IsActive = 1
        `, [ClassID, SectionID, req.user.SchoolID, ClassID, req.user.SchoolID]);

        res.json(subjects);
    } catch (err) {
        console.error('GET /lms/my-subjects error:', err);
        res.status(500).json('Failed to fetch subjects');
    }
});

router.get('/my-timetable', async (req, res) => {
    if (!isStudent(req)) return res.status(403).json('Students only');
    try {
        const [studentRows] = await con.execute('SELECT ClassID, SectionID FROM Students WHERE UserID = ?', [req.user.ID]);
        if (studentRows.length === 0) return res.status(404).json('Student not found');
        const { ClassID, SectionID } = studentRows[0];

        const [rows] = await con.execute(`
            SELECT te.*, ts.SlotName, ts.StartTime, ts.EndTime, ts.IsBreak,
                   s.Name as SubjectName,
                   CONCAT(st.FirstName, ' ', st.LastName) as StaffName
            FROM TimetableEntries te
            JOIN TimetableSlots ts ON te.SlotID = ts.ID
            JOIN Subjects s ON te.SubjectID = s.ID
            JOIN Staff st ON te.StaffID = st.ID
            WHERE te.ClassID = ? AND (te.SectionID IS NULL OR te.SectionID = ?) AND te.SchoolID = ?
            ORDER BY te.DayOfWeek, ts.StartTime
        `, [ClassID, SectionID, req.user.SchoolID]);

        res.json(rows);
    } catch (err) {
        console.error('GET /lms/my-timetable error:', err);
        res.status(500).json('Failed to fetch timetable');
    }
});

// ══════════════════════════════════════════════════════════════════════════════
// TEACHER CLASSES & SCHEDULE
// ══════════════════════════════════════════════════════════════════════════════

router.get('/teacher-schedule', async (req, res) => {
    try {
        let staffID = req.query.staffID;
        
        if (isTeacher(req)) {
            const resolvedID = await getStaffID(req.user.ID);
            if (!resolvedID) return res.status(403).json('Staff profile not found');
            staffID = resolvedID;
        } else if (!isAdmin(req)) {
            return res.status(403).json('Forbidden');
        }

        let query = `
            SELECT te.*, ts.SlotName, ts.StartTime, ts.EndTime, ts.IsBreak,
                   s.Name as SubjectName, 
                   c.Name as ClassName, sec.Name as SectionName,
                   CONCAT(st.FirstName, ' ', st.LastName) as StaffName
            FROM TimetableEntries te
            JOIN TimetableSlots ts ON te.SlotID = ts.ID
            JOIN Subjects s ON te.SubjectID = s.ID
            JOIN Staff st ON te.StaffID = st.ID
            JOIN Classes c ON te.ClassID = c.ID
            LEFT JOIN Sections sec ON te.SectionID = sec.ID
            WHERE te.SchoolID = ?
        `;
        const params = [req.user.SchoolID];

        if (staffID) {
            query += ' AND te.StaffID = ?';
            params.push(staffID);
        }

        query += ' ORDER BY te.DayOfWeek, ts.StartTime';
        
        const [rows] = await con.execute(query, params);
        res.json(rows);
    } catch (err) {
        console.error('GET /lms/teacher-schedule error:', err);
        res.status(500).json('Failed to fetch schedule');
    }
});

module.exports = router;
