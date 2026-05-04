import React, { useState, useEffect } from 'react';
import { 
    PlusCircle, Users, BookOpen, Clock, Layout, Play, 
    MessageSquare, Award, CheckCircle, XCircle, Eye, 
    TrendingUp, ExternalLink, Menu, X, Plus, Calendar, Settings, Type
} from 'lucide-react';
import api from '../utils/api';
import SEO from '../components/SEO';
import { useAuth } from '../App';
import '../styles/dashboard.css';
import '../styles/teacher-dashboard.css';

const Loader = () => (
    <div className="loader-container">
        <div className="spinner"></div>
    </div>
);

const TeacherDashboard = () => {
    const { user, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('overview');
    const [courses, setCourses] = useState([]);
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    
    // Form states
    const [showSessionModal, setShowSessionModal] = useState(false);
    const [showAssignmentModal, setShowAssignmentModal] = useState(false);
    const [selectedCourseId, setSelectedCourseId] = useState('');
    
    const [sessionForm, setSessionForm] = useState({
        title: '', date: '', duration: '', zoomLink: '', description: ''
    });

    const [assignmentForm, setAssignmentForm] = useState({
        title: '', type: 'assignment', dueDate: '', maxMarks: '', description: '',
        questions: [{ text: '', type: 'text', options: [] }]
    });

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const coursesData = await api.get('/enrollment/classes');
            setCourses(coursesData);
            
            const subs = await api.get('/lms/submissions/pending');
            setSubmissions(subs);
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    };

    const handleCreateSession = async (e) => {
        e.preventDefault();
        try {
            await api.post('/lms/sessions', { ...sessionForm, courseId: selectedCourseId });
            setShowSessionModal(false);
            setSessionForm({ title: '', date: '', duration: '', zoomLink: '', description: '' });
            alert('Session scheduled successfully!');
        } catch (err) {
            alert('Failed to schedule session.');
        }
    };

    const handleCreateAssignment = async (e) => {
        e.preventDefault();
        try {
            await api.post('/lms/assignments', { ...assignmentForm, courseId: selectedCourseId });
            setShowAssignmentModal(false);
            setAssignmentForm({ title: '', type: 'assignment', dueDate: '', maxMarks: '', description: '', questions: [{ text: '', type: 'text', options: [] }] });
            alert('Assignment/Quiz created successfully!');
        } catch (err) {
            alert('Failed to create assignment.');
        }
    };

    const handleAddQuestion = () => {
        setAssignmentForm({
            ...assignmentForm,
            questions: [...assignmentForm.questions, { text: '', type: 'text', options: [] }]
        });
    };

    if (loading) return <Loader />;

    return (
        <div className="admin-layout animate-fade-in">
            <SEO title="Teacher Dashboard | LMS" />
            
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
                        {user?.Name?.charAt(0) || 'T'}
                    </div>
                    <div className="user-info">
                        <h4>{user?.Name || 'Teacher'}</h4>
                        <span>{user?.Email || 'instructor@deenova.edu'}</span>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    <button className={activeTab === 'overview' ? 'active' : ''} onClick={() => { setActiveTab('overview'); setMobileMenuOpen(false); }}>
                        <Layout size={20} /> Overview
                    </button>
                    <button className={activeTab === 'courses' ? 'active' : ''} onClick={() => { setActiveTab('courses'); setMobileMenuOpen(false); }}>
                        <BookOpen size={20} /> My Courses
                        {courses.length > 0 && <span className="badge-sidebar">{courses.length}</span>}
                    </button>
                    <button className={activeTab === 'grading' ? 'active' : ''} onClick={() => { setActiveTab('grading'); setMobileMenuOpen(false); }}>
                        <Award size={20} /> Grading
                        {submissions.length > 0 && <span className="badge-sidebar active">{submissions.length}</span>}
                    </button>
                    <button className={activeTab === 'schedule' ? 'active' : ''} onClick={() => { setActiveTab('schedule'); setMobileMenuOpen(false); }}>
                        <Calendar size={20} /> Schedule
                    </button>
                </nav>

                <div className="sidebar-footer">
                    <button className="exit-btn logout-link" onClick={() => { logout(); window.location.href = '/'; }}>
                        <XCircle size={20} /> Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="admin-main">
                <header className="admin-header">
                    <div className="header-title">
                        <h1>Teacher Control Center</h1>
                        <p>Manage your classes, sessions, and student evaluations.</p>
                    </div>
                    <div className="header-actions">
                        <button className="btn btn-primary" onClick={() => setShowSessionModal(true)}>
                            <Plus size={18} /> Schedule Class
                        </button>
                        <button className="btn btn-secondary ml-4" onClick={() => setShowAssignmentModal(true)}>
                            <Plus size={18} /> Create Task
                        </button>
                    </div>
                </header>

                {activeTab === 'overview' && (
                    <div className="dashboard-overview animate-slide-up">
                        <div className="stats-grid">
                            <div className="stat-card glass-card">
                                <div className="stat-icon purple"><Users size={24} /></div>
                                <div className="stat-info">
                                    <p>Active Students</p>
                                    <h3>248</h3>
                                </div>
                            </div>
                            <div className="stat-card glass-card">
                                <div className="stat-icon blue"><BookOpen size={24} /></div>
                                <div className="stat-info">
                                    <p>Your Courses</p>
                                    <h3>{courses.length}</h3>
                                </div>
                            </div>
                            <div className="stat-card glass-card">
                                <div className="stat-icon orange"><Award size={24} /></div>
                                <div className="stat-info">
                                    <p>Pending Grading</p>
                                    <h3>{submissions.length}</h3>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'courses' && (
                    <div className="courses-management animate-slide-up">
                        <div className="flex-between mb-8">
                            <h2 className="text-2xl font-bold">Your Active Courses</h2>
                            <div className="filter-pills">
                                <button className="active">All Courses</button>
                                <button>Ongoing</button>
                                <button>Completed</button>
                            </div>
                        </div>

                        <div className="admin-course-grid">
                            {courses.length > 0 ? (
                                courses.map(course => (
                                    <div key={course.ID} className="course-admin-card glass-hover">
                                        <div className="course-card-top">
                                            <div className="course-card-icon">
                                                <BookOpen size={20} />
                                            </div>
                                            <div className="course-status-badge">
                                                <CheckCircle size={14} /> Active
                                            </div>
                                        </div>

                                        <h3>{course.Name}</h3>
                                        <p className="course-fee-tag">PKR {course.Fee}</p>

                                        <div className="course-stats-grid">
                                            <div className="stat-item" title="Enrolled Students">
                                                <Users size={18} />
                                                <div className="stat-info">
                                                    <span>{course.StudentCount || 0}</span>
                                                    <span className="stat-label">Students</span>
                                                </div>
                                            </div>
                                            <div className="stat-item" title="Live Sessions">
                                                <Play size={18} />
                                                <div className="stat-info">
                                                    <span>{course.SessionCount || 0}</span>
                                                    <span className="stat-label">Sessions</span>
                                                </div>
                                            </div>
                                            <div className="stat-item" title="Tasks">
                                                <Clock size={18} />
                                                <div className="stat-info">
                                                    <span>{course.TaskCount || 0}</span>
                                                    <span className="stat-label">Tasks</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="course-card-footer">
                                            <div className="flex gap-2 w-full">
                                                <button 
                                                    className="btn btn-primary btn-sm flex-1"
                                                    onClick={() => window.location.href = `/classroom/${course.Slug}`}
                                                >
                                                    Enter Classroom
                                                </button>
                                                <button className="btn-icon" title="Settings">
                                                    <Settings size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="admin-empty-state full-width">
                                    <BookOpen size={40} className="text-muted" />
                                    <p>No courses assigned to you yet.</p>
                                    <button className="btn btn-primary" onClick={() => setShowSessionModal(true)}>Schedule First Session</button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'grading' && (
                    <div className="grading-management animate-slide-up">
                        <div className="flex-between mb-8">
                            <h2 className="text-2xl font-bold">Submissions to Grade</h2>
                            <span className="badge-count">{submissions.length} Items Pending</span>
                        </div>

                        {submissions.length > 0 ? (
                            <div className="payments-table glass">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Student</th>
                                            <th>Course & Assignment</th>
                                            <th>Submitted At</th>
                                            <th>Status</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {submissions.map(sub => (
                                            <tr key={sub.ID}>
                                                <td>
                                                    <div className="user-cell">
                                                        <strong>{sub.StudentName}</strong>
                                                        <span>{sub.StudentEmail || 'Student'}</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="course-assignment-cell">
                                                        <span className="course-name-mini">{sub.CourseName}</span>
                                                        <span className="assignment-title-mini">{sub.AssignmentTitle}</span>
                                                    </div>
                                                </td>
                                                <td>{new Date(sub.SubmittedAt).toLocaleDateString()}</td>
                                                <td><span className="badge badge-warning animate-pulse">Pending Review</span></td>
                                                <td>
                                                    <button className="btn btn-primary btn-sm">Grade Now</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="admin-empty-state">
                                <div className="empty-state-icon" style={{background: '#e6f7f5', color: '#1ab69d'}}>
                                    <CheckCircle size={40} />
                                </div>
                                <p>All submissions have been graded! Great job.</p>
                                <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('overview')}>Back to Overview</button>
                            </div>
                        )}
                    </div>
                )}
            </main>

            {/* Schedule Session Modal */}
            {showSessionModal && (
                <div className="modal-overlay" onClick={() => setShowSessionModal(false)}>
                    <div className="modal-content animate-scale-up" onClick={e => e.stopPropagation()}>
                        <button className="btn-close" onClick={() => setShowSessionModal(false)}><X size={20} /></button>
                        
                        <div className="modal-header">
                            <h2>Schedule Live Session</h2>
                            <p className="text-muted mt-2">Set up a new live learning experience for your students.</p>
                        </div>

                        <form onSubmit={handleCreateSession} className="admin-form-container">
                            <div className="form-group">
                                <label>Target Course</label>
                                <div className="input-with-icon">
                                    <BookOpen size={18} />
                                    <select className="admin-select" value={selectedCourseId} onChange={e => setSelectedCourseId(e.target.value)} required>
                                        <option value="">Select a Course</option>
                                        {courses.map(c => <option key={c.ID} value={c.ID}>{c.Name}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Session Title</label>
                                <div className="input-with-icon">
                                    <Type size={18} />
                                    <input placeholder="e.g. Introduction to Quantum Physics" className="admin-input" value={sessionForm.title} onChange={e => setSessionForm({...sessionForm, title: e.target.value})} required />
                                </div>
                            </div>

                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Date & Time</label>
                                    <div className="input-with-icon">
                                        <Calendar size={18} />
                                        <input type="datetime-local" className="admin-input" value={sessionForm.date} onChange={e => setSessionForm({...sessionForm, date: e.target.value})} required />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Duration (Min)</label>
                                    <div className="input-with-icon">
                                        <Clock size={18} />
                                        <input type="number" placeholder="60" className="admin-input" value={sessionForm.duration} onChange={e => setSessionForm({...sessionForm, duration: e.target.value})} required />
                                    </div>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Zoom / Meeting Link</label>
                                <div className="input-with-icon">
                                    <Play size={18} />
                                    <input placeholder="https://zoom.us/j/..." className="admin-input" value={sessionForm.zoomLink} onChange={e => setSessionForm({...sessionForm, zoomLink: e.target.value})} required />
                                </div>
                            </div>

                            <div className="form-actions mt-8">
                                <button type="button" className="btn btn-secondary flex-1" onClick={() => setShowSessionModal(false)}>Discard</button>
                                <button type="submit" className="btn btn-primary flex-2">Schedule Session</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Create Assignment Modal */}
            {showAssignmentModal && (
                <div className="modal-overlay" onClick={() => setShowAssignmentModal(false)}>
                    <div className="modal-content animate-scale-up" style={{maxWidth: '700px'}} onClick={e => e.stopPropagation()}>
                        <button className="btn-close" onClick={() => setShowAssignmentModal(false)}><X size={20} /></button>
                        
                        <div className="modal-header">
                            <h2>Create New Task</h2>
                            <p className="text-muted mt-2">Publish assignments, quizzes, or exams for your students.</p>
                        </div>

                        <form onSubmit={handleCreateAssignment} className="admin-form-container">
                            <div className="form-group">
                                <label>Target Course</label>
                                <div className="input-with-icon">
                                    <BookOpen size={18} />
                                    <select className="admin-select" value={selectedCourseId} onChange={e => setSelectedCourseId(e.target.value)} required>
                                        <option value="">Select a Course</option>
                                        {courses.map(c => <option key={c.ID} value={c.ID}>{c.Name}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Task Title</label>
                                <div className="input-with-icon">
                                    <Type size={18} />
                                    <input placeholder="e.g. Mid-term Assessment" className="admin-input" value={assignmentForm.title} onChange={e => setAssignmentForm({...assignmentForm, title: e.target.value})} required />
                                </div>
                            </div>

                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Task Type</label>
                                    <div className="input-with-icon">
                                        <Award size={18} />
                                        <select className="admin-select" value={assignmentForm.type} onChange={e => setAssignmentForm({...assignmentForm, type: e.target.value})}>
                                            <option value="assignment">Assignment</option>
                                            <option value="quiz">Quiz (MCQs)</option>
                                            <option value="exam">Final Exam</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Due Date</label>
                                    <div className="input-with-icon">
                                        <Clock size={18} />
                                        <input type="date" className="admin-input" value={assignmentForm.dueDate} onChange={setAssignmentForm ? e => setAssignmentForm({...assignmentForm, dueDate: e.target.value}) : undefined} required />
                                    </div>
                                </div>
                            </div>

                            <div className="form-actions mt-8">
                                <button type="button" className="btn btn-secondary flex-1" onClick={() => setShowAssignmentModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary flex-2">Create Task</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeacherDashboard;
