require('dotenv').config();
var express = require('express'),
    cors = require('cors'),
    http = require('http');

const app = express();
const server = http.createServer(app);
const { con } = require('./database');

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.use('/auth', require('./routes/authRoutes'));
app.use('/superadmin', require('./routes/superAdminRoutes'));
app.use('/academic', require('./routes/academicRoutes'));
app.use('/roles', require('./routes/roleRoutes'));
app.use('/users', require('./routes/userRoutes'));
app.use('/activity', require('./routes/activityRoutes'));
app.use('/finance', require('./routes/financeRoutes'));
app.use('/lms',     require('./routes/lmsRoutes'));
app.use('/payroll', require('./routes/payrollRoutes'));
app.use('/enrollment', require('./routes/enrollmentRoutes'));
app.use('/admin', require('./routes/adminRoutes'));

// Socket.IO
const io = require('socket.io')(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
    },
});

global.io = io;

io.on('connection', (socket) => {
    socket.on('join', (schoolID) => {
        socket.join(`school:${schoolID}`);
        socket.schoolID = schoolID;
    });

    socket.on('disconnect', () => {
        if (socket.userID) {
            // console.log(`User ${socket.userID} disconnected`);
        }
    });

});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Edunex server running on port ${PORT}`));