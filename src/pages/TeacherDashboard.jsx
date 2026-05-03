import React, { useState } from 'react';
import { PlusCircle, Users, BookOpen, Settings, BarChart3 } from 'lucide-react';
import FloatingLabelInput from '../components/FloatingLabelInput';
import SEO from '../components/SEO';

const TeacherDashboard = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCourse, setNewCourse] = useState({ title: '', price: '', category: '' });
  const [courses, setCourses] = useState([
    { id: 1, title: 'Advanced React Patterns', students: 124, rating: 4.8, status: 'Active' },
    { id: 2, title: 'Modern Backend Architecture', students: 89, rating: 4.9, status: 'Draft' }
  ]);

  const students = [
    { id: 1, name: 'Alex Thompson', course: 'Advanced React Patterns', joined: 'Oct 12, 2025' },
    { id: 2, name: 'Sarah Miller', course: 'Advanced React Patterns', joined: 'Oct 15, 2025' },
    { id: 3, name: 'James Wilson', course: 'Modern Backend Architecture', joined: 'Nov 01, 2025' }
  ];

  return (
    <div className="dashboard-container container animate-fade-in">
      <SEO 
        title="Teacher Dashboard" 
        description="Manage your courses, track student performance, and grow your teaching business on Deenova Learning Hub's Teacher Dashboard."
      />
      <header className="dashboard-header">
        <div>
          <h1>Teacher Dashboard</h1>
          <p className="text-muted">Manage your courses and interact with students.</p>
        </div>
        <button onClick={() => setShowCreateModal(true)} className="btn btn-primary">
          <PlusCircle size={20} /> Create New Course
        </button>
      </header>

      <div className="stats-grid">
        <div className="stat-card glass">
          <Users className="text-primary" size={24} />
          <div className="stat-info">
            <span className="stat-value">213</span>
            <span className="stat-label">Total Students</span>
          </div>
        </div>
        <div className="stat-card glass">
          <BookOpen className="text-secondary" size={24} />
          <div className="stat-info">
            <span className="stat-value">5</span>
            <span className="stat-label">Total Courses</span>
          </div>
        </div>
        <div className="stat-card glass">
          <BarChart3 className="text-accent" size={24} />
          <div className="stat-info">
            <span className="stat-value">$12.4k</span>
            <span className="stat-label">Total Earnings</span>
          </div>
        </div>
      </div>

      <div className="dashboard-sections">
        <section className="courses-section">
          <div className="section-header">
            <h3>Your Courses</h3>
            <button className="btn-text">View All</button>
          </div>
          <div className="courses-list">
            {courses.map(course => (
              <div key={course.id} className="course-item glass">
                <div className="course-main">
                  <h4>{course.title}</h4>
                  <div className="course-meta">
                    <span><Users size={14} /> {course.students} Students</span>
                    <span><Settings size={14} /> {course.status}</span>
                  </div>
                </div>
                <div className="course-actions">
                  <button className="btn-icon-bg"><Settings size={18} /></button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="students-section">
          <div className="section-header">
            <h3>Recent Students</h3>
            <button className="btn-text">Manage</button>
          </div>
          <div className="students-list glass">
            {students.map(student => (
              <div key={student.id} className="student-item">
                <div className="student-avatar">{student.name.charAt(0)}</div>
                <div className="student-info">
                  <span className="student-name">{student.name}</span>
                  <span className="student-course">{student.course}</span>
                </div>
                <span className="student-date">{student.joined}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-content glass">
            <h3>Create New Course</h3>
            <form className="modal-form">
              <FloatingLabelInput 
                label="Course Title"
                type="text"
                required
                value={newCourse.title}
                onChange={(e) => setNewCourse({...newCourse, title: e.target.value})}
                className="mb-6"
              />
              <FloatingLabelInput 
                label="Category"
                type="text"
                required
                value={newCourse.category}
                onChange={(e) => setNewCourse({...newCourse, category: e.target.value})}
                className="mb-6"
              />
              <FloatingLabelInput 
                label="Price ($)"
                type="number"
                required
                value={newCourse.price}
                onChange={(e) => setNewCourse({...newCourse, price: e.target.value})}
                className="mb-6"
              />
              <div className="modal-btns">
                <button type="button" onClick={() => setShowCreateModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="button" className="btn btn-primary">Create Course</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default TeacherDashboard;
