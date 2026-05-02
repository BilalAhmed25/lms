var express = require('express'),
    moment = require('moment'),
    fs = require('fs'),
    path = require('path'),
    multer = require('multer'),
    bcrypt = require('bcryptjs'),
    router = express.Router()
    ;

const { con } = require('../database');
const authenticateToken = require('../authenticateToken');

router.use(authenticateToken);

router.post('/create-school', async function (req, res) {
    const { name, subdomain, logoUrl, adminEmail, adminPassword } = req.body;
    if (!name || !subdomain || !adminEmail || !adminPassword) {
        return res.status(400).json('Please provide school name, subdomain, and admin credentials.');
    }

    const connection = await con.getConnection();
    try {
        const [existingSchools] = await connection.execute('SELECT ID FROM Schools WHERE Subdomain = ?', [subdomain]);
        if (existingSchools.length > 0) {
            connection.release();
            return res.status(400).json('A school with this subdomain already exists.');
        }

        await connection.beginTransaction();

        const [schoolResult] = await connection.execute(
            'INSERT INTO Schools (Name, Subdomain, LogoUrl, Status) VALUES (?, ?, ?, ?)',
            [name, subdomain, logoUrl || null, 'active']
        );
        const schoolID = schoolResult.insertId;

        const [roleResult] = await connection.execute(
            'INSERT INTO Roles (SchoolID, Name, IsSystem) VALUES (?, ?, ?)',
            [schoolID, 'School Admin', true]
        );
        const roleID = roleResult.insertId;

        const hashedPassword = await bcrypt.hash(adminPassword, 12);
        await connection.execute(
            `INSERT INTO Users (SchoolID, Email, PasswordHash, RoleID, Status) 
             VALUES (?, ?, ?, ?, ?)`,
            [schoolID, adminEmail, hashedPassword, roleID, 'active']
        );

        await connection.commit();
        res.json('Success');
    } catch (error) {
        await connection.rollback();
        console.error("Error creating school:", error);
        if (error.code === 'ER_DUP_ENTRY') return res.status(400).json('This email is already in use.');
        return res.status(500).json('Error creating school: ' + error.message);
    } finally {
        connection.release();
    }
})

router.get('/schools', async function (req, res) {
    try {
        const [rows] = await con.execute('SELECT * FROM Schools');
        res.json(rows);
    } catch (error) {
        console.error("Error fetching schools:", error);
        res.status(500).json('Failed to fetch schools');
    }
})

module.exports = router;
