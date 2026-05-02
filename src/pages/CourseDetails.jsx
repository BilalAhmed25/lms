import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Play, FileText, CheckCircle, Clock, ChevronRight } from 'lucide-react';

const CourseDetails = () => {
  const { id } = useParams();

  // Mock course data
  const course = {
    id: 1,
    title: 'Full-Stack Web Development with React & Node',
    teacher: 'Sarah Johnson',
    description: 'Master the art of building modern web applications from scratch. This comprehensive course covers frontend, backend, and everything in between.',
    price: '$199',
    duration: '45 Hours',
    lessons: 124,
    syllabus: [
      { id: 1, title: 'Introduction to Web Development', duration: '2h 15m' },
      { id: 2, title: 'React Fundamentals', duration: '5h 30m' },
      { id: 3, title: 'State Management with Redux', duration: '4h 00m' },
      { id: 4, title: 'Building RESTful APIs', duration: '6h 45m' }
    ]
  };

  return (
    <div className="course-details-page container animate-fade-in">
      <div className="breadcrumb">
        <Link to="/">Home</Link> <ChevronRight size={14} /> <span>Courses</span> <ChevronRight size={14} /> <span>{course.title}</span>
      </div>

      <div className="course-main-layout">
        <div className="course-content">
          <h1 className="course-title">{course.title}</h1>
          <div className="teacher-badge glass">
            <div className="teacher-avatar">{course.teacher.charAt(0)}</div>
            <div>
              <span className="label">Instructor</span>
              <span className="name">{course.teacher}</span>
            </div>
          </div>

          <div className="description-section">
            <h3>About this Course</h3>
            <p>{course.description}</p>
          </div>

          <div className="syllabus-section">
            <h3>Syllabus</h3>
            <div className="lessons-list">
              {course.syllabus.map((lesson, index) => (
                <div key={lesson.id} className="lesson-item glass">
                  <div className="lesson-left">
                    <span className="lesson-num">{index + 1}</span>
                    <Play size={18} className="text-primary" />
                    <span className="lesson-title">{lesson.title}</span>
                  </div>
                  <span className="lesson-time">{lesson.duration}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <aside className="course-sidebar">
          <div className="sticky-card glass">
            <div className="course-preview-placeholder">
               <Play size={48} className="preview-icon" />
            </div>
            <div className="pricing">
              <span className="current-price">{course.price}</span>
              <span className="old-price">$499</span>
              <span className="discount-badge">60% OFF</span>
            </div>
            <button className="btn btn-primary w-full btn-lg">Enroll Now</button>
            <div className="course-features">
              <div className="feature-item">
                <Clock size={18} />
                <span>{course.duration} of content</span>
              </div>
              <div className="feature-item">
                <FileText size={18} />
                <span>{course.lessons} lessons</span>
              </div>
              <div className="feature-item">
                <CheckCircle size={18} />
                <span>Certificate of completion</span>
              </div>
            </div>
          </div>
        </aside>
      </div>

      <style jsx>{`
        .course-details-page { padding-top: 2rem; padding-bottom: 5rem; }
        .breadcrumb { display: flex; align-items: center; gap: 0.5rem; color: var(--text-muted); font-size: 0.9rem; margin-bottom: 2rem; }
        .breadcrumb a:hover { color: var(--primary); }

        .course-main-layout {
          display: grid;
          grid-template-columns: 1fr 380px;
          gap: 4rem;
        }

        .course-title { font-size: 2.5rem; margin-bottom: 2rem; line-height: 1.2; }
        
        .teacher-badge {
          display: inline-flex;
          align-items: center;
          gap: 1rem;
        @media (max-width: 1024px) {
          .course-main-layout { grid-template-columns: 1fr; }
          .course-sidebar { order: -1; }
          .sticky-card { position: static; margin-bottom: 3rem; }
        }
      `}</style>
    </div>
  );
};

export default CourseDetails;
