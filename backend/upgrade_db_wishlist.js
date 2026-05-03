const { con } = require('./database');

async function upgrade() {
    try {
        console.log('--- Adding Wishlist Table ---');
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
        console.log('--- Wishlist Table Created ---');
        process.exit(0);
    } catch (err) {
        console.error('Upgrade Failed:', err);
        process.exit(1);
    }
}

upgrade();
