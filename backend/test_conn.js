const { con } = require('./database');
async function test() {
    try {
        const [rows] = await con.execute('SELECT 1');
        console.log('Connection successful:', rows);
        process.exit(0);
    } catch (err) {
        console.error('Connection failed:', err);
        process.exit(1);
    }
}
test();
