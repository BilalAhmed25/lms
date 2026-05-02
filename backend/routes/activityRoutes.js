var express = require('express'),
    moment = require('moment'),
    fs = require('fs'),
    path = require('path'),
    multer = require('multer'),
    router = express.Router()
    ;

const { con } = require('../database');
const authenticateToken = require('../authenticateToken');
// Communication Helpers consolidated into CommHelper
const CommHelper = require('../communicationHelper');

router.post('/send-test-sms', authenticateToken, async (req, res) => {
    try {
        const { recipient, message, adminID } = req.body;
        if (!recipient || !message || !adminID) return res.status(400).json('Missing params');

        const success = await CommHelper.dispatchSMS(adminID, recipient, message);
        res.json({ success, message: success ? 'SMS Command Dispatched' : 'Socket for Admin not found' });
    } catch (err) {
        res.status(500).json(err.message);
    }
});

router.get('/sms-logs', authenticateToken, async (req, res) => {
    try {
        const query = `
            SELECT ID as logId, Recipient as recipient, Message as message, Status as status, Timestamp as timestamp 
            FROM CommunicationLogs 
            WHERE SchoolID = ? AND Type = 'SMS'
            ORDER BY Timestamp DESC 
            LIMIT 50
        `;
        const [rows] = await con.execute(query, [req.user.SchoolID]);
        res.json(rows);
    } catch (err) {
        res.status(500).json(err.message);
    }
});

router.get('/pending-sms', authenticateToken, async (req, res) => {
    try {
        const [logs] = await con.execute('SELECT ID as logId, Recipient as recipient, Message as message FROM CommunicationLogs WHERE SchoolID = ? AND Type = "SMS" AND Status = "dispatched"', [req.user.SchoolID]);
        res.json({ success: true, pendingMessages: logs });
    } catch (e) {
        console.error(e);
        res.status(500).json({ success: false, pendingMessages: [] });
    }
});

router.post('/update-sms-status', authenticateToken, async (req, res) => {
    try {
        const { logId, status } = req.body;
        await con.execute('UPDATE CommunicationLogs SET Status = ? WHERE ID = ? AND SchoolID = ?', [status, logId, req.user.SchoolID]);
        res.json({ success: true });
    } catch(e) {
        console.error('Error updating SMS status', e);
        res.status(500).json({ success: false });
    }
});

router.use(authenticateToken);

// TIMETABLE
router.post('/timetable', async function (req, res) {
    try {
        const { teacherAllocationID, dayOfWeek, startTime, endTime } = req.body;
        if (!teacherAllocationID || !dayOfWeek || !startTime || !endTime) {
            return res.status(400).json('Required fields: teacherAllocationID, dayOfWeek, startTime, endTime');
        }

        const [result] = await con.execute(
            'INSERT INTO Timetables (SchoolID, TeacherAllocationID, DayOfWeek, StartTime, EndTime) VALUES (?, ?, ?, ?, ?)',
            [req.user.SchoolID, teacherAllocationID, dayOfWeek, startTime, endTime]
        );

        res.json('Success');
    } catch (error) {
        console.error("Error creating timetable:", error);
        res.status(500).json('Failed to create timetable');
    }
})

router.get('/timetables', async function (req, res) {
    try {
        const query = `
            SELECT t.*, ta.SubjectID, ta.SectionID, ta.StaffID
            FROM Timetables t
            JOIN TeacherAllocations ta ON t.TeacherAllocationID = ta.ID
            WHERE t.SchoolID = ?
        `;
        const [rows] = await con.execute(query, [req.user.SchoolID]);
        res.json(rows);
    } catch (error) {
        console.error("Error fetching timetables:", error);
        res.status(500).json('Failed to fetch timetables');
    }
})

// ATTENDANCE
router.post('/mark-attendance', async function (req, res) {
    const { date, attendanceData } = req.body;
    if (!date || !Array.isArray(attendanceData)) {
        return res.status(400).json('Date and attendanceData array are required');
    }

    const connection = await con.getConnection();
    try {
        await connection.beginTransaction();

        for (const record of attendanceData) {
            const [exist] = await connection.execute('SELECT ID FROM StudentAttendance WHERE SchoolID = ? AND StudentID = ? AND Date = ?', [req.user.SchoolID, record.studentID, date]);
            if (exist.length > 0) {
                await connection.execute('UPDATE StudentAttendance SET Status = ?, Remarks = ? WHERE ID = ?', [record.status, record.remarks || null, exist[0].ID]);
            } else {
                await connection.execute(
                    'INSERT INTO StudentAttendance (SchoolID, StudentID, Date, Status, Remarks) VALUES (?, ?, ?, ?, ?)',
                    [req.user.SchoolID, record.studentID, date, record.status, record.remarks || null]
                );
            }

            // --- SMS ALERT LOGIC ---
            try {
                // Fetch student parent info concurrently with marking
                const [students] = await connection.execute('SELECT FirstName, LastName, ParentPhone, UserID FROM Students WHERE ID = ?', [record.studentID]);
                if (students.length > 0 && students[0].ParentPhone) {
                    const student = students[0];
                    const smsMessage = `Attendance Alert\n${student.FirstName} ${student.LastName} was marked ${record.status} on ${moment(date).format('DD-MMM-YYYY')}.\nRemarks: ${record.remarks || 'None'}`;

                    // Fire-and-forget SMS dispatch
                    CommHelper.sendSMS({
                        SchoolID: req.user.SchoolID,
                        SenderID: req.user.ID,
                        Recipient: student.ParentPhone,
                        Message: smsMessage
                    });

                    // Fire-and-forget In-App Notification
                    if (student.UserID) {
                        CommHelper.sendNotification({
                            Message: smsMessage,
                            Recipients: [student.UserID.toString()],
                            Type: 'attendance_alert'
                        }).catch(err => console.error("[NOTIF ERROR] Failed to send in-app notification:", err.message));
                    }
                }
            } catch (smsErr) {
                console.error("[SMS ERROR] Failed to trigger parent alert:", smsErr.message);
            }
        }

        await connection.commit();
        res.json('Success');
    } catch (error) {
        await connection.rollback();
        console.error("Error marking attendance:", error);
        res.status(500).json('Failed to record attendance: ' + error.message);
    } finally {
        connection.release();
    }
})

router.get('/attendance', async function (req, res) {
    try {
        const { date, studentID } = req.query;
        let query = 'SELECT * FROM StudentAttendance WHERE SchoolID = ?';
        const params = [req.user.SchoolID];

        if (date) { query += ' AND Date = ?'; params.push(date); }
        if (studentID) { query += ' AND StudentID = ?'; params.push(studentID); }

        const [rows] = await con.execute(query, params);
        res.json(rows);
    } catch (error) {
        console.error("Error fetching attendance:", error);
        res.status(500).json('Failed to fetch attendance');
    }
})

router.get('/attendance-register', async function (req, res) {
    try {
        const { classID, sectionID, startDate, endDate } = req.query;
        if (!classID || !sectionID || !startDate || !endDate) {
            return res.status(400).json('ClassID, SectionID, startDate, and endDate are required');
        }

        const query = `
            SELECT sa.*, s.FirstName, s.LastName, s.RollNumber, s.AdmissionNumber
            FROM StudentAttendance sa
            JOIN Students s ON sa.StudentID = s.ID
            WHERE sa.SchoolID = ? 
            AND s.ClassID = ? 
            AND s.SectionID = ? 
            AND sa.Date BETWEEN ? AND ?
            ORDER BY sa.Date ASC, s.RollNumber ASC
        `;
        const [rows] = await con.execute(query, [req.user.SchoolID, classID, sectionID, startDate, endDate]);
        res.json(rows);
    } catch (error) {
        console.error("Error fetching register:", error);
        res.status(500).json('Failed to fetch attendance register');
    }
})

// LEAVE REQUESTS
router.post('/request-leave', async function (req, res) {
    try {
        const { startDate, endDate, reason } = req.body;
        if (!startDate || !endDate) return res.status(400).json('StartDate and EndDate are required');

        const [result] = await con.execute(
            'INSERT INTO LeaveRequests (SchoolID, UserID, StartDate, EndDate, Reason, Status) VALUES (?, ?, ?, ?, ?, ?)',
            [req.user.SchoolID, req.user.ID, startDate, endDate, reason || null, 'Pending']
        );

        res.json('Success');
    } catch (error) {
        console.error("Error requesting leave:", error);
        res.status(500).json('Failed to request leave');
    }
})

router.get('/leave-requests', async function (req, res) {
    try {
        const [rows] = await con.execute('SELECT * FROM LeaveRequests WHERE SchoolID = ? ORDER BY CreatedAt DESC', [req.user.SchoolID]);
        res.json(rows);
    } catch (error) {
        console.error("Error fetching leave requests:", error);
        res.status(500).json('Failed to fetch leave requests');
    }
})

router.post('/update-leave-status', async function (req, res) {
    try {
        const { leaveID, status } = req.body;
        if (!['Approved', 'Rejected'].includes(status)) return res.status(400).json('Invalid status');

        await con.execute(
            'UPDATE LeaveRequests SET Status = ?, ReviewedBy = ? WHERE ID = ? AND SchoolID = ?',
            [status, req.user.ID, leaveID, req.user.SchoolID]
        );

        res.json('Success');
    } catch (error) {
        console.error("Error updating leave status:", error);
        res.status(500).json('Failed to update leave status');
    }
})

// STAFF ATTENDANCE
router.get('/staff-attendance', async function (req, res) {
    try {
        const { date } = req.query;
        if (!date) return res.status(400).json('Date is required');

        const [rows] = await con.execute('SELECT * FROM StaffAttendance WHERE SchoolID = ? AND Date = ?', [req.user.SchoolID, date]);
        res.json(rows);
    } catch (error) {
        console.error("Error fetching staff attendance:", error);
        res.status(500).json('Failed to fetch staff attendance: ' + error.sqlMessage || error.message);
    }
});

router.post('/mark-staff-attendance', async function (req, res) {
    const { date, attendanceData } = req.body;
    if (!date || !Array.isArray(attendanceData)) {
        return res.status(400).json('Date and attendanceData array are required');
    }

    const connection = await con.getConnection();
    try {
        await connection.beginTransaction();

        for (const record of attendanceData) {
            const [exist] = await connection.execute('SELECT ID FROM StaffAttendance WHERE SchoolID = ? AND StaffID = ? AND Date = ?', [req.user.SchoolID, record.staffID, date]);
            if (exist.length > 0) {
                await connection.execute('UPDATE StaffAttendance SET Status = ?, Remarks = ? WHERE ID = ?', [record.status, record.remarks || null, exist[0].ID]);
            } else {
                await connection.execute(
                    'INSERT INTO StaffAttendance (SchoolID, StaffID, Date, Status, Remarks) VALUES (?, ?, ?, ?, ?)',
                    [req.user.SchoolID, record.staffID, date, record.status, record.remarks || null]
                );
            }
        }

        await connection.commit();
        res.json('Success');
    } catch (error) {
        await connection.rollback();
        console.error("Error marking staff attendance:", error);
        res.status(500).json('Failed to record staff attendance: ' + error.sqlMessage || error.message);
    } finally {
        connection.release();
    }
});

module.exports = router;
