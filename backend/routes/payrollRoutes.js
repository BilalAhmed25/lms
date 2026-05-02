const express = require('express');
const router = express.Router();
const { con } = require('../database');
const authenticateToken = require('../authenticateToken');
const CommunicationHelper = require('../communicationHelper');
const sendEmail = require('../sendEmail');
const moment = require('moment');

// Initialization: Auto-create tables if they don't exist
const initPayroll = async () => {
    try {
        // Fix: Standard MySQL ALTER TABLE doesn't support IF NOT EXISTS. 
        // We'll check if the column exists in Staff table first (though it seems it already does based on userRoutes)
        await con.execute(`
            CREATE TABLE IF NOT EXISTS Payroll (
                ID INT AUTO_INCREMENT PRIMARY KEY,
                SchoolID INT NOT NULL,
                StaffID INT NOT NULL,
                Month VARCHAR(20) NOT NULL,
                Year INT NOT NULL,
                BasicSalary DECIMAL(10,2) NOT NULL,
                PresentDays INT DEFAULT 0,
                AbsentDays INT DEFAULT 0,
                LateDays INT DEFAULT 0,
                HalfDays INT DEFAULT 0,
                AttendanceSalary DECIMAL(10,2) NOT NULL,
                Bonus DECIMAL(10,2) DEFAULT 0.00,
                Deductions DECIMAL(10,2) DEFAULT 0.00,
                NetSalary DECIMAL(10,2) NOT NULL,
                Status ENUM('Generated', 'Paid', 'Cancelled') DEFAULT 'Generated',
                PaymentDate DATE NULL,
                VoucherNumber VARCHAR(50) UNIQUE NULL,
                CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (SchoolID) REFERENCES Schools(ID),
                FOREIGN KEY (StaffID) REFERENCES Staff(ID)
            )
        `);
    } catch (err) {
        console.error("Payroll Init Error:", err.message);
    }
};
initPayroll();

// GET /payroll/staff - Get staff list with attendance summary AND existing payroll data for a specific month
router.get('/staff', authenticateToken, async (req, res) => {
    const { month, year } = req.query;
    if (!month || !year) return res.status(400).send("Month and Year are required");

    try {
        // 1. Get staff and their existing payroll record (if any) for the period
        const [staff] = await con.execute(`
            SELECT s.ID, s.FirstName, s.LastName, r.Name as Role, s.EmployeeID, 
                   COALESCE(s.Salary, 0) as BasicSalary, u.Email, s.Phone as PhoneNumber, s.Designation,
                   p.ID as PayrollID, p.Bonus, p.Deductions, p.Status, p.VoucherNumber, p.PaymentDate, p.NetSalary as SavedNetSalary
            FROM Staff s
            JOIN Users u ON s.UserID = u.ID
            JOIN Roles r ON u.RoleID = r.ID
            LEFT JOIN Payroll p ON s.ID = p.StaffID AND p.Month = ? AND p.Year = ? AND p.Status != 'Cancelled'
            WHERE s.SchoolID = ? AND r.Name NOT IN ('Student', 'SuperAdmin')
        `, [month, year, req.user.SchoolID]);

        // 2. Get attendance summary for each staff in that month
        // Handle both numerical (04) and name (April) inputs for robust parsing
        const monthNum = isNaN(month) ? moment().month(month).format('MM') : month.toString().padStart(2, '0');
        const startDate = `${year}-${monthNum}-01`;
        const endDate = moment(startDate).endOf('month').format('YYYY-MM-DD');

        const [attendance] = await con.execute(`
            SELECT StaffID, Status, COUNT(*) as count
            FROM StaffAttendance
            WHERE SchoolID = ? AND Date BETWEEN ? AND ?
            GROUP BY StaffID, Status
        `, [req.user.SchoolID, startDate, endDate]);

        // 3. Merge data
        const staffWithAttendance = staff.map(s => {
            const att = attendance.filter(a => a.StaffID === s.ID);
            const summary = {
                Present: parseInt(att.find(a => a.Status === 'Present')?.count || 0),
                Absent: parseInt(att.find(a => a.Status === 'Absent')?.count || 0),
                Late: parseInt(att.find(a => a.Status === 'Late')?.count || 0),
                HalfDay: parseInt(att.find(a => a.Status === 'Half Day')?.count || 0),
            };
            return {
                ...s,
                attendance: summary,
                Bonus: parseFloat(s.Bonus) || 0,
                Deductions: parseFloat(s.Deductions) || 0,
                Status: s.Status || 'Unprocessed'
            };
        });

        res.json(staffWithAttendance);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// POST /payroll/generate - Save payroll records
router.post('/generate', authenticateToken, async (req, res) => {
    const { month, year, payrollData } = req.body;
    if (!payrollData || !Array.isArray(payrollData)) return res.status(400).send("Invalid data");

    const connection = await con.getConnection();
    try {
        await connection.beginTransaction();

        for (const p of payrollData) {
            const [exist] = await connection.execute(
                "SELECT ID FROM Payroll WHERE StaffID = ? AND Month = ? AND Year = ? AND Status != 'Cancelled'",
                [p.StaffID, month, year]
            );

            if (exist.length > 0) {
                // Only update if not Paid
                await connection.execute(
                    `UPDATE Payroll SET 
                        BasicSalary = ?, PresentDays = ?, AbsentDays = ?, 
                        LateDays = ?, HalfDays = ?, AttendanceSalary = ?, 
                        Bonus = ?, Deductions = ?, NetSalary = ? 
                     WHERE ID = ? AND Status != 'Paid'`,
                    [p.BasicSalary, p.PresentDays, p.AbsentDays, p.LateDays, p.HalfDays, p.AttendanceSalary, p.Bonus, p.Deductions, p.NetSalary, exist[0].ID]
                );
            } else {
                await connection.execute(
                    `INSERT INTO Payroll 
                        (SchoolID, StaffID, Month, Year, BasicSalary, PresentDays, AbsentDays, LateDays, HalfDays, AttendanceSalary, Bonus, Deductions, NetSalary, Status) 
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Generated')`,
                    [req.user.SchoolID, p.StaffID, month, year, p.BasicSalary, p.PresentDays, p.AbsentDays, p.LateDays, p.HalfDays, p.AttendanceSalary, p.Bonus, p.Deductions, p.NetSalary]
                );
            }
        }

        await connection.commit();
        res.json({ message: "Payroll saved successfully" });
    } catch (err) {
        await connection.rollback();
        res.status(500).send(err.message);
    } finally {
        connection.release();
    }
});

// POST /payroll/bulk-pay - Disburse multiple payrolls
router.post('/bulk-pay', authenticateToken, async (req, res) => {
    const { payrollIDs } = req.body;
    if (!payrollIDs || !Array.isArray(payrollIDs)) return res.status(400).send("Invalid IDs");

    const connection = await con.getConnection();
    try {
        await connection.beginTransaction();
        const results = [];

        for (const id of payrollIDs) {
            const [payroll] = await connection.execute(`
                SELECT p.*, s.FirstName, s.LastName, u.Email, s.Phone as PhoneNumber 
                FROM Payroll p 
                JOIN Staff s ON p.StaffID = s.ID
                JOIN Users u ON s.UserID = u.ID 
                WHERE p.ID = ? AND p.SchoolID = ? AND p.Status != 'Paid'
            `, [id, req.user.SchoolID]);

            if (payroll.length > 0) {
                const p = payroll[0];
                const voucherNum = `PAY-${Date.now()}-${p.StaffID}-${Math.floor(Math.random()*100)}`;
                const payDate = moment().format('YYYY-MM-DD');

                await connection.execute(
                    "UPDATE Payroll SET Status = 'Paid', PaymentDate = ?, VoucherNumber = ? WHERE ID = ?",
                    [payDate, voucherNum, id]
                );

                // Notifications (Async)
                const msg = `Dear ${p.FirstName}, Your salary for ${p.Month} ${p.Year} of Rs. ${p.NetSalary.toLocaleString()} has been disbursed. Voucher: ${voucherNum}`;
                if (p.PhoneNumber) CommunicationHelper.dispatchSMS(req.user.ID, p.PhoneNumber, msg).catch(e => console.error(e));
                if (p.Email) sendEmail(process.env.SMTP_USER, p.Email, `Salary Credit Advice`, `<p>${msg}</p>`).catch(e => console.error(e));

                results.push({ id, status: 'Paid', voucherNum });
            }
        }

        await connection.commit();
        res.json({ message: "Bulk disbursement completed", processingCount: results.length });
    } catch (err) {
        await connection.rollback();
        res.status(500).send(err.message);
    } finally {
        connection.release();
    }
});

router.post('/pay', authenticateToken, async (req, res) => {
    const { payrollID } = req.body;
    try {
        const [payroll] = await con.execute(`
            SELECT p.*, s.FirstName, s.LastName, u.Email, s.Phone as PhoneNumber 
            FROM Payroll p 
            JOIN Staff s ON p.StaffID = s.ID
            JOIN Users u ON s.UserID = u.ID 
            WHERE p.ID = ? AND p.SchoolID = ?
        `, [payrollID, req.user.SchoolID]);

        if (payroll.length === 0) return res.status(404).send("Payroll record not found");
        const p = payroll[0];

        if (p.Status === 'Paid') return res.status(400).send("Already paid");

        const voucherNum = `PAY-${Date.now()}-${p.StaffID}`;
        await con.execute(
            "UPDATE Payroll SET Status = 'Paid', PaymentDate = ?, VoucherNumber = ? WHERE ID = ?",
            [moment().format('YYYY-MM-DD'), voucherNum, payrollID]
        );

        const msg = `Dear ${p.FirstName}, Your salary for ${p.Month} ${p.Year} of Rs. ${p.NetSalary.toLocaleString()} has been disbursed. Receipt: ${voucherNum}`;
        if (p.PhoneNumber) await CommunicationHelper.dispatchSMS(req.user.ID, p.PhoneNumber, msg);
        if (p.Email) await sendEmail(process.env.SMTP_USER, p.Email, `Salary Disbursed - ${p.Month} ${p.Year}`, `<p>${msg}</p>`);

        res.json({ message: "Payment processed", voucherNumber: voucherNum });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

module.exports = router;
