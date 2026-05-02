var express = require('express'),
    moment = require('moment'),
    fs = require('fs'),
    path = require('path'),
    multer = require('multer'),
    bcrypt = require('bcryptjs'),
    router = express.Router()
    ;

const { con } = require('../database');
const sendEmail = require('../sendEmail');
const { uploadToCloudinary } = require('../cloudinaryHelper');
const authenticateToken = require('../authenticateToken');
const CommunicationHelper = require('../communicationHelper');
const NotificationService = require('../notificationService');

router.use(authenticateToken);

// GET CURRENT USER PROFILE
router.get('/me', async function (req, res) {
    try {
        const query = `
            SELECT u.ID, u.Email, u.Name, u.RoleID, u.SchoolID, r.Name as RoleName,
                   s.ID as StudentID, s.ClassId, c.Name as ClassName
            FROM Users u
            JOIN Roles r ON u.RoleID = r.ID
            LEFT JOIN Students s ON u.ID = s.UserID
            LEFT JOIN Classes c ON s.ClassId = c.ID
            WHERE u.ID = ?
        `;
        const [rows] = await con.execute(query, [req.user.ID]);
        if (rows.length === 0) return res.status(404).json('User not found');
        res.json(rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json('Failed to fetch profile');
    }
});

// APPROVE USERS (Admin Only)
router.put('/approve/:id', async function (req, res) {
    // Only Admin (RoleID 2) or SuperAdmin (RoleID 1) can approve
    if (req.user.RoleID > 2) return res.status(403).json('Forbidden');
    
    try {
        const { status } = req.body; // 'active' or 'rejected'
        await con.execute(
            'UPDATE Users SET Status = ? WHERE ID = ? AND SchoolID = ?',
            [status || 'active', req.params.id, req.user.SchoolID]
        );
        res.json({ message: `User ${status || 'approved'}` });
    } catch (error) {
        console.error('Approval error:', error);
        res.status(500).json('Failed to update status');
    }
});

// GET PENDING TEACHERS
router.get('/pending-teachers', async function (req, res) {
    if (req.user.RoleID > 2) return res.status(403).json('Forbidden');
    try {
        const [rows] = await con.execute(`
            SELECT u.ID, u.Name, u.Email, u.CreatedAt
            FROM Users u
            WHERE u.RoleID = 3 AND u.Status = 'pending' AND u.SchoolID = ?
        `, [req.user.SchoolID]);
        res.json(rows);
    } catch (error) {
        res.status(500).json('Failed to fetch pending teachers');
    }
});

// STAFF CRUD
router.post('/staff', async function (req, res) {
    const { email, password, roleID, firstName, lastName, employeeID, department, designation, joiningDate } = req.body;
    if (!email || !password || !roleID || !firstName || !lastName) {
        return res.status(400).json('Required fields missing.');
    }

    const connection = await con.getConnection();
    try {
        await connection.beginTransaction();

        // Auto-generate EmployeeID if not provided
        let finalEmpID = employeeID;
        if (!finalEmpID) {
            const [rows] = await connection.execute('SELECT COUNT(*) as count FROM Staff WHERE SchoolID = ?', [req.user.SchoolID]);
            finalEmpID = `EMP-${(rows[0].count + 1).toString().padStart(4, '0')}`;
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        const [userResult] = await connection.execute(
            'INSERT INTO Users (SchoolID, Email, PasswordHash, RoleID, Status) VALUES (?, ?, ?, ?, ?)',
            [req.user.SchoolID, email, hashedPassword, roleID, 'active']
        );
        const userID = userResult.insertId;
        await connection.execute(
            'INSERT INTO Staff (UserID, SchoolID, EmployeeID, FirstName, LastName, Department, Designation, JoiningDate) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [userID, req.user.SchoolID, finalEmpID, firstName, lastName, department || null, designation || null, joiningDate || null]
        );
        await connection.commit();

        // Async Notification
        NotificationService.notifyStaffOnboarding(req.user.SchoolID, firstName, lastName, email, req.body.phone, password, req.user.ID);

        res.json({ message: 'Success', employeeID: finalEmpID });
    } catch (error) {
        await connection.rollback();
        if (error.code === 'ER_DUP_ENTRY') return res.status(400).json('Email already exists.');
        res.status(500).json('Failed to create staff.');
    } finally {
        connection.release();
    }
});

router.get('/staff', async function (req, res) {
    try {
        let query = `
            SELECT u.ID as UserID, u.Email, u.Status, r.Name as RoleName, s.*
            FROM Users u
            JOIN Staff s ON u.ID = s.UserID
            JOIN Roles r ON u.RoleID = r.ID
            WHERE u.SchoolID = ?
        `;
        let params = [req.user.SchoolID];



        const [rows] = await con.execute(query, params);
        res.json(rows);
    } catch (error) {
        res.status(500).json('Failed to fetch staff');
    }
});

router.put('/staff/:id', async function (req, res) {
    const { firstName, lastName, employeeID, department, designation, joiningDate, roleID } = req.body;
    const connection = await con.getConnection();
    try {
        await connection.beginTransaction();
        await connection.execute(
            'UPDATE Staff SET FirstName = ?, LastName = ?, EmployeeID = ?, Department = ?, Designation = ?, JoiningDate = ?, Availability = ? WHERE ID = ?',
            [firstName, lastName, employeeID || null, department || null, designation || null, joiningDate || null, req.body.availability ? JSON.stringify(req.body.availability) : null, req.params.id]
        );
        if (roleID) {
            const [staff] = await connection.execute('SELECT UserID FROM Staff WHERE ID = ?', [req.params.id]);
            if (staff.length > 0) {
                await connection.execute('UPDATE Users SET RoleID = ? WHERE ID = ?', [roleID, staff[0].UserID]);
            }
        }
        await connection.commit();
        res.json('Success');
    } catch (error) {
        await connection.rollback();
        res.status(500).json('Failed to update staff');
    } finally {
        connection.release();
    }
});

router.delete('/staff/:id', async function (req, res) {
    const connection = await con.getConnection();
    try {
        await connection.beginTransaction();
        const [staff] = await connection.execute('SELECT UserID FROM Staff WHERE ID = ?', [req.params.id]);
        if (staff.length > 0) {
            await connection.execute('DELETE FROM Staff WHERE ID = ?', [req.params.id]);
            await connection.execute('DELETE FROM Users WHERE ID = ?', [staff[0].UserID]);
        }
        await connection.commit();
        res.json('Success');
    } catch (error) {
        await connection.rollback();
        res.status(500).json('Failed to delete staff');
    } finally {
        connection.release();
    }
});

// STAFF SALARY
router.get('/staff/salaries/:staffID', async function (req, res) {
    try {
        const [rows] = await con.execute('SELECT SalaryHistory FROM Staff WHERE ID = ?', [req.params.staffID]);
        const history = rows[0]?.SalaryHistory ? (typeof rows[0].SalaryHistory === 'string' ? JSON.parse(rows[0].SalaryHistory) : rows[0].SalaryHistory) : [];
        res.json(history);
    } catch (error) {
        res.status(500).json('Failed to fetch salary history');
    }
});

router.post('/staff/salaries', async function (req, res) {
    const { staffID, amount, notes } = req.body;
    try {
        const [staff] = await con.execute('SELECT SalaryHistory FROM Staff WHERE ID = ?', [staffID]);
        let history = staff[0]?.SalaryHistory ? (typeof staff[0].SalaryHistory === 'string' ? JSON.parse(staff[0].SalaryHistory) : staff[0].SalaryHistory) : [];
        history.unshift({ Amount: amount, ChangeDate: new Date().toISOString(), Notes: notes || 'Salary update', ChangedBy: req.user.ID });
        await con.execute('UPDATE Staff SET Salary = ?, SalaryHistory = ? WHERE ID = ?', [amount, JSON.stringify(history), staffID]);
        res.json('Success');
    } catch (error) {
        res.status(500).json('Failed to update salary');
    }
});

// STUDENTS
router.post('/students', async function (req, res) {
    const {
        firstName, lastName, email, password, admissionNumber, rollNumber,
        dob, gender, bloodGroup, admissionDate, religion,
        classID, sectionID, academicYearID,
        parentName, parentPhone, parentEmail, parentOccupation, parentRelation,
        address, phone, photo
    } = req.body;

    const connection = await con.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Auto-generate Admission Number
        let finalAdmNo = admissionNumber;
        if (!finalAdmNo) {
            const [rows] = await connection.execute('SELECT COUNT(*) as count FROM Students WHERE SchoolID = ?', [req.user.SchoolID]);
            finalAdmNo = `AD-${new Date().getFullYear()}-${(rows[0].count + 1).toString().padStart(4, '0')}`;
        }

        // 2. Auto-generate Roll Number (incremental within Class/Section)
        let finalRollNo = rollNumber;
        if (!finalRollNo) {
            const [rows] = await connection.execute('SELECT MAX(CAST(RollNumber AS UNSIGNED)) as maxRoll FROM Students WHERE ClassID = ? AND SectionID = ? AND SchoolID = ?', [classID, sectionID, req.user.SchoolID]);
            finalRollNo = (rows[0].maxRoll || 0) + 1;
        }

        let userID = null;
        if (email && password) {
            // Get Student Role ID
            const [roles] = await connection.execute(
                'SELECT ID FROM Roles WHERE SchoolID = ? AND Name = ?',
                [req.user.SchoolID, 'Student']
            );
            const studentRoleID = roles.length > 0 ? roles[0].ID : 4; // Fallback to 4

            const hashedPassword = await bcrypt.hash(password, 12);
            const [userResult] = await connection.execute(
                'INSERT INTO Users (SchoolID, Email, PasswordHash, RoleID, Status) VALUES (?, ?, ?, ?, ?)',
                [req.user.SchoolID, email, hashedPassword, studentRoleID, 'active']
            );
            userID = userResult.insertId;

            // Async Notification
            NotificationService.notifyStudentOnboarding(req.user.SchoolID, firstName, lastName, email, phone, password, req.user.ID);
        }

        // Fetch names for history for "Minimal Database" efficiency
        const [[cls]] = await connection.execute('SELECT Name FROM Classes WHERE ID = ?', [classID || null]);
        const [[sec]] = await connection.execute('SELECT Name FROM Sections WHERE ID = ?', [sectionID || null]);
        const [[ay]]  = await connection.execute('SELECT Name FROM AcademicYears WHERE ID = ?', [academicYearID || null]);
        const initialHistory = [{ 
            Action: 'Admitted', 
            ClassName: cls?.Name, 
            SectionName: sec?.Name, 
            AcademicYear: ay?.Name, // Year name added
            Date: admissionDate || new Date().toISOString().split('T')[0], 
            Notes: 'Initial Admission' 
        }];

        const [studentResult] = await connection.execute(`
            INSERT INTO Students (UserID, SchoolID, FirstName, LastName, AdmissionNumber, RollNumber, Dob, Gender, BloodGroup, AdmissionDate, Religion, ClassID, SectionID, AcademicYearID, ParentName, ParentPhone, ParentOccupation, ParentRelation, Address, Phone, Photo, AcademicHistory, ConcessionHistory) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [userID, req.user.SchoolID, firstName, lastName, finalAdmNo, finalRollNo, dob || null, gender || null, bloodGroup || null, admissionDate || null, religion || null, classID || null, sectionID || null, academicYearID || null, parentName || null, parentPhone || null, parentOccupation || null, parentRelation || 'Father', address || null, phone || null, photo || null, JSON.stringify(initialHistory), JSON.stringify([])]);

        await connection.commit();
        const newStudentID = studentResult.insertId;

        // Parent Onboarding Logic (Independent of Transaction if you want, but for now inside)
        if (parentEmail?.trim()) {
            const tempPass = 'parent123';
            try {
                const [existingUsers] = await connection.execute('SELECT ID FROM Users WHERE Email = ?', [parentEmail]);
                let parentUserID;
                
                if (existingUsers.length === 0) {
                    const hashedParentPass = await bcrypt.hash(tempPass, 12);
                    const [userRes] = await connection.execute('INSERT INTO Users (SchoolID, Email, PasswordHash, RoleID, Status) VALUES (?, ?, ?, 5, "active")', [req.user.SchoolID, parentEmail, hashedParentPass]);
                    parentUserID = userRes.insertId;
                    
                    await connection.execute('INSERT INTO Parents (UserID, SchoolID, FirstName, LastName, PhoneNumber, Occupation) VALUES (?, ?, ?, ?, ?, ?)', [parentUserID, req.user.SchoolID, parentName || 'Parent', lastName, parentPhone || null, parentOccupation || null]);
                } else {
                    parentUserID = existingUsers[0].ID;
                }

                const [parentRecs] = await connection.execute('SELECT ID FROM Parents WHERE UserID = ?', [parentUserID]);
                if (parentRecs.length > 0) {
                    const pID = parentRecs[0].ID;
                    await connection.execute('INSERT INTO StudentParentRelations (StudentID, ParentID, RelationLabel) VALUES (?, ?, ?)', [newStudentID, pID, parentRelation || 'Parent']);
                }

                // Send Welcome Email if new user
                if (existingUsers.length === 0) {
                    const [[school]] = await connection.execute('SELECT Name FROM Schools WHERE ID = ?', [req.user.SchoolID]);
                    const emailBody = `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                            <h2 style="color: #2563eb; text-align: center;">Welcome to ${school?.Name || 'Edunex'}</h2>
                            <p>Dear ${parentName || 'Parent'},</p>
                            <p>Your child, <strong>${firstName} ${lastName}</strong>, has been admitted to our institution. A parent account has been created for you.</p>
                            <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
                                <p style="margin: 0; font-size: 14px;"><strong>Login Email:</strong> ${parentEmail}</p>
                                <p style="margin: 0; font-size: 14px;"><strong>Temporary Password:</strong> ${tempPass}</p>
                            </div>
                            <p style="text-align: center;">
                                <a href="http://${req.hostname}:5173/login" style="background: #2563eb; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Login to Parent Portal</a>
                            </p>
                            <p style="font-size: 12px; color: #64748b; margin-top: 30px; text-align: center;">
                                Please change your password after your first login.
                            </p>
                        </div>
                    `;
                    
                    const config = {
                        host: process.env.SMTP_HOST,
                        port: process.env.SMTP_PORT,
                        secure: true,
                        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
                    };
                    
                    await sendEmail(process.env.SMTP_USER, parentEmail, `Welcome to ${school?.Name || 'Edunex'} - Parent Account Created`, emailBody, [], config);
                }
            } catch (err) {
                console.error("Parent onboarding/email failed:", err);
            }
        }

        res.json({ message: 'Success', studentID: newStudentID, admissionNumber: finalAdmNo, rollNumber: finalRollNo });
    } catch (error) {
        await connection.rollback();
        console.log(error);
        res.status(500).json('Failed to admit student: ' + error.message);
    } finally {
        connection.release();
    }
});

router.get('/students', async function (req, res) {
    const { yearID, classID, sectionID } = req.query;
    try {


        let query = `
            SELECT st.*, c.Name as ClassName, sec.Name as SectionName, ay.Name as AcademicYear
            FROM Students st
            LEFT JOIN Classes c ON st.ClassID = c.ID
            LEFT JOIN Sections sec ON st.SectionID = sec.ID
            LEFT JOIN AcademicYears ay ON st.AcademicYearID = ay.ID
            WHERE st.SchoolID = ?
        `;
        let params = [req.user.SchoolID];

        // Advanced Filtering for both Current and Historical context
        if (yearID || classID || sectionID) {
            let filterConditions = [];
            
            if (yearID) {
                const [[ayRef]] = await con.execute('SELECT Name FROM AcademicYears WHERE ID = ?', [yearID]);
                if (ayRef) {
                    filterConditions.push(`(st.AcademicYearID = ? OR JSON_SEARCH(st.AcademicHistory, 'one', ?, NULL, '$[*].AcademicYear') IS NOT NULL)`);
                    params.push(yearID, ayRef.Name);
                }
            }
            if (classID) {
                const [[clsRef]] = await con.execute('SELECT Name FROM Classes WHERE ID = ?', [classID]);
                if (clsRef) {
                    filterConditions.push(`(st.ClassID = ? OR JSON_SEARCH(st.AcademicHistory, 'one', ?, NULL, '$[*].ClassName') IS NOT NULL)`);
                    params.push(classID, clsRef.Name);
                }
            }
            if (sectionID) {
                const [[secRef]] = await con.execute('SELECT Name FROM Sections WHERE ID = ?', [sectionID]);
                if (secRef) {
                    filterConditions.push(`(st.SectionID = ? OR JSON_SEARCH(st.AcademicHistory, 'one', ?, NULL, '$[*].SectionName') IS NOT NULL)`);
                    params.push(sectionID, secRef.Name);
                }
            }

            if (filterConditions.length > 0) {
                query += ` AND ${filterConditions.join(' AND ')}`;
            }
        }

        const [rows] = await con.execute(query, params);
        res.json(rows);
    } catch (error) {
        console.error("GET /students error:", error);
        res.status(500).json('Failed to fetch students: ' + error.message);
    }
});

router.put('/students/:id', async function (req, res) {
    const { firstName, lastName, dob, gender, bloodGroup, admissionNumber, rollNumber, parentName, parentPhone, parentEmail, parentOccupation, address, phone, photo, concessionAmount, concessionNotes } = req.body;
    try {
        if (concessionAmount !== undefined) {
            const [st] = await con.execute('SELECT ConcessionHistory FROM Students WHERE ID = ?', [req.params.id]);
            let history = st[0]?.ConcessionHistory ? (typeof st[0].ConcessionHistory === 'string' ? JSON.parse(st[0].ConcessionHistory) : st[0].ConcessionHistory) : [];
            history.unshift({ Amount: concessionAmount, Notes: concessionNotes || 'Standard update', Date: new Date().toISOString() });
            await con.execute('UPDATE Students SET ConcessionHistory = ?, ConcessionValue = ? WHERE ID = ?', [JSON.stringify(history), concessionAmount, req.params.id]);
            return res.json('Success');
        }
        await con.execute(`UPDATE Students SET FirstName = ?, LastName = ?, Dob = ?, Gender = ?, BloodGroup = ?, AdmissionNumber = ?, RollNumber = ?, ParentName = ?, ParentPhone = ?, ParentEmail = ?, ParentOccupation = ?, Address = ?, Phone = ?, Photo = ? WHERE ID = ? AND SchoolID = ?`,
            [firstName, lastName, dob, gender, bloodGroup, admissionNumber, rollNumber, parentName, parentPhone, parentEmail, parentOccupation, address, phone, photo, req.params.id, req.user.SchoolID]);
        res.json('Success');
    } catch (error) {
        res.status(500).json('Failed to update student profile');
    }
});

router.post('/students/promote', async function (req, res) {
    const { studentID, newClassID, newSectionID, newYearID, notes } = req.body;
    try {
        const [[cls]] = await con.execute('SELECT Name FROM Classes WHERE ID = ?', [newClassID]);
        const [[sec]] = await con.execute('SELECT Name FROM Sections WHERE ID = ?', [newSectionID]);
        const [[ay]]  = await con.execute('SELECT Name FROM AcademicYears WHERE ID = ?', [newYearID]);

        const [st] = await con.execute('SELECT AcademicHistory FROM Students WHERE ID = ?', [studentID]);
        let history = st[0]?.AcademicHistory ? (typeof st[0].AcademicHistory === 'string' ? JSON.parse(st[0].AcademicHistory) : st[0].AcademicHistory) : [];
        history.unshift({ 
            Action: 'Promotion', 
            ClassName: cls?.Name, 
            SectionName: sec?.Name, 
            AcademicYear: ay?.Name, // Year name added
            Date: new Date().toISOString().split('T')[0], 
            Notes: notes || 'Promoted' 
        });
        await con.execute('UPDATE Students SET ClassID = ?, SectionID = ?, AcademicYearID = ?, AcademicHistory = ? WHERE ID = ?', [newClassID, newSectionID, newYearID, JSON.stringify(history), studentID]);
        res.json('Success');
    } catch (error) {
        res.status(500).json('Promotion failed');
    }
});

router.post('/students/bulk-promote', async function (req, res) {
    const { studentIDs, targetClassID, targetSectionID, targetYearID, notes } = req.body;
    if (!studentIDs || !Array.isArray(studentIDs) || studentIDs.length === 0) return res.status(400).json('Student IDs are required');

    const connection = await con.getConnection();
    try {
        await connection.beginTransaction();

        const [[cls]] = await connection.execute('SELECT Name FROM Classes WHERE ID = ?', [targetClassID]);
        const [[sec]] = await connection.execute('SELECT Name FROM Sections WHERE ID = ?', [targetSectionID]);
        const [[ay]]  = await connection.execute('SELECT Name FROM AcademicYears WHERE ID = ?', [targetYearID]);
        const promotionNote = notes || 'Bulk Promotion';
        const promotionDate = new Date().toISOString().split('T')[0];

        for (const sID of studentIDs) {
            const [st] = await connection.execute('SELECT AcademicHistory FROM Students WHERE ID = ?', [sID]);
            let history = st[0]?.AcademicHistory ? (typeof st[0].AcademicHistory === 'string' ? JSON.parse(st[0].AcademicHistory) : st[0].AcademicHistory) : [];
            history.unshift({
                Action: 'Promotion',
                ClassName: cls?.Name,
                SectionName: sec?.Name,
                AcademicYear: ay?.Name, // Year name added
                Date: promotionDate,
                Notes: promotionNote
            });
            await connection.execute(
                'UPDATE Students SET ClassID = ?, SectionID = ?, AcademicYearID = ?, AcademicHistory = ? WHERE ID = ?',
                [targetClassID, targetSectionID, targetYearID, JSON.stringify(history), sID]
            );
        }

        await connection.commit();
        res.json('Success');
    } catch (error) {
        await connection.rollback();
        console.error("Bulk promotion error:", error);
        res.status(500).json('Bulk promotion failed: ' + error.message);
    } finally {
        connection.release();
    }
});

// PARENTS
router.post('/parents', async function (req, res) {
    const { email, password, roleID, firstName, lastName, phoneNumber, occupation, studentIDsWithLabels } = req.body;
    const connection = await con.getConnection();
    try {
        await connection.beginTransaction();
        const hashedPassword = await bcrypt.hash(password, 12);
        const [userResult] = await connection.execute('INSERT INTO Users (SchoolID, Email, PasswordHash, RoleID, Status) VALUES (?, ?, ?, ?, ?)', [req.user.SchoolID, email, hashedPassword, roleID, 'active']);
        const userID = userResult.insertId;
        const [parentResult] = await connection.execute('INSERT INTO Parents (UserID, SchoolID, FirstName, LastName, PhoneNumber, Occupation) VALUES (?, ?, ?, ?, ?, ?)', [userID, req.user.SchoolID, firstName, lastName, phoneNumber || null, occupation || null]);
        const parentID = parentResult.insertId;
        if (studentIDsWithLabels) {
            for (const rel of studentIDsWithLabels) {
                await connection.execute('INSERT INTO StudentParentRelations (StudentID, ParentID, RelationLabel) VALUES (?, ?, ?)', [rel.studentID, parentID, rel.relationLabel || 'Parent']);
            }
        }
        await connection.commit();
        res.json('Success');
    } catch (error) {
        await connection.rollback();
        res.status(500).json('Failed to create parent');
    } finally {
        connection.release();
    }
});

router.get('/parents', async function (req, res) {
    try {
        const [rows] = await con.execute('SELECT u.Email, p.* FROM Users u JOIN Parents p ON u.ID = p.UserID WHERE u.SchoolID = ?', [req.user.SchoolID]);
        res.json(rows);
    } catch (error) {
        res.status(500).json('Failed to fetch parents');
    }
});

router.post('/update-employee-status', async function (req, res) {
    try {
        const { empID, status } = req.body;
        await con.execute("UPDATE Users SET Status=? WHERE ID=?", [status, empID]);
        res.json('Success');
    } catch (error) {
        res.status(500).json('Failed to update employee status');
    }
});

router.get('/profile', async function (req, res) {
    try {
        
        const query = `
            SELECT 
                u.ID as UserID,
                u.Email, 
                u.RoleID, 
                r.Name as RoleName,
                s.ID as StaffID,
                COALESCE(s.FirstName, '') as FirstName,
                COALESCE(s.LastName, '') as LastName,
                s.Photo,
                s.Phone,
                s.Address,
                s.Gender,
                s.DOB,
                s.Qualification,
                s.Experience,
                s.Bio
            FROM Users u 
            JOIN Roles r ON u.RoleID = r.ID 
            LEFT JOIN Staff s ON u.ID = s.UserID 
            WHERE u.ID = ?
        `;

        const [rows] = await con.execute(query, [req.user.ID]);
        if (rows.length === 0) return res.status(404).json('Profile not found');
        res.json(rows[0]);
    } catch (error) {
        console.error("Profile Fetch Error:", error);
        res.status(500).json('Failed to fetch profile');
    }
});

router.put('/profile', async function (req, res) {
    let { firstName, lastName, phone, address, photo, gender, dob, qualification, experience, bio } = req.body;
    try {
        // Upload photo to Cloudinary if it's base64
        if (photo && photo.startsWith('data:image')) {
            const uploadedUrl = await uploadToCloudinary(photo, 'user_profiles');
            if (uploadedUrl) photo = uploadedUrl;
        }

        // Find or create Staff record (Unified for Staff/Admin roles)
        const [existing] = await con.execute(`SELECT * FROM Staff WHERE UserID = ?`, [req.user.ID]);
        
        if (existing.length === 0) {
            let schoolID = req.user.SchoolID;
            if (!schoolID) {
                const [schools] = await con.execute('SELECT ID FROM Schools LIMIT 1');
                if (schools.length > 0) schoolID = schools[0].ID;
            }
            if (!schoolID) return res.status(400).json('Cannot deduce school context for profile creation');

            const [countRes] = await con.execute('SELECT COUNT(*) as count FROM Staff WHERE SchoolID = ?', [schoolID]);
            const finalEmpID = `EMP-${(countRes[0].count + 1).toString().padStart(4, '0')}`;

            await con.execute(
                `INSERT INTO Staff (UserID, SchoolID, EmployeeID, FirstName, LastName, Photo, Phone, Address, Gender, DOB, Qualification, Experience, Bio, Availability) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [req.user.ID, schoolID, finalEmpID, firstName || '', lastName || '', photo || null, phone || null, address || null, gender || null, dob || null, qualification || null, experience || null, bio || null, req.body.availability ? JSON.stringify(req.body.availability) : null]
            );
        } else {
            // UPDATE: Skip Salary and JoiningDate
            await con.execute(
                `UPDATE Staff SET FirstName = ?, LastName = ?, Photo = ?, Phone = ?, Address = ?, Gender = ?, DOB = ?, Qualification = ?, Experience = ?, Bio = ?, Availability = ? WHERE UserID = ?`,
                [
                    firstName !== undefined ? firstName : existing[0].FirstName, 
                    lastName !== undefined ? lastName : existing[0].LastName, 
                    photo !== undefined ? photo : existing[0].Photo, 
                    phone !== undefined ? phone : existing[0].Phone, 
                    address !== undefined ? address : existing[0].Address, 
                    gender !== undefined ? gender : existing[0].Gender, 
                    dob !== undefined ? dob : existing[0].DOB, 
                    qualification !== undefined ? qualification : existing[0].Qualification, 
                    experience !== undefined ? experience : existing[0].Experience, 
                    bio !== undefined ? bio : existing[0].Bio,
                    req.body.availability !== undefined ? JSON.stringify(req.body.availability) : existing[0].Availability,
                    req.user.ID
                ]
            );
        }
        res.json('Profile updated successfully');
    } catch (error) {
        console.error("Profile Update Error:", error);
        res.status(500).json('Failed to update profile');
    }
});

// SCHOOL PROFILE
router.get('/school/profile', async function (req, res) {
    try {
        const [rows] = await con.execute('SELECT * FROM Schools WHERE ID = ?', [req.user.SchoolID]);
        if (rows.length === 0) return res.status(404).json('School not found');
        res.json(rows[0]);
    } catch (error) {
        console.error("School Profile Fetch Error:", error);
        res.status(500).json('Failed to fetch school profile');
    }
});

router.put('/school/profile', async function (req, res) {
    if (req.user.RoleID !== 1 && req.user.RoleID !== 2) {
        return res.status(403).json('Only institution administrators can update school settings');
    }

    let { name, logoUrl, address, phone, email, startTime, endTime } = req.body;
    try {
        // Upload logo to Cloudinary if it's base64
        if (logoUrl && logoUrl.startsWith('data:image')) {
            const uploadedUrl = await uploadToCloudinary(logoUrl, 'school_logos');
            if (uploadedUrl) logoUrl = uploadedUrl;
        }

        await con.execute(
            'UPDATE Schools SET Name = ?, LogoUrl = ?, Address = ?, Phone = ?, Email = ?, StartTime = ?, EndTime = ? WHERE ID = ?',
            [name, logoUrl || null, address || null, phone || null, email || null, startTime || '08:00:00', endTime || '14:00:00', req.user.SchoolID]
        );
        res.json('School profile updated successfully');
    } catch (error) {
        console.error("School Profile Update Error:", error);
        res.status(500).json('Failed to update school profile');
    }
});

// Dashboard Settings
router.get('/dashboard-settings', async function (req, res) {
    try {
        const [rows] = await con.execute('SELECT Config FROM UserDashboardSettings WHERE UserID = ?', [req.user.ID]);
        if (rows.length === 0) return res.json({ config: null });
        res.json({ config: typeof rows[0].Config === 'string' ? JSON.parse(rows[0].Config) : rows[0].Config });
    } catch (error) {
        res.status(500).json('Failed to fetch dashboard settings');
    }
});

router.post('/dashboard-settings', async function (req, res) {
    try {
        const { config } = req.body;
        // Check if exists to decide between INSERT or UPDATE if DB doesn't support REPLACE well or to be safe
        const [exists] = await con.execute('SELECT UserID FROM UserDashboardSettings WHERE UserID = ?', [req.user.ID]);
        if (exists.length > 0) {
            await con.execute('UPDATE UserDashboardSettings SET Config = ? WHERE UserID = ?', [JSON.stringify(config), req.user.ID]);
        } else {
            await con.execute('INSERT INTO UserDashboardSettings (UserID, Config) VALUES (?, ?)', [req.user.ID, JSON.stringify(config)]);
        }
        res.json('Dashboard settings updated');
    } catch (error) {
        res.status(500).json('Failed to save dashboard settings');
    }
});

module.exports = router;
