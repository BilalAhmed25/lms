import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../App';
import { 
  Users, BookOpen, Star, ArrowRight, Play, CheckCircle, 
  Calculator, Lightbulb, Beaker, BarChart, Code, Mail, Shield, Monitor,
  Clock, LogIn
} from 'lucide-react';

const Home = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch public courses
      const coursesRes = await fetch('http://localhost:3000/enrollment/classes');
      const coursesData = await coursesRes.json();
      setCourses(coursesData.slice(0, 4));

      // Fetch history if logged in
      const token = localStorage.getItem('token');
      if (token && user?.Role === 'Student') {
        const historyRes = await fetch('http://localhost:3000/enrollment/my-history', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const historyData = await historyRes.json();
        setHistory(historyData);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getCourseStatus = (courseId) => {
    const record = history.find(h => h.CourseID === courseId);
    if (!record) return null;
    return record.Status;
  };

  return (
    <div className="home-page animate-fade-in">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="cta-grid" style={{ gridTemplateColumns: '1.2fr 0.8fr', alignItems: 'center' }}>
            <div className="hero-content">
              <div className="hero-subtitle">
                <Star size={18} fill="currentColor" />
                <span>Learn From 20,000+ Quality Courses</span>
              </div>
              <h1>Best to Platform <span>Empower</span> Skills</h1>
              <p className="text-muted mb-8" style={{ fontSize: '1.1rem' }}>
                Start your education journey for a better future. Join millions of learners worldwide and unlock your full potential today.
              </p>
              <div className="flex gap-4">
                <Link to={user ? "/student-dashboard" : "/register"} className="btn btn-primary" style={{ padding: '15px 35px' }}>
                    {user ? 'Go to Dashboard' : 'Start Learning Now'}
                </Link>
              </div>
            </div>
            <div className="hero-image-container">
              <img src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=1000" alt="Student" />
              <div className="enrolled-badge glass">
                <div className="flex -space-x-2">
                  {[1,2,3,4].map(i => (
                    <img key={i} src={`https://i.pravatar.cc/100?u=${i}`} alt="User" style={{ width: 40, height: 40, borderRadius: '50%', border: '2px solid white' }} />
                  ))}
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 600 }}>2K+</div>
                </div>
                <div className="text-center">
                  <h4 style={{ margin: 0 }}>100K+</h4>
                  <p className="text-muted" style={{ fontSize: '12px', margin: 0 }}>Total Enrolled Students</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Top Categories */}
      <section className="section-padding">
        <div className="container">
          <div className="section-header">
            <h2>Top Categories</h2>
          </div>
          <div className="category-grid">
            {[
              { name: 'Mathematics', icon: <Calculator />, color: '#f3e8ff' },
              { name: 'Idea Generate', icon: <Lightbulb />, color: '#fff1f2' },
              { name: 'Chemistry', icon: <Beaker />, color: '#ecfeff' },
              { name: 'Business Analysis', icon: <BarChart />, color: '#fff7ed' },
              { name: 'Development', icon: <Code />, color: '#fffbeb' },
              { name: 'Email Marketing', icon: <Mail />, color: '#f5f3ff' },
              { name: 'Arestogoy', icon: <Shield />, color: '#fef2f2' },
              { name: 'IT / Technology', icon: <Monitor />, color: '#f0fdfa' }
            ].map((cat, i) => (
              <div key={i} className="category-card" style={{ background: cat.color }}>
                <div className="category-icon" style={{ background: 'white', color: 'var(--primary)' }}>
                  {cat.icon}
                </div>
                <h4>{cat.name}</h4>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature CTA Section */}
      <section className="section-padding" style={{ background: '#fafafa' }}>
        <div className="container">
          <div className="cta-grid">
            <div className="cta-card teacher">
              <div className="cta-card-content">
                <span className="text-primary font-bold">Learn together with</span>
                <h3>Expert Teacher</h3>
                <p className="text-muted mb-6">Gain access to top-tier expertise and personalized mentorship.</p>
                <Link to="/register" className="btn btn-primary">Join as Teacher</Link>
              </div>
              <div className="cta-image-group">
                <img src="https://images.unsplash.com/photo-1544717297-fa154da09f9b?auto=format&fit=crop&q=80&w=300" alt="Teacher" />
              </div>
            </div>
            <div className="cta-card student">
              <div className="cta-card-content">
                <span className="text-primary font-bold">Get the skills</span>
                <h3>For Individuals</h3>
                <p className="text-muted mb-6">Build your path with courses tailored for personal growth.</p>
                <Link to="/register" className="btn btn-primary">Browse Catalog</Link>
              </div>
              <div className="cta-image-group">
                <img src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=300" alt="Student" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Courses */}
      <section className="section-padding">
        <div className="container">
          <div className="flex justify-between items-end mb-12">
            <div className="section-header" style={{ textAlign: 'left', margin: 0 }}>
              <h2>Popular Courses</h2>
            </div>
            <Link to="/student-dashboard" className="btn btn-secondary">View My Portal</Link>
          </div>

          <div className="category-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
            {loading ? (
                [1,2,3,4].map(i => <div key={i} className="course-card skeleton" style={{ height: 350 }}></div>)
            ) : courses.map((course, i) => {
              const status = getCourseStatus(course.ID);
              return (
                <div key={course.ID} className="course-card">
                  <div className="course-thumb">
                    <img 
                        src="https://images.unsplash.com/photo-1501504905252-473c47e087f8?auto=format&fit=crop&q=80&w=500" 
                        alt={course.Name} 
                    />
                    <span className="badge badge-primary" style={{ position: 'absolute', top: 20, left: 20 }}>COURSE</span>
                  </div>
                  <div className="course-meta">
                    <div className="course-instructor">
                      <img src={`https://i.pravatar.cc/100?u=${course.ID}`} alt="Avatar" />
                      <span className="text-muted text-sm">{course.TeacherName || 'LMS Instructor'}</span>
                    </div>
                    
                    <h4 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, width: '100%', lineHeight: 1.4 }}>
                        {course.Name}
                    </h4>

                    <div className="course-extra-info pt-4 border-t border-gray-100" style={{ marginTop: 'auto' }}>
                        <div className="flex items-center gap-2 text-muted text-sm">
                            <BookOpen size={16} /> 
                            <span>Standard Curriculum</span>
                        </div>
                    </div>
                  </div>
                  <div className="course-footer">
                    <span className="course-price">${course.Fee}</span>
                    {status === 'approved' ? (
                        <Link to="/student-dashboard" className="btn-status enrolled">
                            <CheckCircle size={16} /> Enrolled
                        </Link>
                    ) : status === 'pending' ? (
                        <div className="btn-status pending">
                            <Clock size={16} /> Pending
                        </div>
                    ) : (
                        <Link to={`/course/${course.ID}`} className="btn-icon">Enroll Now</Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
