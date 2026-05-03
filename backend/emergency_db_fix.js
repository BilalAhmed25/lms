const { con } = require('./database');

async function fixMissingTables() {
  console.log('--- EMERGENCY: Restoring Missing LMS Tables ---');

  try {
    await con.execute('SET FOREIGN_KEY_CHECKS = 0');

    // 1. Restore LMS_Enrollments
    console.log('Restoring LMS_Enrollments...');
    await con.execute(`
      CREATE TABLE IF NOT EXISTS LMS_Enrollments (
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
      )
    `);

    // 2. Restore LMS_Assignments
    console.log('Restoring LMS_Assignments...');
    await con.execute(`
      CREATE TABLE IF NOT EXISTS LMS_Assignments (
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
      )
    `);

    // 3. Restore LMS_Submissions
    console.log('Restoring LMS_Submissions...');
    await con.execute(`
      CREATE TABLE IF NOT EXISTS LMS_Submissions (
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
      )
    `);

    await con.execute('SET FOREIGN_KEY_CHECKS = 1');

    console.log('✅ All missing tables restored successfully.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Restoration failed:', err);
    process.exit(1);
  }
}

fixMissingTables();
