const { con } = require('./database');
const bcrypt = require('bcryptjs');

async function upgradeAndSeed() {
  console.log('--- Upgrading Schema and Seeding Advanced Courses ---');

  try {
    // 1. Drop and recreate tables to ensure clean structure
    console.log('Cleaning old tables...');
    await con.execute('SET FOREIGN_KEY_CHECKS = 0');
    await con.execute('DROP TABLE IF EXISTS LMS_Modules');
    await con.execute('DROP TABLE IF EXISTS LMS_Enrollments');
    await con.execute('DROP TABLE IF EXISTS LMS_Submissions');
    await con.execute('DROP TABLE IF EXISTS LMS_Assignments');
    await con.execute('DROP TABLE IF EXISTS LMS_Courses');

    // 2. Create LMS_Courses with new columns
    console.log('Creating LMS_Courses table...');
    await con.execute(`
      CREATE TABLE LMS_Courses (
        ID INT AUTO_INCREMENT PRIMARY KEY,
        TeacherID INT,
        Name VARCHAR(255) NOT NULL,
        ShortIntro VARCHAR(255),
        Description TEXT,
        Fee DECIMAL(10, 2) DEFAULT 0.00,
        Thumbnail VARCHAR(512),
        AverageRating DECIMAL(2,1) DEFAULT 4.8,
        ReviewsCount INT DEFAULT 0,
        Status ENUM('active', 'inactive') DEFAULT 'active',
        CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (TeacherID) REFERENCES Users(ID)
      )
    `);

    // 3. Create LMS_Modules table
    console.log('Creating LMS_Modules table...');
    await con.execute(`
      CREATE TABLE LMS_Modules (
        ID INT AUTO_INCREMENT PRIMARY KEY,
        CourseID INT,
        Title VARCHAR(255) NOT NULL,
        Description TEXT,
        OrderIndex INT DEFAULT 0,
        CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (CourseID) REFERENCES LMS_Courses(ID) ON DELETE CASCADE
      )
    `);

    await con.execute('SET FOREIGN_KEY_CHECKS = 1');

    // 4. Ensure we have a Teacher
    const [users] = await con.execute('SELECT ID FROM Users WHERE Role = "Teacher" LIMIT 1');
    let teacherId;
    if (users.length === 0) {
      const pass = await bcrypt.hash('teacher123', 12);
      const [res] = await con.execute(
        'INSERT INTO Users (Name, Email, PasswordHash, Role, Status) VALUES (?, ?, ?, ?, ?)',
        ['Dr. Ahmed Bilal', 'ahmed@deenova.com', pass, 'Teacher', 'active']
      );
      teacherId = res.insertId;
    } else {
      teacherId = users[0].ID;
    }

    // 5. Seed 8 Courses with Modules
    const courseData = [
      {
        name: 'Cambridge O Level Mathematics (4024)',
        intro: 'Master algebra, geometry and statistics for exam success.',
        fee: 45.00,
        rating: 4.9,
        reviews: 124,
        thumb: 'https://images.unsplash.com/photo-1509228468518-180dd48a5791?auto=format&fit=crop&q=80&w=800',
        modules: [
          { title: 'Number & Estimation', desc: 'Working with fractions, decimals, and rounding.' },
          { title: 'Algebraic Manipulation', desc: 'Solving linear and quadratic equations.' },
          { title: 'Trigonometry Basics', desc: 'Understanding sine, cosine, and tangent rules.' }
        ]
      },
      {
        name: 'A Level Physics: Core Principles',
        intro: 'Advanced mechanics and particle physics for future engineers.',
        fee: 65.00,
        rating: 4.8,
        reviews: 89,
        thumb: 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?auto=format&fit=crop&q=80&w=800',
        modules: [
          { title: 'Kinematics', desc: 'Motion in one and two dimensions.' },
          { title: 'Quantum Physics', desc: 'Photons, energy levels, and wave-particle duality.' },
          { title: 'Nuclear Physics', desc: 'Radioactivity and binding energy.' }
        ]
      },
      {
        name: 'Fundamentals of Islamic Jurisprudence (Fiqh)',
        intro: 'Principles of daily worship and ethical living.',
        fee: 0.00,
        rating: 5.0,
        reviews: 350,
        thumb: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&q=80&w=800',
        modules: [
          { title: 'Taharah (Purification)', desc: 'Rules of Wudu and Ghusl.' },
          { title: 'The Pillars of Salah', desc: 'Fard and Sunnah elements of prayer.' },
          { title: 'Financial Ethics', desc: 'Introduction to Halal transactions.' }
        ]
      },
      {
        name: 'Modern Teaching Methodologies',
        intro: 'Transform your classroom with active learning strategies.',
        fee: 30.00,
        rating: 4.7,
        reviews: 56,
        thumb: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=800',
        modules: [
          { title: 'Active Learning Techniques', desc: 'Engaging students through collaboration.' },
          { title: 'Digital Tools for Teachers', desc: 'Using Google Classroom and LMS effectively.' }
        ]
      },
      {
        name: 'Arabic for Beginners: Conversational',
        intro: 'Build vocabulary and basic grammar for everyday life.',
        fee: 40.00,
        rating: 4.9,
        reviews: 210,
        thumb: 'https://images.unsplash.com/photo-1512413316925-fd2d93f61522?auto=format&fit=crop&q=80&w=800',
        modules: [
          { title: 'The Arabic Alphabet', desc: 'Writing and pronunciation basics.' },
          { title: 'Common Greetings', desc: 'Starting daily conversations.' },
          { title: 'Basic Grammar (Nahw)', desc: 'Sentence structure and nouns.' }
        ]
      },
      {
        name: 'O Level English: Creative Writing',
        intro: 'Learn narrative techniques to excel in Paper 1.',
        fee: 35.00,
        rating: 4.8,
        reviews: 75,
        thumb: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&q=80&w=800',
        modules: [
          { title: 'Descriptive Writing', desc: 'Using sensory details effectively.' },
          { title: 'Narrative Arc', desc: 'Structuring a compelling story.' }
        ]
      },
      {
        name: 'Leadership & Emotional Intelligence',
        intro: 'Develop soft skills for academic and career success.',
        fee: 25.00,
        rating: 4.9,
        reviews: 142,
        thumb: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=800',
        modules: [
          { title: 'Self-Awareness', desc: 'Understanding your emotions.' },
          { title: 'Conflict Resolution', desc: 'Leading teams through challenges.' }
        ]
      },
      {
        name: 'History of Islamic Civilization',
        intro: 'Explore the Golden Age and its global impact.',
        fee: 20.00,
        rating: 4.8,
        reviews: 63,
        thumb: 'https://images.unsplash.com/photo-1519818187420-8e49de7adeef?auto=format&fit=crop&q=80&w=800',
        modules: [
          { title: 'The Abbasid Era', desc: 'The House of Wisdom and scientific progress.' },
          { title: 'Islamic Art & Architecture', desc: 'A legacy of geometric design.' }
        ]
      }
    ];

    for (const c of courseData) {
      const [res] = await con.execute(
        'INSERT INTO LMS_Courses (TeacherID, Name, ShortIntro, Fee, Thumbnail, AverageRating, ReviewsCount, Status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [teacherId, c.name, c.intro, c.fee, c.thumb, c.rating, c.reviews, 'active']
      );
      const cid = res.insertId;

      for (let i = 0; i < c.modules.length; i++) {
        const m = c.modules[i];
        await con.execute(
          'INSERT INTO LMS_Modules (CourseID, Title, Description, OrderIndex) VALUES (?, ?, ?, ?)',
          [cid, m.title, m.desc, i]
        );
      }
    }

    console.log('✅ Successfully upgraded schema and seeded 8 courses with modules.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Upgrade failed:', err);
    process.exit(1);
  }
}

upgradeAndSeed();
