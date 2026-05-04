const { con } = require('./database');

async function upgradeV8() {
  console.log('--- Upgrading Schema to v8 (Resources, Announcements & Rejection Logic) ---');

  try {
    await con.execute('SET FOREIGN_KEY_CHECKS = 0');

    // 1. Create LMS_Resources for PDFs, Handouts, etc.
    console.log('Creating LMS_Resources table...');
    await con.execute(`
      CREATE TABLE IF NOT EXISTS LMS_Resources (
        ID INT AUTO_INCREMENT PRIMARY KEY,
        CourseID INT,
        TeacherID INT,
        Title VARCHAR(255) NOT NULL,
        Description TEXT,
        FileURL VARCHAR(512) NOT NULL,
        FileType VARCHAR(50) DEFAULT 'PDF',
        CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (CourseID) REFERENCES LMS_Courses(ID) ON DELETE CASCADE,
        FOREIGN KEY (TeacherID) REFERENCES Users(ID)
      )
    `);

    // 2. Create LMS_Announcements for broadcasting news
    console.log('Creating LMS_Announcements table...');
    await con.execute(`
      CREATE TABLE IF NOT EXISTS LMS_Announcements (
        ID INT AUTO_INCREMENT PRIMARY KEY,
        CourseID INT,
        AuthorID INT,
        Title VARCHAR(255) NOT NULL,
        Content TEXT NOT NULL,
        CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (CourseID) REFERENCES LMS_Courses(ID) ON DELETE CASCADE,
        FOREIGN KEY (AuthorID) REFERENCES Users(ID)
      )
    `);

    // 3. Add RejectionReason to LMS_Enrollments
    console.log('Adding RejectionReason to LMS_Enrollments...');
    try {
      await con.execute('ALTER TABLE LMS_Enrollments ADD COLUMN RejectionReason TEXT AFTER AdminRemarks');
    } catch (e) {
      console.log('RejectionReason column already exists or failed to add.');
    }

    await con.execute('SET FOREIGN_KEY_CHECKS = 1');
    console.log('✅ Successfully upgraded schema to v8.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Upgrade failed:', err);
    process.exit(1);
  }
}

upgradeV8();
