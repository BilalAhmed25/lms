const { con } = require('./database');

async function fixTable() {
    try {
        await con.query('ALTER TABLE Classes ADD COLUMN Description TEXT AFTER Fee');
        console.log('Success!');
        process.exit(0);
    } catch (err) {
        // If IF NOT EXISTS is not supported by the mysql version, it might fail if already exists
        // but here it's likely missing.
        console.error('Failed:', err.message);
        process.exit(1);
    }
}

fixTable();
