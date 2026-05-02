var express = require('express'),
    moment = require('moment'),
    fs = require('fs'),
    path = require('path'),
    multer = require('multer'),
    router = express.Router()
    ;

const { con } = require('../database');
const authenticateToken = require('../authenticateToken');

router.use(authenticateToken);

// ACADEMIC YEARS
router.post('/years', async function (req, res) {
    try {
        const { name, startDate, endDate, isActive } = req.body;
        if (!name || !startDate || !endDate) return res.status(400).json('Name, start date, and end date are required');

        if (isActive) {
            await con.execute('UPDATE AcademicYears SET IsActive = false WHERE SchoolID = ?', [req.user.SchoolID]);
        }

        const [result] = await con.execute(
            'INSERT INTO AcademicYears (SchoolID, Name, StartDate, EndDate, IsActive) VALUES (?, ?, ?, ?, ?)',
            [req.user.SchoolID, name, startDate, endDate, isActive ? true : false]
        );

        res.json('Success');
    } catch (error) {
        console.error("Error creating academic year:", error);
        res.status(500).json('Failed to create academic year');
    }
})

router.get('/years', async function (req, res) {
    try {
        let query = 'SELECT * FROM AcademicYears WHERE SchoolID = ? ORDER BY StartDate DESC';
        let params = [req.user.SchoolID];
        

        
        const [rows] = await con.execute(query, params);
        res.json(rows);
    } catch (error) {
        console.error("Error fetching academic years:", error);
        res.status(500).json('Failed to fetch academic years');
    }
})

// TERMS
router.post('/terms', async function (req, res) {
    try {
        const { academicYearID, name } = req.body;
        if (!academicYearID || !name) return res.status(400).json('AcademicYearID and Name are required');

        const [result] = await con.execute(
            'INSERT INTO Terms (SchoolID, AcademicYearID, Name) VALUES (?, ?, ?)',
            [req.user.SchoolID, academicYearID, name]
        );

        res.json('Success');
    } catch (error) {
        console.error("Error creating term:", error);
        res.status(500).json('Failed to create term');
    }
})

router.get('/terms', async function (req, res) {
    try {
        const { academicYearID } = req.query;
        let query = 'SELECT * FROM Terms WHERE SchoolID = ?';
        const params = [req.user.SchoolID];

        if (academicYearID) {
            query += ' AND AcademicYearID = ?';
            params.push(academicYearID);
        }

        const [rows] = await con.execute(query, params);
        res.json(rows);
    } catch (error) {
        console.error("Error fetching terms:", error);
        res.status(500).json('Failed to fetch terms');
    }
})

// CLASSES
router.post('/classes', async function (req, res) {
    try {
        const { name, faculties } = req.body;
        if (!name) return res.status(400).json('Class Name is required');

        const [result] = await con.execute(
            'INSERT INTO Classes (SchoolID, Name, Faculties) VALUES (?, ?, ?)',
            [req.user.SchoolID, name, faculties || null]
        );

        res.json('Success');
    } catch (error) {
        console.error("Error creating class:", error);
        res.status(500).json('Failed to create class');
    }
})

router.put('/classes/:id', async function (req, res) {
    try {
        const { name, faculties } = req.body;
        if (!name) return res.status(400).json('Class Name is required');

        await con.execute(
            'UPDATE Classes SET Name = ?, Faculties = ? WHERE ID = ? AND SchoolID = ?',
            [name, faculties || null, req.params.id, req.user.SchoolID]
        );

        res.json('Success');
    } catch (error) {
        console.error("Error updating class:", error);
        res.status(500).json('Failed to update class');
    }
})

router.delete('/classes/:id', async function (req, res) {
    try {
        await con.execute('DELETE FROM Classes WHERE ID = ? AND SchoolID = ?', [req.params.id, req.user.SchoolID]);
        res.json('Success');
    } catch (error) {
        console.error("Error deleting class:", error);
        res.status(500).json('Failed to delete class');
    }
})

router.get('/classes', async function (req, res) {
    try {
        let query = `
            SELECT c.*, 
            (SELECT JSON_ARRAYAGG(JSON_OBJECT('ID', s.ID, 'Name', s.Name)) 
             FROM Sections s WHERE s.ClassID = c.ID) as sections,
            (SELECT JSON_ARRAYAGG(JSON_OBJECT('ID', sub.ID, 'Name', sub.Name)) 
             FROM Subjects sub 
             JOIN ClassSubjects cs ON sub.ID = cs.SubjectID 
             WHERE cs.ClassID = c.ID) as subjects
            FROM Classes c 
            WHERE 1=1
        `;
        const params = [];

        query += " AND c.SchoolID = ?";
        params.push(req.user.SchoolID);

        query += " ORDER BY c.Name ASC";

        const [rows] = await con.execute(query, params);
        res.json(rows);
    } catch (error) {
        console.error("Error fetching classes:", error);
        res.status(500).json('Failed to fetch classes');
    }
})

// FACULTIES
router.get('/faculties', async function (req, res) {
    try {

        const [rows] = await con.execute('SELECT * FROM Faculties ORDER BY Name ASC');
        res.json(rows);
    } catch (error) {
        console.error("Error fetching faculties:", error);
        res.status(500).json('Failed to fetch faculties');
    }
})

// SECTIONS
router.post('/sections', async function (req, res) {
    try {
        const { classID, name } = req.body;
        if (!classID || !name) return res.status(400).json('ClassID and Name are required');

        const [result] = await con.execute(
            'INSERT INTO Sections (SchoolID, ClassID, Name) VALUES (?, ?, ?)',
            [req.user.SchoolID, classID, name]
        );

        res.json('Success');
    } catch (error) {
        console.error("Error creating section:", error);
        res.status(500).json('Failed to create section');
    }
})

router.put('/sections/:id', async function (req, res) {
    try {
        const { name } = req.body;
        if (!name) return res.status(400).json('Name is required');

        await con.execute(
            'UPDATE Sections SET Name = ? WHERE ID = ? AND SchoolID = ?',
            [name, req.params.id, req.user.SchoolID]
        );

        res.json('Success');
    } catch (error) {
        console.error("Error updating section:", error);
        res.status(500).json('Failed to update section');
    }
})

router.get('/sections', async function (req, res) {
    try {
        const { classID } = req.query;
        let query = 'SELECT s.*, c.Name as ClassName FROM Sections s JOIN Classes c ON s.ClassID = c.ID WHERE s.SchoolID = ?';
        const params = [req.user.SchoolID];

        if (classID) {
            query += ' AND s.ClassID = ?';
            params.push(classID);
        }

        const [rows] = await con.execute(query, params);
        res.json(rows);
    } catch (error) {
        console.error("Error fetching sections:", error);
        res.status(500).json('Failed to fetch sections');
    }
})

router.delete('/sections/:id', async function (req, res) {
    try {
        await con.execute('DELETE FROM Sections WHERE ID = ? AND SchoolID = ?', [req.params.id, req.user.SchoolID]);
        res.json('Success');
    } catch (error) {
        console.error("Error deleting section:", error);
        res.status(500).json('Failed to delete section');
    }
})

// SUBJECTS
router.post('/subjects', async function (req, res) {
    try {
        const { name, code } = req.body;
        if (!name) return res.status(400).json('Subject Name is required');

        const [result] = await con.execute(
            'INSERT INTO Subjects (SchoolID, Name, Code) VALUES (?, ?, ?)',
            [req.user.SchoolID, name, code || null]
        );

        res.json('Success');
    } catch (error) {
        console.error("Error creating subject:", error);
        res.status(500).json('Failed to create subject');
    }
})

router.get('/subjects', async function (req, res) {
    try {
        let query = 'SELECT * FROM Subjects WHERE SchoolID = ?';
        let params = [req.user.SchoolID];
        

        
        const [rows] = await con.execute(query, params);
        res.json(rows);
    } catch (error) {
        console.error("Error fetching subjects:", error);
        res.status(500).json('Failed to fetch subjects');
    }
})

router.put('/subjects/:id', async function (req, res) {
    try {
        const { name, code, isActive } = req.body;
        if (!name) return res.status(400).json('Subject Name is required');

        await con.execute(
            'UPDATE Subjects SET Name = ?, Code = ?, IsActive = ? WHERE ID = ? AND SchoolID = ?',
            [name, code || null, isActive === false ? false : true, req.params.id, req.user.SchoolID]
        );

        res.json('Success');
    } catch (error) {
        console.error("Error updating subject:", error);
        res.status(500).json('Failed to update subject');
    }
})

router.delete('/subjects/:id', async function (req, res) {
    try {
        await con.execute('DELETE FROM Subjects WHERE ID = ? AND SchoolID = ?', [req.params.id, req.user.SchoolID]);
        res.json('Success');
    } catch (error) {
        console.error("Error deleting subject:", error);
        res.status(500).json('Failed to delete subject');
    }
})

// CLASS-SUBJECTS ASSIGNMENT
router.post('/class-subjects', async function (req, res) {
    try {
        const { classID, subjectIDs } = req.body;
        if (!classID) return res.status(400).json('ClassID is required');

        // Delete existing assignments for this class
        await con.execute('DELETE FROM ClassSubjects WHERE ClassID = ? AND SchoolID = ?', [classID, req.user.SchoolID]);

        // Insert new assignments
        if (subjectIDs && subjectIDs.length > 0) {
            for (const subjectID of subjectIDs) {
                await con.execute(
                    'INSERT INTO ClassSubjects (SchoolID, ClassID, SubjectID) VALUES (?, ?, ?)',
                    [req.user.SchoolID, classID, subjectID]
                );
            }
        }

        res.json('Success');
    } catch (error) {
        console.error("Error assigning subjects to class:", error);
        res.status(500).json('Failed to assign subjects');
    }
})

router.get('/class-subjects', async function (req, res) {
    try {
        const { classID, subjectID } = req.query;
        let query = 'SELECT * FROM ClassSubjects WHERE SchoolID = ?';
        let params = [req.user.SchoolID];

        if (classID) {
            query += ' AND ClassID = ?';
            params.push(classID);
        }
        if (subjectID) {
            query += ' AND SubjectID = ?';
            params.push(subjectID);
        }

        const [rows] = await con.execute(query, params);
        res.json(rows);
    } catch (error) {
        console.error("Error fetching class assignments:", error);
        res.status(500).json('Failed to fetch class assignments');
    }
})

router.post('/subject-classes', async function (req, res) {
    try {
        const { subjectID, classIDs } = req.body;
        if (!subjectID) return res.status(400).json('SubjectID is required');

        // Delete existing assignments for this subject
        await con.execute('DELETE FROM ClassSubjects WHERE SubjectID = ? AND SchoolID = ?', [subjectID, req.user.SchoolID]);

        // Insert new assignments
        if (classIDs && classIDs.length > 0) {
            for (const classID of classIDs) {
                await con.execute(
                    'INSERT INTO ClassSubjects (SchoolID, ClassID, SubjectID) VALUES (?, ?, ?)',
                    [req.user.SchoolID, classID, subjectID]
                );
            }
        }

        res.json('Success');
        res.json('Success');
    } catch (error) {
        console.error("Error assigning classes to subject:", error);
        res.status(500).json('Failed to assign classes');
    }
})

// TEACHER ASSIGNMENTS
router.get('/assignments', async function (req, res) {
    try {
        const { staffID, classID, sectionID } = req.query;
        let query = `
            SELECT ta.*, s.Name as SubjectName, st.ID as StaffID, 
            CONCAT(st.FirstName, ' ', st.LastName) as StaffName,
            c.Name as ClassName, sec.Name as SectionName
            FROM TeacherAssignments ta
            JOIN Subjects s ON ta.SubjectID = s.ID
            JOIN Staff st ON ta.StaffID = st.ID
            JOIN Users u ON st.UserID = u.ID
            JOIN Classes c ON ta.ClassID = c.ID
            LEFT JOIN Sections sec ON ta.SectionID = sec.ID
            WHERE 1=1
        `;
        const params = [];

        query += " AND ta.SchoolID = ?";
        params.push(req.user.SchoolID);

        if (staffID) { query += " AND ta.StaffID = ?"; params.push(staffID); }
        if (classID) { query += " AND ta.ClassID = ?"; params.push(classID); }
        if (sectionID) { query += " AND ta.SectionID = ?"; params.push(sectionID); }

        const [rows] = await con.execute(query, params);
        res.json(rows);
    } catch (error) {
        console.error("Error fetching assignments:", error);
        res.status(500).json('Failed to fetch assignments');
    }
});

router.post('/assignments', async function (req, res) {
    try {
        const { staffID, classID, sectionID, subjectID } = req.body;
        if (!staffID || !classID || !subjectID) return res.status(400).json('StaffID, ClassID, and SubjectID are required');

        await con.execute(
            'INSERT INTO TeacherAssignments (SchoolID, StaffID, ClassID, SectionID, SubjectID) VALUES (?, ?, ?, ?, ?)',
            [req.user.SchoolID, staffID, classID, sectionID || null, subjectID]
        );
        res.json('Assignment created successfully');
    } catch (error) {
        console.error("Error creating assignment:", error);
        res.status(500).json('Failed to create assignment');
    }
});

router.delete('/assignments/:id', async function (req, res) {
    try {
        await con.execute('DELETE FROM TeacherAssignments WHERE ID = ? AND SchoolID = ?', [req.params.id, req.user.SchoolID]);
        res.json('Assignment deleted');
    } catch (error) {
        res.status(500).json('Failed to delete assignment');
    }
});

// TIME SLOTS (PERIODS)
router.get('/timeslots', async function (req, res) {
    try {
        const [rows] = await con.execute('SELECT * FROM TimetableSlots WHERE SchoolID = ? ORDER BY StartTime ASC', [req.user.SchoolID]);
        res.json(rows);
    } catch (error) {
        res.status(500).json('Failed to fetch time slots');
    }
});

router.post('/timeslots', async function (req, res) {
    try {
        const { slotName, startTime, endTime, isBreak } = req.body;
        if (!slotName || !startTime || !endTime) return res.status(400).json('Required fields missing');

        await con.execute(
            'INSERT INTO TimetableSlots (SchoolID, SlotName, StartTime, EndTime, IsBreak) VALUES (?, ?, ?, ?, ?)',
            [req.user.SchoolID, slotName, startTime, endTime, isBreak ? true : false]
        );
        res.json('Time slot created');
    } catch (error) {
        res.status(500).json('Failed to create time slot');
    }
});

router.delete('/timeslots/:id', async function (req, res) {
    try {
        await con.execute('DELETE FROM TimetableSlots WHERE ID = ? AND SchoolID = ?', [req.params.id, req.user.SchoolID]);
        res.json('Success');
    } catch (error) {
        res.status(500).json('Failed to delete slot');
    }
});

// TIMETABLE
router.get('/timetable', async function (req, res) {
    try {
        const { classID, sectionID, staffID } = req.query;
        let query = `
            SELECT te.*, ts.SlotName, ts.StartTime, ts.EndTime, ts.IsBreak,
            s.Name as SubjectName, 
            CONCAT(st.FirstName, ' ', st.LastName) as StaffName,
            c.Name as ClassName, sec.Name as SectionName
            FROM TimetableEntries te
            JOIN TimetableSlots ts ON te.SlotID = ts.ID
            JOIN Subjects s ON te.SubjectID = s.ID
            JOIN Staff st ON te.StaffID = st.ID
            JOIN Users u ON st.UserID = u.ID
            JOIN Classes c ON te.ClassID = c.ID
            LEFT JOIN Sections sec ON te.SectionID = sec.ID
            WHERE te.SchoolID = ?
        `;
        const params = [req.user.SchoolID];

        if (classID) { query += " AND te.ClassID = ?"; params.push(classID); }
        if (sectionID) { query += " AND te.SectionID = ?"; params.push(sectionID); }
        if (staffID) { query += " AND te.StaffID = ?"; params.push(staffID); }

        const [rows] = await con.execute(query, params);
        res.json(rows);
    } catch (error) {
        console.error("Error fetching timetable:", error);
        res.status(500).json('Failed to fetch timetable');
    }
});

router.post('/timetable', async function (req, res) {
    try {
        const { dayOfWeek, slotID, staffID, subjectID, classID, sectionID } = req.body;

        if (!dayOfWeek || !slotID || !staffID || !subjectID || !classID) {
            return res.status(400).json('Missing required fields');
        }

        // 1. Fetch Slot Times
        const [slots] = await con.execute('SELECT * FROM TimetableSlots WHERE ID = ? AND SchoolID = ?', [slotID, req.user.SchoolID]);
        if (slots.length === 0) return res.status(404).json('Time slot not found');
        const { StartTime: startTime, EndTime: endTime } = slots[0];

        // 2. Check Teacher Availability
        const [staff] = await con.execute('SELECT Availability FROM Staff WHERE ID = ?', [staffID]);
        if (staff.length === 0) return res.status(404).json('Teacher not found');

        const availability = typeof staff[0].Availability === 'string' ? JSON.parse(staff[0].Availability) : staff[0].Availability;

        if (!availability || !Array.isArray(availability)) {
            return res.status(400).json('Teacher availability is not defined. Please set it in their profile.');
        }

        const dayMap = { 1: 'Monday', 2: 'Tuesday', 3: 'Wednesday', 4: 'Thursday', 5: 'Friday', 6: 'Saturday' };
        const dayName = dayMap[dayOfWeek];
        const dayAvailability = availability.filter(a => a.day === dayName);

        const norm = (t) => t?.substring(0, 5); // HH:mm
        const isAvailable = dayAvailability.some(slot => {
            return norm(startTime) >= norm(slot.startTime) && norm(endTime) <= norm(slot.endTime);
        });

        if (!isAvailable) {
            return res.status(400).json(`Strict Blocking: Teacher is NOT available on ${dayName} during session time (${startTime}-${endTime})`);
        }

        // 3. Check for Overlaps with existing entries for this teacher
        // We check if any existing entry on the same day overlaps with this slot's time
        const [overlaps] = await con.execute(`
            SELECT te.ID FROM TimetableEntries te
            JOIN TimetableSlots ts ON te.SlotID = ts.ID
            WHERE te.StaffID = ? AND te.DayOfWeek = ? 
            AND ts.StartTime < ? AND ts.EndTime > ?
        `, [staffID, dayOfWeek, endTime, startTime]);

        if (overlaps.length > 0) {
            return res.status(400).json('Strict Blocking: Teacher is already assigned to another class during this period.');
        }

        // 4. Insert
        await con.execute(
            'INSERT INTO TimetableEntries (SchoolID, SlotID, DayOfWeek, StartTime, EndTime, StaffID, SubjectID, ClassID, SectionID) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [req.user.SchoolID, slotID, dayOfWeek, startTime, endTime, staffID, subjectID, classID, sectionID || null]
        );

        res.json('Timetable entry created successfully');
    } catch (error) {
        console.error("Error creating timetable entry:", error);
        res.status(500).json('Failed to create timetable entry');
    }
});

router.delete('/timetable/:id', async function (req, res) {
    try {
        await con.execute('DELETE FROM TimetableEntries WHERE ID = ? AND SchoolID = ?', [req.params.id, req.user.SchoolID]);
        res.json('Success');
    } catch (error) {
        res.status(500).json('Failed to delete entry');
    }
});

module.exports = router;
