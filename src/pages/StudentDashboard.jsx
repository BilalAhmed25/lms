import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../App';
import { Book, CreditCard, Clock, Star, Search, AlertCircle, PlusCircle, CheckCircle, ChevronRight, Layout, XCircle, Eye, Menu, X } from 'lucide-react';

import api from '../utils/api';
import SEO from '../components/SEO';
import CoursesSection from '../components/Home/CoursesSection';
import '../styles/dashboard.css';
import '../styles/student-dashboard.css';

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
    const [courseFilter, setCourseFilter] = useState('all');
    const [selectedReceipt, setSelectedReceipt] = useState(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

    const formatDate = (dateString) => {
        const options = { weekday: 'long', day: '2-digit', month: 'short', year: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-GB', options);
    };

    const enrolled = enrollmentHistory.filter(h => h.Status === 'approved');
    const pending = enrollmentHistory.filter(h => h.Status === 'pending');
    const trulyAvailable = availableCourses.filter(c => !enrollmentHistory.some(h => h.CourseID === c.ID));

    const filteredMyCourses = enrollmentHistory.filter(h => {
        if (h.Status === 'rejected') return false;
        if (courseFilter === 'all') return h.Status === 'approved' || h.Status === 'pending';
        return h.Status === courseFilter;
    });

    if (loading) return <Loader />;

    return (
        <div className="admin-layout animate-fade-in">
            <SEO
                title="Student Dashboard"
                description="Manage your enrolled courses, track your learning progress, and explore new educational opportunities on your Deenova Student Dashboard."
            />
            {/* Mobile Header */}
            <header className="mobile-dashboard-header">
                <img src="/logo.png" alt="Deenova" className="mobile-logo" />
                <button className="menu-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                    {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </header>

            {/* Sidebar */}
            <aside className={`admin-sidebar ${mobileMenuOpen ? 'mobile-open' : ''}`}>
                <div className="sidebar-header">
                    <img src="/logo.png" alt="Deenova Logo" className="logo-img sidebar-logo" />
                </div>

                <div className="sidebar-user-profile">
                    <div className="user-avatar-large">
                        {user?.Name?.charAt(0) || 'S'}
                    </div>
                    <div className="user-info">
                        <h4>{user?.Name || 'Student'}</h4>
                        <span>{user?.Email || 'student@deenova.edu'}</span>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    <button className={activeTab === 'overview' ? 'active' : ''} onClick={() => { setActiveTab('overview'); setMobileMenuOpen(false); }}>
                        <Layout size={20} /> Overview
                    </button>
                    <button className={activeTab === 'my-courses' ? 'active' : ''} onClick={() => { setActiveTab('my-courses'); setMobileMenuOpen(false); }}>
                        <Book size={20} /> My Learning
                        {(enrolled.length + pending.length) > 0 && <span className="badge-sidebar active">{enrolled.length + pending.length}</span>}
                    </button>
                    <button className={activeTab === 'browse' ? 'active' : ''} onClick={() => { setActiveTab('browse'); setMobileMenuOpen(false); }}>
                        <PlusCircle size={20} /> Browse Courses
                    </button>
                    <button className={activeTab === 'payments' ? 'active' : ''} onClick={() => { setActiveTab('payments'); setMobileMenuOpen(false); }}>
                        <CreditCard size={20} /> Billing
                    </button>
                </nav>

                <div className="sidebar-footer">
                    <button className="exit-btn logout-link" onClick={() => { logout(); navigate('/login'); }}>
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
                                <div className="stat-card glass">
                                    <div className="stat-icon purple"><Book size={28} /></div>
                                    <div className="stat-info">
                                        <p>Enrolled Courses</p>
                                        <h3>{enrolled.length}</h3>
                                    </div>
                                </div>
                                <div className="stat-card glass">
                                    <div className="stat-icon orange"><Clock size={28} /></div>
                                    <div className="stat-info">
                                        <p>Pending Review</p>
                                        <h3>{pending.length}</h3>
                                    </div>
                                </div>
                                <div className="stat-card glass">
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
                                            <div key={course.ID} className="enrolled-course-card" onClick={() => navigate(`/classroom/${course.Slug}`)}>
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
                            <div className="dashboard-section-header mb-8">
                                <h2>My Learning Journey</h2>
                                <div className="filter-pills">
                                    <button className={courseFilter === 'all' ? 'active' : ''} onClick={() => setCourseFilter('all')}>All Courses</button>
                                    <button className={courseFilter === 'approved' ? 'active' : ''} onClick={() => setCourseFilter('approved')}>Active</button>
                                    <button className={courseFilter === 'pending' ? 'active' : ''} onClick={() => setCourseFilter('pending')}>Pending</button>
                                </div>
                            </div>

                            {filteredMyCourses.length > 0 ? (
                                <div className="courses-grid-modern">
                                    {filteredMyCourses.map(course => (
                                        <div
                                            key={course.ID}
                                            className={`enrolled-course-card ${course.Status === 'pending' ? 'is-pending' : ''}`}
                                            onClick={() => course.Status === 'approved' && navigate(`/classroom/${course.Slug}`)}
                                        >
                                            <div className={`card-badge ${course.Status}`}>
                                                {course.Status === 'approved' ? 'ACTIVE' : 'PENDING'}
                                            </div>
                                            <h3>{course.ClassName}</h3>

                                            {course.Status === 'approved' ? (
                                                <>
                                                    <div className="progress-info">
                                                        <div className="progress-bar-minimal"><div className="fill" style={{ width: '45%' }}></div></div>
                                                        <span>45% Complete</span>
                                                    </div>
                                                    <div className="card-footer">
                                                        <span>Go to Classroom</span>
                                                        <ChevronRight size={18} />
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="pending-status-info">
                                                    <div className="pending-icon-box">
                                                        <Clock size={20} className="animate-pulse" />
                                                    </div>
                                                    <div className="pending-text">
                                                        <p>Enrolment Pending</p>
                                                        <span>Admin is verifying your payment</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="admin-empty-state">
                                    <div className="empty-state-icon"><Book size={40} /></div>
                                    <p>
                                        {courseFilter === 'all'
                                            ? "You haven't enrolled in any courses yet."
                                            : `You don't have any ${courseFilter} courses.`}
                                    </p>
                                    <button className="btn btn-primary mt-4" onClick={() => setActiveTab('browse')}>Browse Catalog</button>
                                </div>
                            )}
                        </div>
                    )}
                    {activeTab === 'browse' && (
                        <div className="animate-slide-up">
                            <h2 className="mb-8">Course Catalog</h2>
                            <CoursesSection
                                courses={trulyAvailable}
                                showHeader={false}
                                isDashboard={true}
                                limit={0}
                            />
                        </div>
                    )}

                    {activeTab === 'payments' && (
                        <div className="animate-slide-up">
                            <h2 className="mb-8">Billing & Receipts</h2>
                            <div className="billing-table-card">
                                <table className="text-left-table">
                                    <thead>
                                        <tr>
                                            <th>Course</th>
                                            <th>Amount</th>
                                            <th>Date</th>
                                            <th>Status</th>
                                            <th>Receipt</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {enrollmentHistory.map(h => (
                                            <tr key={h.ID}>
                                                <td>{h.ClassName}</td>
                                                <td className="font-bold text-primary">${h.AmountPaid}</td>
                                                <td>{formatDate(h.CreatedAt)}</td>
                                                <td>
                                                    <span className={`badge-minimal ${h.Status}`}>
                                                        {h.Status}
                                                    </span>
                                                </td>
                                                <td>
                                                    <button
                                                        className="receipt-btn-icon"
                                                        onClick={() => setSelectedReceipt(h.ReceiptUrl)}
                                                        title="View Receipt"
                                                    >
                                                        <Eye size={18} />
                                                    </button>
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

            {selectedReceipt && (
                <div className="modal-overlay" onClick={() => setSelectedReceipt(null)}>
                    <div className="modal-content glass animate-scale-up" onClick={e => e.stopPropagation()}>
                        <div className="modal-header-simple">
                            <h3>Payment Receipt</h3>
                            <button className="close-modal-btn" onClick={() => setSelectedReceipt(null)}><XCircle size={24} /></button>
                        </div>
                        <div className="receipt-view">
                            <img src={selectedReceipt} alt="Payment Receipt" />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentDashboard;
