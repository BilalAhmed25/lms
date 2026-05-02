const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return res.status(403).json('Authorization header missing');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.status(403).json('Token missing');
    }

    jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
        if (err) {
            return res.status(401).json('Invalid or expired token');
        }

        // Token contains ID, SchoolID, RoleID, RoleName, Email
        req.user = user;
        next();
    });
}

module.exports = authenticateToken;
