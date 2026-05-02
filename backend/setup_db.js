const bcrypt = require('bcryptjs');
const { con } = require('./database');

const tables = [
  "DROP TABLE IF EXISTS LMS_Submissions",
  "DROP TABLE IF EXISTS LMS_Assignments",
  "DROP TABLE IF EXISTS LMS_Enrollments",
  "DROP TABLE IF EXISTS LMS_Courses",
  "DROP TABLE IF EXISTS PasswordResetOTPs",
  "DROP TABLE IF EXISTS Users",

  `CREATE TABLE Users (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(255) NOT NULL,
    Email VARCHAR(255) UNIQUE NOT NULL,
    PasswordHash VARCHAR(255) NOT NULL,
    Role ENUM('Admin', 'Teacher', 'Student') NOT NULL,
    Status ENUM('active', 'inactive', 'pending') DEFAULT 'active',
    ProfileImage VARCHAR(255),
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,

  `CREATE TABLE PasswordResetOTPs (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    Email VARCHAR(255) NOT NULL,
    OTP VARCHAR(6) NOT NULL,
    ExpiresAt TIMESTAMP NOT NULL,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,

  `CREATE TABLE LMS_Courses (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    TeacherID INT,
    Name VARCHAR(255) NOT NULL,
    Fee DECIMAL(10, 2) DEFAULT 0.00,
    Description TEXT,
    Status ENUM('active', 'inactive') DEFAULT 'active',
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (TeacherID) REFERENCES Users(ID)
  )`,

  `CREATE TABLE LMS_Enrollments (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    UserID INT,
    CourseID INT,
    ReceiptUrl VARCHAR(255),
    AmountPaid DECIMAL(10, 2),
    Status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    AdminRemarks TEXT,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (UserID) REFERENCES Users(ID),
    FOREIGN KEY (CourseID) REFERENCES LMS_Courses(ID)
  )`,

  `CREATE TABLE LMS_Assignments (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    TeacherID INT,
    CourseID INT,
    Title VARCHAR(255) NOT NULL,
    Description TEXT,
    FileURL VARCHAR(255),
    DueDate DATETIME,
    MaxMarks INT DEFAULT 100,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (TeacherID) REFERENCES Users(ID),
    FOREIGN KEY (CourseID) REFERENCES LMS_Courses(ID)
  )`,

  `CREATE TABLE LMS_Submissions (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    AssignmentID INT,
    StudentID INT,
    FileURL VARCHAR(255),
    TextResponse TEXT,
    Marks DECIMAL(5,2),
    Feedback TEXT,
    SubmittedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (AssignmentID) REFERENCES LMS_Assignments(ID),
    FOREIGN KEY (StudentID) REFERENCES Users(ID)
  )`
];

async function setup() {
  try {
    console.log('--- Starting Ultimate Minimal LMS Setup ---');
    await con.execute('SET FOREIGN_KEY_CHECKS = 0');
    
    for (const sql of tables) {
      console.log(`Executing SQL...`);
      await con.execute(sql);
    }
    
    // Seed Default Admin
    const adminPass = await bcrypt.hash('admin123', 12);
    await con.execute(
        'INSERT INTO Users (Name, Email, PasswordHash, Role, Status) VALUES (?, ?, ?, ?, ?)',
        ['System Admin', 'admin@lms.com', adminPass, 'Admin', 'active']
    );
    console.log('--- Seeded Default Admin: admin@lms.com / admin123 ---');

    await con.execute('SET FOREIGN_KEY_CHECKS = 1');
    console.log('--- Database Setup Completed Successfully ---');
    process.exit(0);
  } catch (err) {
    console.error('Database Setup Failed:', err);
    process.exit(1);
  }
}

setup();
