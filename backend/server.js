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
const createWishlistTable = async () => {
    try {
        await con.execute(`
            CREATE TABLE IF NOT EXISTS LMS_Wishlist (
                ID INT AUTO_INCREMENT PRIMARY KEY,
                UserID INT NOT NULL,
                CourseID INT NOT NULL,
                CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE KEY unique_wishlist (UserID, CourseID),
                FOREIGN KEY (UserID) REFERENCES Users(ID),
                FOREIGN KEY (CourseID) REFERENCES LMS_Courses(ID)
            )
        `);
        console.log('Wishlist table verified/created');
    } catch (err) {
        console.error('Error creating wishlist table:', err);
    }
};
createWishlistTable();

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
server.listen(PORT, () => console.log(`Minimal LMS server running on port ${PORT}`));