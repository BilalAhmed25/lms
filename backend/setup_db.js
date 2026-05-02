const { con } = require('./database');

const tables = [
  "DROP TABLE IF EXISTS LMS_EnrollmentRequests",
  "DROP TABLE IF EXISTS LMS_AssessmentSubmissions",
  "DROP TABLE IF EXISTS LMS_Assessments",
  "DROP TABLE IF EXISTS LMS_AssignmentSubmissions",
  "DROP TABLE IF EXISTS LMS_Assignments",
  "DROP TABLE IF EXISTS StudentAttendance",
  "DROP TABLE IF EXISTS Students",
  "DROP TABLE IF EXISTS Staff",
  "DROP TABLE IF EXISTS Subjects",
  "DROP TABLE IF EXISTS Sections",
  "DROP TABLE IF EXISTS Classes",
  "DROP TABLE IF EXISTS PasswordResetOTPs",
  "DROP TABLE IF EXISTS Users",
  "DROP TABLE IF EXISTS Roles",
  "DROP TABLE IF EXISTS Schools",
  "DROP TABLE IF EXISTS AcademicYears",

  `CREATE TABLE Schools (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(255) NOT NULL,
    Subdomain VARCHAR(100),
    LogoUrl VARCHAR(255),
    Status ENUM('active', 'inactive') DEFAULT 'active',
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,

  `CREATE TABLE Roles (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    SchoolId INT,
    Name VARCHAR(50) NOT NULL,
    Access JSON,
    IsSystem TINYINT(1) DEFAULT 0,
    FOREIGN KEY (SchoolId) REFERENCES Schools(ID)
  )`,

  `CREATE TABLE Users (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    SchoolId INT,
    RoleId INT,
    Name VARCHAR(255),
    Email VARCHAR(255) UNIQUE NOT NULL,
    PasswordHash VARCHAR(255) NOT NULL,
    ProfileImage VARCHAR(255),
    Status ENUM('active', 'inactive') DEFAULT 'active',
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (SchoolId) REFERENCES Schools(ID),
    FOREIGN KEY (RoleId) REFERENCES Roles(ID)
  )`,

  `CREATE TABLE PasswordResetOTPs (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    Email VARCHAR(255) NOT NULL,
    OTP VARCHAR(6) NOT NULL,
    ExpiresAt TIMESTAMP NOT NULL,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,

  `CREATE TABLE AcademicYears (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    SchoolId INT,
    YearName VARCHAR(50) NOT NULL,
    StartDate DATE,
    EndDate DATE,
    IsActive TINYINT(1) DEFAULT 0,
    FOREIGN KEY (SchoolId) REFERENCES Schools(ID)
  )`,

  `CREATE TABLE Classes (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    SchoolId INT,
    Name VARCHAR(100) NOT NULL,
    Fee DECIMAL(10, 2) DEFAULT 0.00,
    Description TEXT,
    FOREIGN KEY (SchoolId) REFERENCES Schools(ID)
  )`,

  `CREATE TABLE Sections (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    ClassId INT,
    Name VARCHAR(100) NOT NULL,
    FOREIGN KEY (ClassId) REFERENCES Classes(ID)
  )`,

  `CREATE TABLE Subjects (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    SchoolId INT,
    Name VARCHAR(100) NOT NULL,
    SubjectCode VARCHAR(20),
    IsActive TINYINT(1) DEFAULT 1,
    FOREIGN KEY (SchoolId) REFERENCES Schools(ID)
  )`,

  `CREATE TABLE Staff (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    UserId INT,
    SchoolId INT,
    FirstName VARCHAR(100),
    LastName VARCHAR(100),
    Designation VARCHAR(100),
    Qualification TEXT,
    ExperienceYears INT,
    Bio TEXT,
    FOREIGN KEY (UserId) REFERENCES Users(ID),
    FOREIGN KEY (SchoolId) REFERENCES Schools(ID)
  )`,

  `CREATE TABLE Students (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    UserId INT,
    SchoolId INT,
    ClassId INT,
    SectionId INT,
    AdmissionNumber VARCHAR(50),
    RollNumber VARCHAR(50),
    FirstName VARCHAR(100),
    LastName VARCHAR(100),
    FOREIGN KEY (UserId) REFERENCES Users(ID),
    FOREIGN KEY (SchoolId) REFERENCES Schools(ID),
    FOREIGN KEY (ClassId) REFERENCES Classes(ID),
    FOREIGN KEY (SectionId) REFERENCES Sections(ID)
  )`,

  `CREATE TABLE LMS_Assignments (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    SchoolID INT,
    StaffID INT,
    ClassID INT,
    SectionID INT,
    SubjectID INT,
    Title VARCHAR(255) NOT NULL,
    Description TEXT,
    FileURL VARCHAR(255),
    DueDate DATETIME,
    MaxMarks INT DEFAULT 100,
    Status ENUM('active', 'archived') DEFAULT 'active',
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (SchoolID) REFERENCES Schools(ID),
    FOREIGN KEY (StaffID) REFERENCES Staff(ID),
    FOREIGN KEY (ClassID) REFERENCES Classes(ID),
    FOREIGN KEY (SectionID) REFERENCES Sections(ID),
    FOREIGN KEY (SubjectID) REFERENCES Subjects(ID)
  )`,

  `CREATE TABLE LMS_AssignmentSubmissions (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    AssignmentID INT,
    StudentID INT,
    FileURL VARCHAR(255),
    TextResponse TEXT,
    Marks DECIMAL(5,2),
    Feedback TEXT,
    MarksPublished TINYINT(1) DEFAULT 0,
    SubmittedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (AssignmentID) REFERENCES LMS_Assignments(ID),
    FOREIGN KEY (StudentID) REFERENCES Students(ID)
  )`,

  `CREATE TABLE LMS_Assessments (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    SchoolID INT,
    StaffID INT,
    ClassID INT,
    SectionID INT,
    SubjectID INT,
    Title VARCHAR(255) NOT NULL,
    Description TEXT,
    AssessmentType ENUM('MCQ', 'Text', 'Mixed') DEFAULT 'MCQ',
    TimeLimitMinutes INT,
    CameraRestriction TINYINT(1) DEFAULT 0,
    TotalMarks INT DEFAULT 100,
    StartDateTime DATETIME,
    EndDateTime DATETIME,
    Status ENUM('draft', 'active', 'closed') DEFAULT 'draft',
    Questions JSON,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (SchoolID) REFERENCES Schools(ID),
    FOREIGN KEY (StaffID) REFERENCES Staff(ID),
    FOREIGN KEY (ClassID) REFERENCES Classes(ID),
    FOREIGN KEY (SectionID) REFERENCES Sections(ID),
    FOREIGN KEY (SubjectID) REFERENCES Subjects(ID)
  )`,

  `CREATE TABLE LMS_AssessmentSubmissions (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    AssessmentID INT,
    StudentID INT,
    Answers JSON,
    AutoScore DECIMAL(5,2),
    ManualScore DECIMAL(5,2),
    Feedback TEXT,
    MarksPublished TINYINT(1) DEFAULT 0,
    StartedAt DATETIME,
    SubmittedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (AssessmentID) REFERENCES LMS_Assessments(ID),
    FOREIGN KEY (StudentID) REFERENCES Students(ID)
  )`,

  `CREATE TABLE LMS_EnrollmentRequests (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    SchoolId INT,
    StudentId INT,
    ClassId INT,
    ReceiptUrl VARCHAR(255),
    AmountPaid DECIMAL(10, 2),
    Status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    AdminRemarks TEXT,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (SchoolId) REFERENCES Schools(ID),
    FOREIGN KEY (StudentId) REFERENCES Students(ID),
    FOREIGN KEY (ClassId) REFERENCES Classes(ID)
  )`,

  `CREATE TABLE StudentAttendance (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    SchoolID INT,
    StudentID INT,
    Date DATE,
    Status ENUM('Present', 'Absent', 'Late', 'Half-Day') DEFAULT 'Present',
    Remarks TEXT,
    FOREIGN KEY (SchoolID) REFERENCES Schools(ID),
    FOREIGN KEY (StudentID) REFERENCES Students(ID)
  )`
];

const seedData = [
  "INSERT IGNORE INTO Schools (ID, Name, Subdomain, Status) VALUES (1, 'Default LMS School', 'default', 'active')",
  "INSERT IGNORE INTO Roles (ID, Name, IsSystem) VALUES (1, 'SuperAdmin', 1), (2, 'Admin', 0), (3, 'Teacher', 0), (4, 'Student', 0)"
];

async function setup() {
  try {
    console.log('--- Starting Database Setup ---');
    await con.execute('SET FOREIGN_KEY_CHECKS = 0');
    
    for (const sql of tables) {
      console.log(`Executing: ${sql.substring(0, 50)}...`);
      await con.execute(sql);
    }
    
    console.log('--- Seeding Initial Data ---');
    for (const sql of seedData) {
      await con.execute(sql);
    }

    await con.execute('SET FOREIGN_KEY_CHECKS = 1');
    
    console.log('--- Database Setup Completed Successfully ---');
    process.exit(0);
  } catch (err) {
    console.error('Database Setup Failed:', err);
    process.exit(1);
  }
}

setup();
