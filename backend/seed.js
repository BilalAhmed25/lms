require('dotenv').config();
const { con } = require('./database');
const bcrypt = require('bcryptjs');

async function seedDatabase() {
  console.log('Seeding Edunex Database...');

  try {
    // 1. Clear existing Data for smooth seeding
    console.log('Clearing old dependencies...');
    await con.query('SET FOREIGN_KEY_CHECKS = 0');
    await con.query('TRUNCATE TABLE Users');
    await con.query('TRUNCATE TABLE Roles');
    await con.query('TRUNCATE TABLE Schools');
    await con.query('SET FOREIGN_KEY_CHECKS = 1');

    // 2. Insert School
    console.log('Creating Demo School...');
    const [schoolResult] = await con.query(
      `INSERT INTO Schools (Name, Subdomain, LogoUrl, Status) VALUES (?, ?, ?, ?)`,
      ['Edunex Demo School', 'demo', '', 'active']
    );
    const schoolId = schoolResult.insertId;

    // 3. Insert Roles with JSON Access
    console.log('Creating Roles with JSON Access...');
    const roles = [
      { 
        name: 'SuperAdmin', 
        isSystem: true,
        access: JSON.stringify(['1', '1.1', '2', '2.1', '2.1.1', '2.1.2', '2.1.3', '2.2', '2.2.1', '2.2.2', '2.2.3', '2.3', '2.3.1', '2.3.2', '2.4', '2.4.1', '2.4.2', '2.4.3', '3', '3.1', '3.1.1', '3.1.2', '3.2', '3.2.1', '3.2.2', '4', '4.1', '4.1.1', '4.1.2']) 
      },
      { 
        name: 'SchoolAdmin', 
        isSystem: false,
        access: JSON.stringify(['1', '1.1', '2', '2.1', '2.1.1', '2.1.2', '2.1.3', '2.2', '2.2.1', '2.2.2', '2.2.3', '2.3', '2.3.1', '2.3.2', '2.4', '2.4.1', '2.4.2', '2.4.3', '3', '3.1', '3.1.1', '3.1.2', '3.2', '3.2.1', '3.2.2', '4', '4.1', '4.1.1', '4.1.2'])
      },
      { 
        name: 'Teacher', 
        isSystem: false,
        access: JSON.stringify(['1', '1.1', '2.3', '2.3.1', '3', '3.1', '3.1.1', '3.1.2'])
      },
      { 
        name: 'Student', 
        isSystem: false,
        access: JSON.stringify(['1', '1.1', '3', '3.2', '3.2.1', '3.2.2'])
      }
    ];

    const roleIds = {};
    for (const role of roles) {
      const [roleResult] = await con.query(
        `INSERT INTO Roles (SchoolId, Name, Access, IsSystem) VALUES (?, ?, ?, ?)`,
        [role.isSystem ? null : schoolId, role.name, role.access, role.isSystem]
      );
      roleIds[role.name] = roleResult.insertId;
    }

    // 4. Insert Admins
    console.log('Creating Users...');
    const passwordHash = await bcrypt.hash('password', 10);

    // SuperAdmin
    await con.query(
      `INSERT INTO Users (SchoolId, Email, PasswordHash, RoleId, Status) VALUES (?, ?, ?, ?, ?)`,
      [null, 'admin@edunex.com', passwordHash, roleIds['SuperAdmin'], 'active']
    );

    // SchoolAdmin
    await con.query(
      `INSERT INTO Users (SchoolId, Email, PasswordHash, RoleId, Status) VALUES (?, ?, ?, ?, ?)`,
      [schoolId, 'school@edunex.com', passwordHash, roleIds['SchoolAdmin'], 'active']
    );

    // Teacher
    await con.query(
      `INSERT INTO Users (SchoolId, Email, PasswordHash, RoleId, Status) VALUES (?, ?, ?, ?, ?)`,
      [schoolId, 'teacher@edunex.com', passwordHash, roleIds['Teacher'], 'active']
    );

    console.log('✅ Database Seeding Successful!');
    console.log('    SuperAdmin: admin@edunex.com / password');
    console.log('    SchoolAdmin: school@edunex.com / password');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error Seeding Database:', error);
    process.exit(1);
  }
}

seedDatabase();
