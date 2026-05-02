var express = require('express'),
    fs = require('fs'),
    path = require('path'),
    bcrypt = require('bcryptjs'),
    jwt = require('jsonwebtoken'),
    router = express.Router()
    ;

const { con } = require('../database');
const sendEmail = require('../sendEmail');
const authenticateToken = require('../authenticateToken');

router.post('/register', async function (req, res) {
    try {
        const { email, password, role, name } = req.body;
        if (!email || !password || !role) {
            return res.status(400).json('Email, password and role are required');
        }

        // Check if user already exists
        const [existing] = await con.execute('SELECT ID FROM Users WHERE Email = ? LIMIT 1', [email]);
        if (existing.length > 0) {
            return res.status(400).json('User with this email already exists');
        }

        // Get RoleID
        const [roleRows] = await con.execute('SELECT ID FROM Roles WHERE Name = ? LIMIT 1', [role]);
        if (roleRows.length === 0) {
            return res.status(400).json('Invalid role selected');
        }
        const roleId = roleRows[0].ID;

        const hashedPassword = await bcrypt.hash(password, 12);
        
        // Determine initial status: Teachers start as 'pending'
        const initialStatus = role === 'Teacher' ? 'pending' : 'active';
        const defaultSchoolID = 1; // Demo School

        // Insert User
        const [userResult] = await con.execute(
            'INSERT INTO Users (Email, PasswordHash, RoleID, Status, Name, SchoolId) VALUES (?, ?, ?, ?, ?, ?)',
            [email, hashedPassword, roleId, initialStatus, name || email.split('@')[0], defaultSchoolID]
        );
        const userId = userResult.insertId;

        // If Student, create student record
        if (role === 'Student') {
            await con.execute(
                'INSERT INTO Students (UserID, SchoolId, FirstName, LastName) VALUES (?, ?, ?, ?)',
                [userId, defaultSchoolID, name ? name.split(' ')[0] : 'Student', name ? (name.split(' ').slice(1).join(' ') || 'User') : '']
            );
        }

        const message = role === 'Teacher' 
            ? 'Registration successful! Your account is pending admin approval.' 
            : 'User registered successfully';

        res.status(201).json({ message, userId, status: initialStatus });
    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json('An error occurred during registration');
    }
});

router.post('/login', async function (req, res) {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json('Email and password are required');
        }

        const query = `
            SELECT u.*, r.Name AS RoleName, r.Access 
            FROM Users u 
            JOIN Roles r ON u.RoleID = r.ID 
            WHERE u.Email = ?
            LIMIT 1
        `;
        const [result] = await con.execute(query, [email]);
        if (result.length === 0) {
            return res.status(401).json('Incorrect email or password');
        }

        const user = result[0];
        const isMatch = await bcrypt.compare(password, user.PasswordHash);
        if (!isMatch) {
            return res.status(401).json('Incorrect email or password');
        }

        if (user.Status === 'pending') {
            return res.status(403).json('Your account is pending admin approval. Please wait for verification.');
        }

        if (user.Status !== 'active') {
            return res.status(403).json('Your account is not active. Please contact support.');
        }

        const tokenPayload = {
            ID: user.ID,
            SchoolId: user.SchoolId,
            RoleId: user.RoleId,
            RoleName: user.RoleName,
            Email: user.Email,
            Name: user.Name,
            Access: user.Access
        };
        const token = jwt.sign(tokenPayload, process.env.SECRET_KEY, { expiresIn: '12h' });

        res.json({ token, user: tokenPayload });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json('An internal error occurred during login');
    }
})

router.post('/forgot-password', async function (req, res) {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json('Provide your email');

        const [userRows] = await con.execute('SELECT * FROM Users WHERE Email = ? LIMIT 1', [email]);
        if (userRows.length === 0) return res.status(404).json('User not found');

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);


        await con.execute('DELETE FROM PasswordResetOTPs WHERE Email = ?', [email]);
        await con.execute(
            'INSERT INTO PasswordResetOTPs (Email, OTP, ExpiresAt) VALUES (?, ?, ?)',
            [email, otp, expiresAt]
        );

        const templatePath = path.join(__dirname, '../email-templates/otp-email-template.html');
        let htmlTemplate = '<h1>Your OTP is ' + otp + '</h1>';
        if (fs.existsSync(templatePath)) {
            htmlTemplate = fs.readFileSync(templatePath, 'utf-8')
                .replace(/\{\{otp\}\}/gi, otp)
                .replace(/\{\{email\}\}/gi, email)
                .replace(/\{\{expiresMinutes\}\}/g, '10')
                .replace(/\{\{OTP\}\}/g, otp);
        }

        await sendEmail(`"Edunex Support" <${process.env.SMTP_USER}>`, email, 'Your Password Reset OTP', htmlTemplate);
        res.json('OTP sent to email');
    } catch (error) {
        console.error("Forgot password error:", error);
        res.status(500).json('Failed to process forgot password request');
    }
})

router.post('/reset-password', async function (req, res) {
    try {
        const { email, newPassword, otp } = req.body;
        if (!newPassword || !email || !otp) return res.status(400).json('All fields required');

        const [otpRows] = await con.execute(
            'SELECT * FROM PasswordResetOTPs WHERE Email = ? AND OTP = ? AND ExpiresAt >= ? LIMIT 1',
            [email, otp, new Date()]
        );

        if (otpRows.length === 0) return res.status(400).json('Invalid or expired OTP');

        const hashedPassword = await bcrypt.hash(newPassword, 12);
        await con.execute('UPDATE Users SET PasswordHash = ? WHERE Email = ?', [hashedPassword, email]);
        await con.execute('DELETE FROM PasswordResetOTPs WHERE Email = ?', [email]);

        res.json('Password reset successfully');
    } catch (error) {
        console.error("Reset password error:", error);
        res.status(500).json('Failed to reset password');
    }
})

router.post('/change-password-init', authenticateToken, async function (req, res) {
    try {
        const { currentPassword } = req.body;
        if (!currentPassword) return res.status(400).json('Current password is required');

        const [userRows] = await con.execute('SELECT PasswordHash, Email FROM Users WHERE ID = ?', [req.user.ID]);
        if (userRows.length === 0) return res.status(404).json('User not found');

        const isMatch = await bcrypt.compare(currentPassword, userRows[0].PasswordHash);
        if (!isMatch) return res.status(401).json('Incorrect current password');

        const email = userRows[0].Email;
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);


        await con.execute('DELETE FROM PasswordResetOTPs WHERE Email = ?', [email]);
        await con.execute('INSERT INTO PasswordResetOTPs (Email, OTP, ExpiresAt) VALUES (?, ?, ?)', [email, otp, expiresAt]);

        const templatePath = path.join(__dirname, '../email-templates/otp-email-template.html');
        let htmlTemplate = '<h1>Your Edunex Verification Code: ' + otp + '</h1>';
        if (fs.existsSync(templatePath)) {
            htmlTemplate = fs.readFileSync(templatePath, 'utf-8')
                .replace(/\{\{otp\}\}/gi, otp)
                .replace(/\{\{email\}\}/gi, email)
                .replace(/\{\{OTP\}\}/gi, otp)
                .replace(/Archisketch Company/g, 'Edunex Global Solutions')
                .replace(/ST Group of Companies/g, 'Edunex School Management')
                .replace(/STGC/g, 'Edunex');
        }

        await sendEmail(`"Edunex Security" <${process.env.SMTP_USER}>`, email, 'Verification Code for Password Change', htmlTemplate);
        res.json({ message: 'OTP sent to your email' });
    } catch (error) {
        console.error("Change password init error:", error);
        res.status(500).json('Failed to initiate password change');
    }
});

router.post('/change-password-verify', authenticateToken, async function (req, res) {
    try {
        const { otp, newPassword } = req.body;
        if (!otp || !newPassword) return res.status(400).json('OTP and new password are required');

        const [userRows] = await con.execute('SELECT Email FROM Users WHERE ID = ?', [req.user.ID]);
        const email = userRows[0].Email;

        const [otpRows] = await con.execute(
            'SELECT * FROM PasswordResetOTPs WHERE Email = ? AND OTP = ? AND ExpiresAt >= ? LIMIT 1',
            [email, otp, new Date()]
        );

        if (otpRows.length === 0) return res.status(400).json('Invalid or expired OTP');

        const hashedPassword = await bcrypt.hash(newPassword, 12);
        await con.execute('UPDATE Users SET PasswordHash = ? WHERE ID = ?', [hashedPassword, req.user.ID]);
        await con.execute('DELETE FROM PasswordResetOTPs WHERE Email = ?', [email]);

        res.json('Password updated successfully');
    } catch (error) {
        console.error("Change password verify error:", error);
        res.status(500).json('Failed to verify OTP and change password');
    }
});

module.exports = router;
