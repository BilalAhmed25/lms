const { con } = require('./database');

async function cleanup() {
  try {
    const [rows] = await con.execute('SHOW TABLES');
    
    // Extract table names regardless of the key name (varies by DB name)
    const allTables = rows.map(r => Object.values(r)[0]);
    
    console.log('Current Tables:', allTables);
    
    const keepTables = ['Users', 'PasswordResetOTPs', 'LMS_Courses', 'LMS_Enrollments', 'LMS_Assignments', 'LMS_Submissions'];
    const dropTables = allTables.filter(t => !keepTables.includes(t));
    
    if (dropTables.length === 0) {
      console.log('No extra tables to drop.');
      process.exit(0);
    }
    
    console.log('Dropping Tables:', dropTables);
    await con.execute('SET FOREIGN_KEY_CHECKS = 0');
    for (const table of dropTables) {
      console.log(`Dropping ${table}...`);
      await con.execute(`DROP TABLE IF EXISTS \`${table}\``);
    }
    await con.execute('SET FOREIGN_KEY_CHECKS = 1');
    
    console.log('Cleanup Successful!');
    process.exit(0);
  } catch (err) {
    console.error('Cleanup Failed:', err);
    process.exit(1);
  }
}

cleanup();
