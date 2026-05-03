const { con } = require('./database');
const bcrypt = require('bcryptjs');

async function updateAndSeed() {
  console.log('--- Updating Schema and Seeding Courses ---');

  try {
    // 1. Add Thumbnail column if not exists
    console.log('Updating LMS_Courses schema...');
    try {
      await con.execute(`ALTER TABLE LMS_Courses ADD COLUMN Thumbnail VARCHAR(512) AFTER Description`);
      console.log('Added Thumbnail column to LMS_Courses.');
    } catch (err) {
      if (err.code === 'ER_DUP_COLUMN_NAME') {
        console.log('Thumbnail column already exists.');
      } else {
        throw err;
      }
    }

    // 2. Ensure we have a Teacher
    const [users] = await con.execute('SELECT ID FROM Users WHERE Role = "Teacher" LIMIT 1');
    let teacherId;
    if (users.length === 0) {
      console.log('Creating a default teacher...');
      const pass = await bcrypt.hash('teacher123', 12);
      const [res] = await con.execute(
        'INSERT INTO Users (Name, Email, PasswordHash, Role, Status) VALUES (?, ?, ?, ?, ?)',
        ['Senior Instructor', 'teacher@deenova.com', pass, 'Teacher', 'active']
      );
      teacherId = res.insertId;
      console.log('Created teacher with ID:', teacherId);
    } else {
      teacherId = users[0].ID;
      console.log('Using existing teacher ID:', teacherId);
    }

    // 3. Clear existing courses to avoid duplicates for this clean seed
    console.log('Clearing old courses...');
    await con.execute('SET FOREIGN_KEY_CHECKS = 0');
    await con.execute('TRUNCATE TABLE LMS_Enrollments');
    await con.execute('TRUNCATE TABLE LMS_Submissions');
    await con.execute('TRUNCATE TABLE LMS_Assignments');
    await con.execute('TRUNCATE TABLE LMS_Courses');
    await con.execute('SET FOREIGN_KEY_CHECKS = 1');

    // 4. Seed 8 Courses
    const courses = [
      {
        name: 'Cambridge O Level Mathematics (4024)',
        fee: 45.00,
        desc: 'Comprehensive coverage of Syllabus D, focusing on algebra, geometry, and trigonometry with exam-style practice.',
        thumb: 'https://images.unsplash.com/photo-1509228468518-180dd48a5791?auto=format&fit=crop&q=80&w=800'
      },
      {
        name: 'A Level Physics: Core Principles',
        fee: 65.00,
        desc: 'Master the fundamentals of mechanics, electricity, and particle physics for Cambridge International Examinations.',
        thumb: 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?auto=format&fit=crop&q=80&w=800'
      },
      {
        name: 'Fundamentals of Islamic Jurisprudence (Fiqh)',
        fee: 0.00,
        desc: 'An introductory course on the principles of Fiqh, covering daily worship and ethical living in modern times.',
        thumb: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&q=80&w=800'
      },
      {
        name: 'Modern Teaching Methodologies',
        fee: 30.00,
        desc: 'Designed for educators to learn active learning strategies, classroom management, and digital tool integration.',
        thumb: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=800'
      },
      {
        name: 'Arabic for Beginners: Conversational',
        fee: 40.00,
        desc: 'Learn the basics of Arabic grammar and build vocabulary for everyday conversations and Quranic understanding.',
        thumb: 'https://images.unsplash.com/photo-1512413316925-fd2d93f61522?auto=format&fit=crop&q=80&w=800'
      },
      {
        name: 'O Level English Language: Creative Writing',
        fee: 35.00,
        desc: 'Focus on narrative and descriptive writing techniques to excel in Paper 1 of the O Level English exam.',
        thumb: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&q=80&w=800'
      },
      {
        name: 'Leadership & Emotional Intelligence',
        fee: 25.00,
        desc: 'Develop essential soft skills, self-awareness, and leadership qualities for academic and professional growth.',
        thumb: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=800'
      },
      {
        name: 'History of Islamic Civilization',
        fee: 20.00,
        desc: 'Exploring the Golden Age of Islam, its contributions to science, and its global cultural impact.',
        thumb: 'https://images.unsplash.com/photo-1519818187420-8e49de7adeef?auto=format&fit=crop&q=80&w=800'
      }
    ];

    console.log('Inserting courses...');
    for (const c of courses) {
      await con.execute(
        'INSERT INTO LMS_Courses (TeacherID, Name, Fee, Description, Thumbnail, Status) VALUES (?, ?, ?, ?, ?, ?)',
        [teacherId, c.name, c.fee, c.desc, c.thumb, 'active']
      );
    }

    console.log('✅ Successfully seeded 8 relevant courses.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Update and Seed Failed:', err);
    process.exit(1);
  }
}

updateAndSeed();
