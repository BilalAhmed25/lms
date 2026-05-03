const { con } = require('./database');

async function upgradeV4() {
  console.log('--- Upgrading Schema to v4 (Course Slugs) ---');

  try {
    // 1. Add Slug column to LMS_Courses
    console.log('Adding Slug column to LMS_Courses...');
    try {
        await con.execute('ALTER TABLE LMS_Courses ADD COLUMN Slug VARCHAR(255) UNIQUE AFTER Name');
        console.log('Executed: ALTER TABLE LMS_Courses ADD COLUMN Slug VARCHAR(255) UNIQUE AFTER Name');
    } catch (e) {
        console.log(`Column might already exist or error: ${e.message}`);
    }

    // 2. Generate slugs for existing courses
    console.log('Generating slugs for existing courses...');
    const [courses] = await con.execute('SELECT ID, Name FROM LMS_Courses');
    
    for (const course of courses) {
        const slug = course.Name.toLowerCase()
            .replace(/[^\w ]+/g, '')
            .replace(/ +/g, '-');
        
        await con.execute('UPDATE LMS_Courses SET Slug = ? WHERE ID = ?', [slug, course.ID]);
        console.log(`Updated: ${course.Name} -> ${slug}`);
    }

    console.log('✅ Successfully upgraded schema and generated slugs.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Upgrade failed:', err);
    process.exit(1);
  }
}

upgradeV4();
