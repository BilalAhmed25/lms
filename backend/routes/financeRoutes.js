var express = require('express'),
    router = express.Router()
    ;

const { con } = require('../database');
const authenticateToken = require('../authenticateToken');
const NotificationService = require('../notificationService');

router.use(authenticateToken);

// FEE STRUCTURES

// Get all fee structures
router.get('/fee-structures', async function (req, res) {
    try {
        const { academicYearID, classID } = req.query;
        let query = `
            SELECT fs.*, c.Name as ClassName, ay.Name as AcademicYearName 
            FROM FeeStructures fs
            JOIN Classes c ON fs.ClassID = c.ID
            JOIN AcademicYears ay ON fs.AcademicYearID = ay.ID
            WHERE fs.SchoolID = ?
        `;
        const params = [req.user.SchoolID];

        if (academicYearID) {
            query += ' AND fs.AcademicYearID = ?';
            params.push(academicYearID);
        }
        if (classID) {
            query += ' AND fs.ClassID = ?';
            params.push(classID);
        }

        query += ' ORDER BY ay.StartDate DESC, c.Name ASC, fs.FeeType ASC';

        const [rows] = await con.execute(query, params);
        res.json(rows);
    } catch (error) {
        console.error("Error fetching fee structures:", error);
        res.status(500).json('Failed to fetch fee structures');
    }
});

// Create new fee structure
router.post('/fee-structures', async function (req, res) {
    try {
        const { classID, feeType, amount, academicYearID } = req.body;
        if (!classID || !feeType || !amount || !academicYearID) {
            return res.status(400).json('All fields are required');
        }

        const [result] = await con.execute(
            'INSERT INTO FeeStructures (SchoolID, ClassID, FeeType, Amount, AcademicYearID) VALUES (?, ?, ?, ?, ?)',
            [req.user.SchoolID, classID, feeType, amount, academicYearID]
        );

        res.json('Success');
    } catch (error) {
        console.error("Error creating fee structure:", error);
        res.status(500).json('Failed to create fee structure');
    }
});

// Update fee structure
router.put('/fee-structures/:id', async function (req, res) {
    try {
        const { classID, feeType, amount, academicYearID } = req.body;
        if (!classID || !feeType || !amount || !academicYearID) {
            return res.status(400).json('All fields are required');
        }

        await con.execute(
            'UPDATE FeeStructures SET ClassID = ?, FeeType = ?, Amount = ?, AcademicYearID = ? WHERE ID = ? AND SchoolID = ?',
            [classID, feeType, amount, academicYearID, req.params.id, req.user.SchoolID]
        );

        res.json('Success');
    } catch (error) {
        console.error("Error updating fee structure:", error);
        res.status(500).json('Failed to update fee structure');
    }
});

// Delete fee structure
router.delete('/fee-structures/:id', async function (req, res) {
    try {
        await con.execute('DELETE FROM FeeStructures WHERE ID = ? AND SchoolID = ?', [req.params.id, req.user.SchoolID]);
        res.json('Success');
    } catch (error) {
        console.error("Error deleting fee structure:", error);
        res.status(500).json('Failed to delete fee structure');
    }
});

// --- INVOICES / VOUCHERS ---

// 1. Fetch Student Summary by Admission Number for Invoice Generation
router.get('/student-lookup/:admNo', async function (req, res) {
    try {
        const query = `
            SELECT s.ID, s.FirstName, s.LastName, s.AdmissionNumber, s.RollNumber, 
                   s.ConcessionValue, c.Name as ClassName, s.ClassID,
                   ay.Name as AcademicYearName, s.AcademicYearID
            FROM Students s
            JOIN Classes c ON s.ClassID = c.ID
            JOIN AcademicYears ay ON s.AcademicYearID = ay.ID
            WHERE s.AdmissionNumber = ? AND s.SchoolID = ?
        `;
        const [rows] = await con.execute(query, [req.params.admNo, req.user.SchoolID]);
        if (rows.length === 0) return res.status(404).json('Student not found');
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json('Search failed');
    }
});

// 1b. Fetch Student Paid Fees (To filter months)
router.get('/student-paid-fees/:studentID', async function (req, res) {
    try {
        const query = `
            SELECT vd.FeeType, vd.Month
            FROM VoucherDetails vd
            JOIN Vouchers v ON vd.VoucherID = v.ID
            WHERE v.StudentID = ? AND v.SchoolID = ? AND v.Status = 'Paid'
        `;
        const [rows] = await con.execute(query, [req.params.studentID, req.user.SchoolID]);
        res.json(rows);
    } catch (error) {
        res.status(500).json('Failed to fetch student fee history');
    }
});

// 1c. Fetch Full History for a Single Student
router.get('/student-history/:studentID', async function (req, res) {
    try {
        const query = `
            SELECT v.*, ay.Name as AcademicYearName 
            FROM Vouchers v
            JOIN AcademicYears ay ON v.AcademicYearID = ay.ID
            WHERE v.StudentID = ? AND v.SchoolID = ?
            ORDER BY v.CreatedAt DESC
        `;
        const [rows] = await con.execute(query, [req.params.studentID, req.user.SchoolID]);
        res.json(rows);
    } catch (error) {
        res.status(500).json('Failed to fetch history');
    }
});

// 2. Generate and Save Voucher
router.post('/vouchers', async function (req, res) {
    const connection = await con.getConnection();
    try {
        await connection.beginTransaction();

        const { studentID, academicYearID, totalAmount, concessionAmount, payableAmount, items } = req.body;

        // Auto-generate Voucher Number (SchoolCode-Year-Serial)
        const [vCount] = await connection.execute('SELECT COUNT(*) as count FROM Vouchers WHERE SchoolID = ?', [req.user.SchoolID]);
        const voucherNo = `VCH-${new Date().getFullYear()}-${(vCount[0].count + 1).toString().padStart(6, '0')}`;

        // Create Voucher
        const [vResult] = await connection.execute(`
            INSERT INTO Vouchers (SchoolID, VoucherNumber, StudentID, AcademicYearID, TotalAmount, ConcessionAmount, PayableAmount, Status, CreatedBy)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [req.user.SchoolID, voucherNo, studentID, academicYearID, totalAmount, concessionAmount, payableAmount, 'Paid', req.user.ID]);

        const voucherID = vResult.insertId;

        // Create Details
        for (const item of items) {
            await connection.execute(`
                INSERT INTO VoucherDetails (VoucherID, FeeType, Month, Amount)
                VALUES (?, ?, ?, ?)
            `, [voucherID, item.feeType, item.month, item.amount]);
        }

        await connection.commit();

        // Async Notification
        // We get students/billing month info from items or DB
        const billingMonth = items.length > 0 ? items[0].month : 'N/A';
        NotificationService.notifyFeeVoucher(req.user.SchoolID, studentID, voucherNo, payableAmount, billingMonth, new Date(Date.now() + 7*24*60*60*1000), req.user.ID);

        res.json({ message: 'Success', voucherNumber: voucherNo, voucherID: voucherID });
    } catch (error) {
        await connection.rollback();
        console.error("Voucher error:", error);
        res.status(500).json('Failed to generate voucher');
    } finally {
        connection.release();
    }
});

// 3. Get Vouchers List / Collections Report
router.get('/vouchers', async function (req, res) {
    try {
        const { startDate, endDate, studentID, status } = req.query;
        let query = `
            SELECT v.*, s.FirstName, s.LastName, s.AdmissionNumber, c.Name as ClassName
            FROM Vouchers v
            JOIN Students s ON v.StudentID = s.ID
            JOIN Classes c ON s.ClassID = c.ID
            WHERE v.SchoolID = ?
        `;
        const params = [req.user.SchoolID];

        if (startDate && endDate) {
            query += ' AND v.CreatedAt BETWEEN ? AND ?';
            params.push(startDate + ' 00:00:00', endDate + ' 23:59:59');
        }
        if (studentID) {
            query += ' AND v.StudentID = ?';
            params.push(studentID);
        }
        if (status) {
            query += ' AND v.Status = ?';
            params.push(status);
        }

        query += ' ORDER BY v.CreatedAt DESC';
        const [rows] = await con.execute(query, params);
        res.json(rows);
    } catch (error) {
        res.status(500).json('Failed to fetch vouchers');
    }
});

// 4. Get Single Voucher Detail
router.get('/vouchers/:id', async function (req, res) {
    try {
        const [vMain] = await con.execute(`
            SELECT v.*, s.FirstName, s.LastName, s.AdmissionNumber, c.Name as ClassName, ay.Name as AcademicYearName
            FROM Vouchers v
            JOIN Students s ON v.StudentID = s.ID
            JOIN Classes c ON s.ClassID = c.ID
            JOIN AcademicYears ay ON v.AcademicYearID = ay.ID
            WHERE v.ID = ? AND v.SchoolID = ?
        `, [req.params.id, req.user.SchoolID]);

        if (vMain.length === 0) return res.status(404).json('Voucher not found');

        const [details] = await con.execute('SELECT * FROM VoucherDetails WHERE VoucherID = ?', [req.params.id]);
        
        res.json({ ...vMain[0], items: details });
    } catch (error) {
        res.status(500).json('Failed to fetch voucher detail');
    }
});

// 5. Update Voucher Status
router.put('/vouchers/:id/status', async function (req, res) {
    try {
        const { status } = req.body; // 'Paid', 'Pending', 'Cancelled'
        await con.execute('UPDATE Vouchers SET Status = ? WHERE ID = ? AND SchoolID = ?', [status, req.params.id, req.user.SchoolID]);
        res.json('Success');
    } catch (error) {
        res.status(500).json('Update failed');
    }
});

// 6. Detailed Ledger / Collection Report (Individual Items)
router.get('/ledger', async function (req, res) {
    try {
        const { startDate, endDate } = req.query;
        let query = `
            SELECT v.CreatedAt, v.VoucherNumber, s.FirstName, s.LastName, 
                   s.AdmissionNumber, c.Name as ClassName, vd.FeeType, vd.Month, vd.Amount, v.Status
            FROM Vouchers v
            JOIN Students s ON v.StudentID = s.ID
            JOIN Classes c ON s.ClassID = c.ID
            JOIN VoucherDetails vd ON v.ID = vd.VoucherID
            WHERE v.SchoolID = ?
        `;
        const params = [req.user.SchoolID];
        if (startDate && endDate) {
            query += ' AND v.CreatedAt BETWEEN ? AND ?';
            params.push(startDate + ' 00:00:00', endDate + ' 23:59:59');
        }
        query += ' ORDER BY v.CreatedAt DESC, v.ID DESC';
        const [rows] = await con.execute(query, params);
        res.json(rows);
    } catch (error) {
        res.status(500).json('Ledger generation failed');
    }
});

// 6b. Combined General Ledger (Aggregated Vouchers + Expenses)
router.get('/combined-ledger', async function (req, res) {
    try {
        const { startDate, endDate } = req.query;
        const schoolID = req.user.SchoolID;
        const params = [schoolID];
        let dateCondition = "";
        
        if (startDate && endDate) {
            dateCondition = ' AND CreatedAt BETWEEN ? AND ?';
            params.push(startDate + ' 00:00:00', endDate + ' 23:59:59');
        }

        // Fetch Paid Vouchers (Income)
        let voucherQuery = `
            SELECT ID, CreatedAt as Date, VoucherNumber as Reference, 'Income' as Type, 'Student Fee Collection' as Category, 
                   CONCAT(VoucherNumber, ' - Fee Payment') as Description, PayableAmount as Amount
            FROM Vouchers 
            WHERE SchoolID = ? AND Status = 'Paid'
        `;
        if (startDate && endDate) voucherQuery += ' AND CreatedAt BETWEEN ? AND ?';
        
        // Fetch Expenses (Outflow)
        let expenseQuery = `
            SELECT ID, ExpenseDate as Date, ID as Reference, 'Expense' as Type, Category, 
                   Description, Amount
            FROM Expenses
            WHERE SchoolID = ?
        `;
        const expenseParams = [schoolID];
        if (startDate && endDate) {
            expenseQuery += ' AND ExpenseDate BETWEEN ? AND ?';
            expenseParams.push(startDate, endDate);
        }

        const [income] = await con.execute(voucherQuery, params);
        const [outflow] = await con.execute(expenseQuery, expenseParams);

        // Combine and Sort
        const combined = [...income, ...outflow].sort((a, b) => new Date(b.Date) - new Date(a.Date));
        
        res.json(combined);
    } catch (error) {
        console.error("General Ledger Error:", error);
        res.status(500).json('General Ledger generation failed');
    }
});

// --- EXPENSE MANAGEMENT ---

// 7. Get Expenses
router.get('/expenses', async function (req, res) {
    try {
        const { startDate, endDate } = req.query;
        let query = `
            SELECT e.*, s.FirstName, s.LastName 
            FROM Expenses e
            JOIN Users u ON e.CreatedBy = u.ID
            LEFT JOIN Staff s ON u.ID = s.UserID
            WHERE e.SchoolID = ?
        `;
        const params = [req.user.SchoolID];

        if (startDate && endDate) {
            query += ' AND e.ExpenseDate BETWEEN ? AND ?';
            params.push(startDate, endDate);
        }

        query += ' ORDER BY e.ExpenseDate DESC, e.CreatedAt DESC';

        const [rows] = await con.execute(query, params);
        res.json(rows);
    } catch (error) {
        console.error("Expense fetch error:", error);
        res.status(500).json('Failed to fetch expenses');
    }
});

// 8. Create Expense
router.post('/expenses', async function (req, res) {
    try {
        const { date, category, description, amount } = req.body;
        if (!date || !category || !amount) {
            return res.status(400).json('Required fields missing');
        }

        await con.execute(`
            INSERT INTO Expenses (SchoolID, ExpenseDate, Category, Description, Amount, CreatedBy)
            VALUES (?, ?, ?, ?, ?, ?)
        `, [req.user.SchoolID, date, category, description, amount, req.user.ID]);

        res.json('Success');
    } catch (error) {
        res.status(500).json('Failed to log expense');
    }
});

// 9. Delete Expense
router.delete('/expenses/:id', async function (req, res) {
    try {
        await con.execute('DELETE FROM Expenses WHERE ID = ? AND SchoolID = ?', [req.params.id, req.user.SchoolID]);
        res.json('Success');
    } catch (error) {
        res.status(500).json('Failed to delete expense');
    }
});


module.exports = router;
