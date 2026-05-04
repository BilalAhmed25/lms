require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// --- Auto-create Wishlist Table ---
const { con } = require('./database');

// --- Minimal LMS Routes ---
app.use('/auth', require('./routes/authRoutes'));
app.use('/users', require('./routes/userRoutes'));
app.use('/lms', require('./routes/lmsRoutes'));
app.use('/enrollment', require('./routes/enrollmentRoutes'));
app.use('/admin', require('./routes/adminRoutes'));
app.use('/wishlist', require('./routes/wishlistRoutes'));

// Socket.IO for real-time interactions (Cleaned up)
const io = require('socket.io')(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
    },
});

global.io = io;

io.on('connection', (socket) => {
    socket.on('join', (userId) => {
        socket.join(`user:${userId}`);
    });

    socket.on('disconnect', () => {
        // Disconnected
    });
});

const PORT = process.env.PORT || 3000;
server.timeout = 180000; // 3 minutes
server.listen(PORT, () => console.log(`Minimal LMS server running on port ${PORT}`));