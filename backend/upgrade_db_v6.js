const { con } = require('./database');

async function upgradeV6() {
  console.log('--- Upgrading Schema to v6 (Offer Expiry Date) ---');

  try {
    // 1. Add OfferExpiryDate column to LMS_Courses
    console.log('Adding OfferExpiryDate column to LMS_Courses...');
    try {
        await con.execute('ALTER TABLE LMS_Courses ADD COLUMN OfferExpiryDate DATETIME AFTER OriginalFee');
        console.log('Executed: ALTER TABLE LMS_Courses ADD COLUMN OfferExpiryDate DATETIME AFTER OriginalFee');
    } catch (e) {
        console.log(`Column might already exist or error: ${e.message}`);
    }

    // 2. Set OfferExpiryDate for existing courses (simulating 1-7 days from now)
    console.log('Setting OfferExpiryDate for existing courses...');
    const [courses] = await con.execute('SELECT ID FROM LMS_Courses');
    
    for (const course of courses) {
        const days = Math.floor(Math.random() * 5) + 1; // 1 to 5 days
        const expiry = new Date();
        expiry.setDate(expiry.getDate() + days);
        
        await con.execute('UPDATE LMS_Courses SET OfferExpiryDate = ? WHERE ID = ?', [expiry, course.ID]);
        console.log(`Updated Course ID ${course.ID}: Expiry set to ${days} days from now.`);
    }

    console.log('✅ Successfully upgraded schema and set offer expiry dates.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Upgrade failed:', err);
    process.exit(1);
  }
}

upgradeV6();
