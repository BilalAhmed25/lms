const { con } = require('./database');

async function upgradeV7() {
  console.log('--- Upgrading Schema to v7 (Sessions, Rich Assignments & Grading) ---');

  try {
    await con.execute('SET FOREIGN_KEY_CHECKS = 0');

    // 1. Create LMS_Sessions for Zoom/Class schedules
    console.log('Creating LMS_Sessions table...');
    await con.execute(`
      CREATE TABLE IF NOT EXISTS LMS_Sessions (
        ID INT AUTO_INCREMENT PRIMARY KEY,
        CourseID INT,
        TeacherID INT,
        Title VARCHAR(255) NOT NULL,
        Description TEXT,
        SessionDate DATETIME NOT NULL,
        DurationMinutes INT DEFAULT 60,
        ZoomLink VARCHAR(512),
        RecordingUrl VARCHAR(512),
        Status ENUM('upcoming', 'live', 'completed', 'cancelled') DEFAULT 'upcoming',
        CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (CourseID) REFERENCES LMS_Courses(ID) ON DELETE CASCADE,
        FOREIGN KEY (TeacherID) REFERENCES Users(ID)
      )
    `);

    // 2. Update LMS_Assignments for rich types and questions
    console.log('Enhancing LMS_Assignments table...');
    const assignmentColumns = [
      'ALTER TABLE LMS_Assignments ADD COLUMN Type ENUM("assignment", "quiz", "exam") DEFAULT "assignment" AFTER CourseID',
      'ALTER TABLE LMS_Assignments ADD COLUMN Questions JSON AFTER Description',
      'ALTER TABLE LMS_Assignments ADD COLUMN PassingMarks INT DEFAULT 40 AFTER MaxMarks',
      'ALTER TABLE LMS_Assignments ADD COLUMN TimeLimitMinutes INT DEFAULT 0 AFTER DueDate'
    ];

    for (const sql of assignmentColumns) {
        try { await con.execute(sql); } catch (e) {}
    }

    // 3. Update LMS_Submissions for structured answers
    console.log('Enhancing LMS_Submissions table...');
    const submissionColumns = [
      'ALTER TABLE LMS_Submissions ADD COLUMN Answers JSON AFTER TextResponse',
      'ALTER TABLE LMS_Submissions ADD COLUMN Status ENUM("submitted", "graded", "resubmission_requested") DEFAULT "submitted" AFTER Feedback',
      'ALTER TABLE LMS_Submissions ADD COLUMN GradedBy INT AFTER StudentID',
      'ALTER TABLE LMS_Submissions ADD FOREIGN KEY (GradedBy) REFERENCES Users(ID)'
    ];

    for (const sql of submissionColumns) {
        try { await con.execute(sql); } catch (e) {}
    }

    await con.execute('SET FOREIGN_KEY_CHECKS = 1');
    console.log('✅ Successfully upgraded schema to v7.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Upgrade failed:', err);
    process.exit(1);
  }
}

upgradeV7();
