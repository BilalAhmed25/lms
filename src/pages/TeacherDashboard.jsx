import React, { useState, useEffect } from 'react';
import { 
    PlusCircle, Users, BookOpen, Clock, Layout, Play, 
    MessageSquare, Award, CheckCircle, XCircle, Eye, 
    TrendingUp, ExternalLink, Menu, X, Plus, Calendar, Settings
} from 'lucide-react';
import api from '../utils/api';
import SEO from '../components/SEO';

const Loader = () => (
    <div className="loader-container">
        <div className="spinner"></div>
    </div>
);

const TeacherDashboard = () => {
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

                <nav className="sidebar-nav">
                    <button className={activeTab === 'overview' ? 'active' : ''} onClick={() => { setActiveTab('overview'); setMobileMenuOpen(false); }}>
                        <Layout size={20} /> Overview
                    </button>
                    <button className={activeTab === 'courses' ? 'active' : ''} onClick={() => { setActiveTab('courses'); setMobileMenuOpen(false); }}>
                        <BookOpen size={20} /> My Courses
                    </button>
                    <button className={activeTab === 'grading' ? 'active' : ''} onClick={() => { setActiveTab('grading'); setMobileMenuOpen(false); }}>
                        <Award size={20} /> Grading
                        {submissions.length > 0 && <span>{submissions.length}</span>}
                    </button>
                </nav>

                <div className="sidebar-footer">
                    <button className="exit-btn" onClick={() => window.location.href = '/'}>
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
                            <div className="stat-card glass">
                                <div className="stat-icon purple"><Users size={24} /></div>
                                <div className="stat-info">
                                    <p>Active Students</p>
                                    <h3>248</h3>
                                </div>
                            </div>
                            <div className="stat-card glass">
                                <div className="stat-icon blue"><BookOpen size={24} /></div>
                                <div className="stat-info">
                                    <p>Your Courses</p>
                                    <h3>{courses.length}</h3>
                                </div>
                            </div>
                            <div className="stat-card glass">
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
                        <div className="admin-table-container glass">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Course Name</th>
                                        <th>Fee</th>
                                        <th>Students</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {courses.map(course => (
                                        <tr key={course.ID}>
                                            <td className="font-bold">{course.Name}</td>
                                            <td>PKR {course.Fee}</td>
                                            <td>{course.StudentCount || 0}</td>
                                            <td>
                                                <button className="btn-icon" title="View Students"><Users size={18} /></button>
                                                <button className="btn-icon ml-2" title="Course Settings"><Settings size={18} /></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'grading' && (
                    <div className="grading-management animate-slide-up">
                        {submissions.length > 0 ? (
                            <div className="admin-table-container glass">
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>Student</th>
                                            <th>Course</th>
                                            <th>Assignment</th>
                                            <th>Submitted At</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {submissions.map(sub => (
                                            <tr key={sub.ID}>
                                                <td>{sub.StudentName}</td>
                                                <td>{sub.CourseName}</td>
                                                <td>{sub.AssignmentTitle}</td>
                                                <td>{new Date(sub.SubmittedAt).toLocaleDateString()}</td>
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
                                <CheckCircle size={40} className="text-primary" />
                                <p>All submissions have been graded! Great job.</p>
                            </div>
                        )}
                    </div>
                )}
            </main>

            {/* Schedule Session Modal */}
            {showSessionModal && (
                <div className="modal-overlay" onClick={() => setShowSessionModal(false)}>
                    <div className="modal-content animate-scale-up" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Schedule Live Session</h2>
                            <button className="btn-close" onClick={() => setShowSessionModal(false)}><X size={24} /></button>
                        </div>
                        <form onSubmit={handleCreateSession} className="admin-form-container" style={{maxWidth: '100%'}}>
                            <div className="form-grid">
                                <div className="form-group full-width">
                                    <label>Target Course</label>
                                    <select className="admin-select" value={selectedCourseId} onChange={e => setSelectedCourseId(e.target.value)} required>
                                        <option value="">Select a Course</option>
                                        {courses.map(c => <option key={c.ID} value={c.ID}>{c.Name}</option>)}
                                    </select>
                                </div>
                                <div className="form-group full-width">
                                    <label>Session Title</label>
                                    <input className="admin-input" value={sessionForm.title} onChange={e => setSessionForm({...sessionForm, title: e.target.value})} required />
                                </div>
                                <div className="form-group">
                                    <label>Date & Time</label>
                                    <input type="datetime-local" className="admin-input" value={sessionForm.date} onChange={e => setSessionForm({...sessionForm, date: e.target.value})} required />
                                </div>
                                <div className="form-group">
                                    <label>Duration (Minutes)</label>
                                    <input type="number" className="admin-input" value={sessionForm.duration} onChange={e => setSessionForm({...sessionForm, duration: e.target.value})} required />
                                </div>
                                <div className="form-group full-width">
                                    <label>Zoom / Meeting Link</label>
                                    <input className="admin-input" value={sessionForm.zoomLink} onChange={e => setSessionForm({...sessionForm, zoomLink: e.target.value})} required />
                                </div>
                            </div>
                            <div className="form-actions">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowSessionModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Schedule Session</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Create Assignment Modal */}
            {showAssignmentModal && (
                <div className="modal-overlay" onClick={() => setShowAssignmentModal(false)}>
                    <div className="modal-content animate-scale-up" style={{maxWidth: '800px'}} onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Create Assignment/Quiz</h2>
                            <button className="btn-close" onClick={() => setShowAssignmentModal(false)}><X size={24} /></button>
                        </div>
                        <form onSubmit={handleCreateAssignment} className="admin-form-container" style={{maxWidth: '100%'}}>
                            <div className="form-grid">
                                <div className="form-group full-width">
                                    <label>Target Course</label>
                                    <select className="admin-select" value={selectedCourseId} onChange={e => setSelectedCourseId(e.target.value)} required>
                                        <option value="">Select a Course</option>
                                        {courses.map(c => <option key={c.ID} value={c.ID}>{c.Name}</option>)}
                                    </select>
                                </div>
                                <div className="form-group full-width">
                                    <label>Title</label>
                                    <input className="admin-input" value={assignmentForm.title} onChange={e => setAssignmentForm({...assignmentForm, title: e.target.value})} required />
                                </div>
                                <div className="form-group">
                                    <label>Type</label>
                                    <select className="admin-select" value={assignmentForm.type} onChange={e => setAssignmentForm({...assignmentForm, type: e.target.value})}>
                                        <option value="assignment">Assignment</option>
                                        <option value="quiz">Quiz (MCQs)</option>
                                        <option value="exam">Final Exam</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Due Date</label>
                                    <input type="date" className="admin-input" value={assignmentForm.dueDate} onChange={e => setAssignmentForm({...assignmentForm, dueDate: e.target.value})} required />
                                </div>
                            </div>

                            <div className="form-actions mt-6">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowAssignmentModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Create Task</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeacherDashboard;
