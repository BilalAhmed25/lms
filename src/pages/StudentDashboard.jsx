import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../App';
import { Book, CreditCard, Clock, Star, Search, AlertCircle, PlusCircle, CheckCircle, ChevronRight, Layout, XCircle } from 'lucide-react';

import api from '../utils/api';
import SEO from '../components/SEO';

const Loader = () => (
    <div className="loader-container">
        <div className="spinner"></div>
    </div>
);

const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [availableCourses, setAvailableCourses] = useState([]);
  const [enrollmentHistory, setEnrollmentHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const courses = await api.get('/enrollment/classes');
      setAvailableCourses(courses);

      const history = await api.get('/enrollment/my-history');
      setEnrollmentHistory(history);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const enrolled = enrollmentHistory.filter(h => h.Status === 'approved');
  const pending = enrollmentHistory.filter(h => h.Status === 'pending');
  const trulyAvailable = availableCourses.filter(c => !enrollmentHistory.some(h => h.CourseID === c.ID));

  if (loading) return <Loader />;

  return (
    <div className="admin-layout animate-fade-in">
      <SEO 
        title="Student Dashboard" 
        description="Manage your enrolled courses, track your learning progress, and explore new educational opportunities on your Deenova Student Dashboard."
      />
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <img src="/logo.png" alt="Deenova Logo" className="logo-img sidebar-logo" />
        </div>

        <nav className="sidebar-nav">
          <button className={activeTab === 'overview' ? 'active' : ''} onClick={() => setActiveTab('overview')}>
            <Layout size={20} /> Overview
          </button>
          <button className={activeTab === 'my-courses' ? 'active' : ''} onClick={() => setActiveTab('my-courses')}>
            <Book size={20} /> My Learning
            {enrolled.length > 0 && <span>{enrolled.length}</span>}
          </button>
          <button className={activeTab === 'browse' ? 'active' : ''} onClick={() => setActiveTab('browse')}>
            <PlusCircle size={20} /> Browse Courses
          </button>
          <button className={activeTab === 'payments' ? 'active' : ''} onClick={() => setActiveTab('payments')}>
            <CreditCard size={20} /> Billing
          </button>
        </nav>

        <div className="sidebar-footer">
          <button className="exit-btn" onClick={() => { logout(); navigate('/login'); }}>
            <XCircle size={20} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        <header className="admin-header">
          <div className="header-title">
            <h1>Hello, {user.Name}</h1>
            <p>Ready to continue your learning journey?</p>
          </div>
          <div className="admin-profile-nav">
            <div className="search-bar">
              <Search size={18} />
              <input type="text" placeholder="Search lessons..." />
            </div>
            <div className="admin-avatar">{user.Name.charAt(0)}</div>
          </div>
        </header>

        <div className="admin-content">
          {activeTab === 'overview' && (
            <div className="animate-slide-up">
              <div className="stats-grid mb-12">
                <div className="stat-card">
                  <div className="stat-icon purple"><Book size={28} /></div>
                  <div className="stat-info">
                    <p>Enrolled Courses</p>
                    <h3>{enrolled.length}</h3>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon orange"><Clock size={28} /></div>
                  <div className="stat-info">
                    <p>Pending Review</p>
                    <h3>{pending.length}</h3>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon blue"><Star size={28} /></div>
                  <div className="stat-info">
                    <p>Avg. Progress</p>
                    <h3>45%</h3>
                  </div>
                </div>
              </div>

              {enrolled.length > 0 && (
                <div className="mb-12">
                  <h3 className="mb-6">Continue Learning</h3>
                  <div className="courses-grid-modern">
                    {enrolled.slice(0, 2).map(course => (
                      <div key={course.ID} className="enrolled-course-card" onClick={() => navigate(`/lms-dashboard/${course.CourseID}`)}>
                        <div className="card-badge">ACTIVE</div>
                        <h3>{course.ClassName}</h3>
                        <div className="progress-info">
                          <div className="progress-bar-minimal"><div className="fill" style={{ width: '45%' }}></div></div>
                          <span>45% Complete</span>
                        </div>
                        <div className="card-footer">
                          <span>Resume Lesson</span>
                          <ChevronRight size={18} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'my-courses' && (
            <div className="animate-slide-up">
              <h2 className="mb-8">My Enrolled Courses</h2>
              {enrolled.length > 0 ? (
                <div className="courses-grid-modern">
                  {enrolled.map(course => (
                    <div key={course.ID} className="enrolled-course-card" onClick={() => navigate(`/lms-dashboard/${course.CourseID}`)}>
                      <div className="card-badge">ACTIVE</div>
                      <h3>{course.ClassName}</h3>
                      <div className="progress-info">
                        <div className="progress-bar-minimal"><div className="fill" style={{ width: '45%' }}></div></div>
                        <span>45% Complete</span>
                      </div>
                      <div className="card-footer">
                        <span>Go to Classroom</span>
                        <ChevronRight size={18} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="admin-empty-state">
                  <div className="empty-state-icon"><Book size={40} /></div>
                  <p>You haven't enrolled in any courses yet.</p>
                  <button className="btn btn-primary mt-4" onClick={() => setActiveTab('browse')}>Browse Catalog</button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'browse' && (
            <div className="animate-slide-up">
              <h2 className="mb-8">Course Catalog</h2>
              <div className="available-courses-grid">
                {trulyAvailable.map(course => (
                  <Link to={`/course/${course.Slug}`} key={course.ID} className="available-card">
                    <div className="available-icon"><Book size={24} /></div>
                    <div className="available-info">
                      <h3>{course.Name}</h3>
                      <p className="price">${course.Fee}</p>
                    </div>
                    <div className="enroll-cta">Details</div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'payments' && (
            <div className="animate-slide-up">
              <h2 className="mb-8">Billing & Receipts</h2>
              <div className="billing-table-card">
                <table>
                  <thead>
                    <tr><th>Course</th><th>Amount</th><th>Date</th><th>Status</th></tr>
                  </thead>
                  <tbody>
                    {enrollmentHistory.map(h => (
                      <tr key={h.ID}>
                        <td>{h.ClassName}</td>
                        <td className="font-bold text-primary">${h.AmountPaid}</td>
                        <td>{new Date(h.CreatedAt).toLocaleDateString()}</td>
                        <td>
                          <span className={`badge-minimal ${h.Status}`}>
                            {h.Status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;
