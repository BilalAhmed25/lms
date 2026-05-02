const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();
const { con } = require('../database');

// REGISTER
router.post('/register', async (req, res) => {
    try {
        const { email, password, role, name } = req.body;
        if (!email || !password || !role) return res.status(400).json('Missing fields');

        const [existing] = await con.execute('SELECT ID FROM Users WHERE Email = ?', [email]);
        if (existing.length > 0) return res.status(400).json('Email already exists');

        const hashedPassword = await bcrypt.hash(password, 12);
        const status = role === 'Teacher' ? 'pending' : 'active';

        const [result] = await con.execute(
            'INSERT INTO Users (Email, PasswordHash, Role, Name, Status) VALUES (?, ?, ?, ?, ?)',
            [email, hashedPassword, role, name || email.split('@')[0], status]
        );

        res.status(201).json({ message: 'User registered', userId: result.insertId });
    } catch (err) {
        console.error(err);
        res.status(500).json('Registration failed');
    }
});

// LOGIN
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const [rows] = await con.execute('SELECT * FROM Users WHERE Email = ?', [email]);
        if (rows.length === 0) return res.status(401).json('Invalid credentials');

        const user = rows[0];
        const isMatch = await bcrypt.compare(password, user.PasswordHash);
        if (!isMatch) return res.status(401).json('Invalid credentials');

        if (user.Status === 'pending') return res.status(403).json('Account pending approval');
        if (user.Status !== 'active') return res.status(403).json('Account disabled');

        const tokenPayload = {
            ID: user.ID,
            Email: user.Email,
            Name: user.Name,
            Role: user.Role
        };

        const token = jwt.sign(tokenPayload, process.env.SECRET_KEY, { expiresIn: '12h' });
        res.json({ token, user: tokenPayload });
    } catch (err) {
        res.status(500).json('Login failed');
    }
});

module.exports = router;
