const { con } = require('./database');

async function upgradeV3() {
  console.log('--- Upgrading Schema to v3 (Rich Course Details) ---');

  try {
    // 1. Add new columns to LMS_Courses
    console.log('Adding rich content columns to LMS_Courses...');
    const columns = [
      'ALTER TABLE LMS_Courses ADD COLUMN WhatWillILearn TEXT AFTER Description',
      'ALTER TABLE LMS_Courses ADD COLUMN TargetAudience TEXT AFTER WhatWillILearn',
      'ALTER TABLE LMS_Courses ADD COLUMN Prerequisites TEXT AFTER TargetAudience',
      'ALTER TABLE LMS_Courses ADD COLUMN Duration VARCHAR(100) AFTER Prerequisites',
      'ALTER TABLE LMS_Courses ADD COLUMN TotalLessons INT DEFAULT 0 AFTER Duration'
    ];

    for (const sql of columns) {
        try {
            await con.execute(sql);
            console.log(`Executed: ${sql}`);
        } catch (e) {
            console.log(`Column might already exist: ${e.message}`);
        }
    }

    // 2. Update existing courses with rich content
    console.log('Updating courses with sample rich content...');
    
    const [courses] = await con.execute('SELECT ID FROM LMS_Courses');
    
    for (const course of courses) {
        const whatLearn = JSON.stringify([
            "Master core concepts and advanced techniques.",
            "Gain hands-on experience through practical projects.",
            "Understand industry best practices and standards.",
            "Prepare for professional certifications and exams."
        ]);
        const audience = "Students, professionals, and lifelong learners looking to advance their skills.";
        const prereqs = "Basic understanding of the subject and a passion for learning.";
        const duration = "40 - 60 Hours";
        const lessons = Math.floor(Math.random() * 20) + 15;

        await con.execute(`
            UPDATE LMS_Courses 
            SET WhatWillILearn = ?, TargetAudience = ?, Prerequisites = ?, Duration = ?, TotalLessons = ?
            WHERE ID = ?
        `, [whatLearn, audience, prereqs, duration, lessons, course.ID]);
    }

    console.log('✅ Successfully upgraded schema and enriched course data.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Upgrade failed:', err);
    process.exit(1);
  }
}

upgradeV3();
