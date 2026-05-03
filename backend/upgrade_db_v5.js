const { con } = require('./database');

async function upgradeV5() {
  console.log('--- Upgrading Schema to v5 (Original Fee) ---');

  try {
    // 1. Add OriginalFee column to LMS_Courses
    console.log('Adding OriginalFee column to LMS_Courses...');
    try {
        await con.execute('ALTER TABLE LMS_Courses ADD COLUMN OriginalFee DECIMAL(10, 2) AFTER Fee');
        console.log('Executed: ALTER TABLE LMS_Courses ADD COLUMN OriginalFee DECIMAL(10, 2) AFTER Fee');
    } catch (e) {
        console.log(`Column might already exist or error: ${e.message}`);
    }

    // 2. Set OriginalFee for existing courses (simulating a 30-50% discount)
    console.log('Setting OriginalFee for existing courses...');
    const [courses] = await con.execute('SELECT ID, Fee FROM LMS_Courses');
    
    for (const course of courses) {
        if (Number(course.Fee) > 0) {
            const original = Number(course.Fee) * (1.3 + Math.random() * 0.4);
            await con.execute('UPDATE LMS_Courses SET OriginalFee = ? WHERE ID = ?', [original.toFixed(2), course.ID]);
            console.log(`Updated Course ID ${course.ID}: Fee ${course.Fee} -> Original ${original.toFixed(2)}`);
        }
    }

    console.log('✅ Successfully upgraded schema and set original prices.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Upgrade failed:', err);
    process.exit(1);
  }
}

upgradeV5();
