import React, { useState, useEffect } from 'react';
import {
    PlusCircle, Users, BookOpen, Clock, Layout, Play,
    MessageSquare, Award, CheckCircle, XCircle, Eye,
    TrendingUp, ExternalLink, Menu, X, Plus, Calendar, Settings, Type, Download, FileText, Bell,
    UploadCloud, FilePlus, BellRing
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';
import FloatingLabelInput from '../components/FloatingLabelInput';
import Modal from '../components/Modal';
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

    // Teacher data
    const [teacherSessions, setTeacherSessions] = useState([]);
    const [teacherContent, setTeacherContent] = useState({ assignments: [], resources: [] });

    // Form states
    const [showSessionModal, setShowSessionModal] = useState(false);
    const [showAssignmentModal, setShowAssignmentModal] = useState(false);
    const [showResourceModal, setShowResourceModal] = useState(false);
    const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
    const [showGradeModal, setShowGradeModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [selectedSubmission, setSelectedSubmission] = useState(null);
    const [selectedCourseId, setSelectedCourseId] = useState('');
    const [uploading, setUploading] = useState(false);
    const [selectedFileName, setSelectedFileName] = useState('');

    const [gradingForm, setGradingForm] = useState({ marks: '', feedback: '' });

    const [sessionForm, setSessionForm] = useState({
        title: '', date: '', duration: '', zoomLink: '', description: ''
    });

    const [assignmentForm, setAssignmentForm] = useState({
        title: '', type: 'assignment', dueDate: '', maxMarks: '', description: '',
        questions: [{ text: '', type: 'text', options: [] }]
    });

    const [resourceForm, setResourceForm] = useState({
        title: '', description: '', fileURL: '', fileType: 'PDF'
    });

    const [announcementForm, setAnnouncementForm] = useState({
        title: '', content: ''
    });

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const [coursesData, subs, sessions, content] = await Promise.all([
                api.get('/enrollment/classes'),
                api.get('/lms/submissions/pending'),
                api.get('/lms/teacher/sessions'),
                api.get('/lms/teacher/content')
            ]);

            setCourses(coursesData);
            setSubmissions(subs);
            setTeacherSessions(sessions);
            setTeacherContent(content);
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
            toast.success('Session scheduled successfully!');
            fetchDashboardData();
        } catch (err) {
            toast.error('Failed to schedule session.');
        }
    };

    const handleCreateAssignment = async (e) => {
        e.preventDefault();
        try {
            await api.post('/lms/assignments', { ...assignmentForm, courseId: selectedCourseId });
            setShowAssignmentModal(false);
            setAssignmentForm({ title: '', type: 'assignment', dueDate: '', maxMarks: '', description: '', questions: [{ text: '', type: 'text', options: [] }] });
            toast.success('Assignment/Quiz created successfully!');
            fetchDashboardData();
        } catch (err) {
            toast.error('Failed to create assignment.');
        }
    };

    const handleCreateResource = async (e) => {
        e.preventDefault();
        if (!resourceForm.fileURL) {
            toast.error('Please upload a file.');
            return;
        }

        setUploading(true);
        try {
            await api.post('/lms/resources', { ...resourceForm, courseId: selectedCourseId });
            setShowResourceModal(false);
            setResourceForm({ title: '', description: '', fileURL: '', fileType: 'PDF' });
            setSelectedFileName('');
            toast.success('Resource uploaded successfully!');
            fetchDashboardData();
        } catch (err) {
            toast.error('Failed to upload resource.');
        } finally {
            setUploading(false);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 10 * 1024 * 1024) {
            toast.error('File too large. Max 10MB allowed.');
            return;
        }

        setSelectedFileName(file.name);
        const reader = new FileReader();
        reader.onloadend = () => {
            setResourceForm({ ...resourceForm, fileURL: reader.result });
        };
        reader.readAsDataURL(file);
    };

    const handleCreateAnnouncement = async (e) => {
        e.preventDefault();
        try {
            await api.post('/lms/announcements', { ...announcementForm, courseId: selectedCourseId });
            setShowAnnouncementModal(false);
            setAnnouncementForm({ title: '', content: '' });
            toast.success('Announcement posted successfully!');
            fetchDashboardData();
        } catch (err) {
            toast.error('Failed to post announcement.');
        }
    };

    const handleGradeSubmission = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/lms/submissions/${selectedSubmission.ID}/grade`, gradingForm);
            setShowGradeModal(false);
            setSelectedSubmission(null);
            setGradingForm({ marks: '', feedback: '' });
            toast.success('Submission graded successfully!');
            fetchDashboardData();
        } catch (err) {
            toast.error('Grading failed.');
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
                    <button className={activeTab === 'content' ? 'active' : ''} onClick={() => { setActiveTab('content'); setMobileMenuOpen(false); }}>
                        <Play size={20} /> Content Hub
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
                {activeTab === 'overview' && (
                    <div className="dashboard-overview animate-slide-up">
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
                                    <div>
                                        <div className="course-card-banner">
                                            <img
                                                src={course.Thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800&auto=format&fit=crop'}
                                                alt="" // Empty alt to prevent browser-default broken text overlapping
                                                className="banner-img"
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800&auto=format&fit=crop';
                                                }}
                                            />
                                            <div className="banner-overlay">
                                                <h3 className="banner-title">{course.Name}</h3>
                                                <p className="banner-fee">PKR {course.Fee}</p>
                                            </div>
                                            <div className="course-status-badge">
                                                <CheckCircle size={14} /> Active
                                            </div>
                                        </div>
                                        <div key={course.ID} className="course-admin-card glass-hover">
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

                                            <div className="course-card-footer mt-auto pt-4">
                                                <button
                                                    className="btn btn-primary w-full flex items-center justify-center gap-2 group transition-all duration-300"
                                                    onClick={() => setActiveTab('content')}
                                                >
                                                    <span>Manage Content</span>
                                                    <ExternalLink size={16} className="transition-transform group-hover:translate-x-1" />
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

                {activeTab === 'content' && (
                    <div className="content-hub-management animate-slide-up">
                        <div className="flex-between mb-8">
                            <div>
                                <h2 className="text-2xl font-bold">Content Hub</h2>
                                <p className="text-muted">Manage and monitor all learning assets across your courses.</p>
                            </div>
                            <div className="flex gap-4">
                                <button className="btn btn-secondary" onClick={() => setShowResourceModal(true)}>
                                    <FilePlus size={18} /> Upload Resource
                                </button>
                                <button className="btn btn-primary" onClick={() => setShowAssignmentModal(true)}>
                                    <PlusCircle size={18} /> Create Task
                                </button>
                            </div>
                        </div>

                        {/* Assignments Section */}
                        <section className="content-section mb-12">
                            <div className="section-header-row">
                                <h3 className="section-title flex items-center gap-2">
                                    <Award className="text-purple-500" size={24} /> Assignments & Quizzes
                                </h3>
                                <span className="badge badge-info">{teacherContent.assignments.length} Total</span>
                            </div>

                            {teacherContent.assignments.length > 0 ? (
                                <div className="content-hub-grid">
                                    {teacherContent.assignments.map(item => (
                                        <div key={item.ID} className="premium-resource-card">
                                            <div className={`card-type-indicator indicator-${item.Type}`}></div>
                                            <div className="card-top">
                                                <span className="course-tag">{item.CourseName}</span>
                                                <span className={`badge badge-sm badge-${item.Type === 'exam' ? 'danger' : item.Type === 'quiz' ? 'warning' : 'info'}`}>
                                                    {item.Type}
                                                </span>
                                            </div>
                                            <h4 className="card-title">{item.Title}</h4>
                                            <div className="card-meta">
                                                <div className="meta-item">
                                                    <Calendar size={14} />
                                                    <span>Due: {item.DueDate ? new Date(item.DueDate).toLocaleDateString() : 'No deadline'}</span>
                                                </div>
                                                <div className="meta-item">
                                                    <Award size={14} />
                                                    <span>Max Score: {item.MaxMarks || 100}</span>
                                                </div>
                                            </div>
                                            <div className="card-actions">
                                                <button className="btn-card-action btn-view" onClick={() => { setSelectedAssignment(item); setShowViewModal(true); }}>
                                                    <Eye size={16} /> Preview
                                                </button>
                                                <button className="btn-card-action btn-view" onClick={() => toast.error('Edit feature coming soon!')}>
                                                    <Settings size={16} /> Edit
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="empty-state-v2">
                                    <Award size={48} />
                                    <p>No assignments or quizzes created yet.</p>
                                    <button className="btn btn-link mt-2" onClick={() => setShowAssignmentModal(true)}>Create your first task</button>
                                </div>
                            )}
                        </section>

                        {/* Resources Section */}
                        <section className="content-section">
                            <div className="section-header-row">
                                <h3 className="section-title flex items-center gap-2">
                                    <FileText className="text-blue-500" size={24} /> Uploaded Resources
                                </h3>
                                <span className="badge badge-info">{teacherContent.resources.length} Files</span>
                            </div>

                            {teacherContent.resources.length > 0 ? (
                                <div className="content-hub-grid">
                                    {teacherContent.resources.map(item => (
                                        <div key={item.ID} className="premium-resource-card">
                                            <div className="card-type-indicator indicator-resource"></div>
                                            <div className="card-top">
                                                <span className="course-tag">{item.CourseName}</span>
                                                <span className="badge badge-sm badge-secondary">{item.FileType}</span>
                                            </div>
                                            <h4 className="card-title">{item.Title}</h4>
                                            <div className="card-meta">
                                                <div className="meta-item">
                                                    <Clock size={14} />
                                                    <span>Uploaded: {new Date(item.CreatedAt).toLocaleDateString()}</span>
                                                </div>
                                                <div className="meta-item">
                                                    <Download size={14} />
                                                    <span>PDF Handout</span>
                                                </div>
                                            </div>
                                            <div className="card-actions">
                                                <a href={item.FileURL} target="_blank" rel="noreferrer" className="btn-card-action btn-download">
                                                    <Download size={16} /> Download
                                                </a>
                                                <a href={item.FileURL} target="_blank" rel="noreferrer" className="btn-card-action btn-view">
                                                    <Eye size={16} /> View
                                                </a>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="empty-state-v2">
                                    <UploadCloud size={48} />
                                    <p>No resources uploaded yet.</p>
                                    <button className="btn btn-link mt-2" onClick={() => setShowResourceModal(true)}>Upload PDF Handout</button>
                                </div>
                            )}
                        </section>
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
                                                    <button className="btn btn-primary btn-sm" onClick={() => { setSelectedSubmission(sub); setShowGradeModal(true); }}>Grade Now</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="admin-empty-state">
                                <div className="empty-state-icon" style={{ background: '#e6f7f5', color: '#1ab69d' }}>
                                    <CheckCircle size={40} />
                                </div>
                                <p>All submissions have been graded! Great job.</p>
                                <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('overview')}>Back to Overview</button>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'schedule' && (
                    <div className="schedule-management animate-slide-up">
                        <div className="flex-between mb-8">
                            <div>
                                <h2 className="text-2xl font-bold">Class Schedule</h2>
                                <p className="text-muted">View and manage your upcoming and past live sessions.</p>
                            </div>
                            <button className="btn btn-primary" onClick={() => setShowSessionModal(true)}>
                                <Plus size={18} /> Schedule New Session
                            </button>
                        </div>

                        <div className="payments-table glass">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Session Title</th>
                                        <th>Course</th>
                                        <th>Date & Time</th>
                                        <th>Duration</th>
                                        <th>Status</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {teacherSessions.length > 0 ? teacherSessions.map(session => {
                                        const isPast = new Date(session.SessionDate) < new Date();
                                        return (
                                            <tr key={session.ID}>
                                                <td><strong>{session.Title}</strong></td>
                                                <td>{session.CourseName}</td>
                                                <td>{new Date(session.SessionDate).toLocaleString()}</td>
                                                <td>{session.DurationMinutes} Min</td>
                                                <td>
                                                    <span className={`badge badge-${isPast ? 'secondary' : 'success'}`}>
                                                        {isPast ? 'Expired' : 'Scheduled'}
                                                    </span>
                                                </td>
                                                <td>
                                                    {!isPast && (
                                                        <a href={session.ZoomLink} target="_blank" rel="noreferrer" className="btn btn-sm btn-primary">
                                                            <Play size={14} /> Join Now
                                                        </a>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    }) : <tr><td colSpan="6" className="text-center py-4">No sessions scheduled yet.</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </main>

            {/* Schedule Session Modal */}
            <Modal
                isOpen={showSessionModal}
                onClose={() => setShowSessionModal(false)}
                title="Schedule Live Session"
                subtitle="Set up a new live learning experience for your students."
                footer={<>
                    <button type="button" className="btn btn-secondary" onClick={() => setShowSessionModal(false)}>Discard</button>
                    <button type="submit" form="form-session" className="btn btn-primary">Schedule Session</button>
                </>}
            >
                <form id="form-session" onSubmit={handleCreateSession}>
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
                    <FloatingLabelInput label="Session Title" icon={Type} value={sessionForm.title} onChange={e => setSessionForm({ ...sessionForm, title: e.target.value })} required />
                    <div className="form-grid">
                        <FloatingLabelInput label="Date & Time" icon={Calendar} type="datetime-local" value={sessionForm.date} onChange={e => setSessionForm({ ...sessionForm, date: e.target.value })} required />
                        <FloatingLabelInput label="Duration (Min)" icon={Clock} type="number" placeholder="60" value={sessionForm.duration} onChange={e => setSessionForm({ ...sessionForm, duration: e.target.value })} required />
                    </div>
                    <FloatingLabelInput label="Zoom / Meeting Link" icon={ExternalLink} value={sessionForm.zoomLink} onChange={e => setSessionForm({ ...sessionForm, zoomLink: e.target.value })} required />
                    <FloatingLabelInput label="Session Agenda (Optional)" icon={MessageSquare} type="textarea" value={sessionForm.description} onChange={e => setSessionForm({ ...sessionForm, description: e.target.value })} />
                </form>
            </Modal>

            {/* Create Assignment Modal */}
            <Modal
                isOpen={showAssignmentModal}
                onClose={() => setShowAssignmentModal(false)}
                title="Create New Task"
                subtitle="Publish assignments, quizzes, or exams for your students."
                footer={<>
                    <button type="button" className="btn btn-secondary" onClick={() => setShowAssignmentModal(false)}>Cancel</button>
                    <button type="submit" form="form-assignment" className="btn btn-primary">Create Task</button>
                </>}
            >
                <form id="form-assignment" onSubmit={handleCreateAssignment}>
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
                    <FloatingLabelInput label="Task Title" icon={Type} placeholder="e.g. Mid-term Assessment" value={assignmentForm.title} onChange={e => setAssignmentForm({ ...assignmentForm, title: e.target.value })} required />
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Task Type</label>
                            <div className="input-with-icon">
                                <Award size={18} />
                                <select className="admin-select" value={assignmentForm.type} onChange={e => setAssignmentForm({ ...assignmentForm, type: e.target.value })}>
                                    <option value="assignment">Assignment</option>
                                    <option value="quiz">Quiz (MCQs)</option>
                                    <option value="exam">Final Exam</option>
                                </select>
                            </div>
                        </div>
                        <FloatingLabelInput label="Due Date" icon={Clock} type="date" value={assignmentForm.dueDate} onChange={e => setAssignmentForm({ ...assignmentForm, dueDate: e.target.value })} required />
                    </div>
                    <FloatingLabelInput label="Task Description" icon={MessageSquare} type="textarea" value={assignmentForm.description} onChange={e => setAssignmentForm({ ...assignmentForm, description: e.target.value })} required />
                    {assignmentForm.type === 'quiz' && (
                        <div className="quiz-questions-builder mt-6">
                            <div className="flex-between mb-4">
                                <h3>Quiz Questions</h3>
                                <button type="button" className="btn btn-secondary btn-sm" onClick={handleAddQuestion}><Plus size={16} /> Add Question</button>
                            </div>
                            {assignmentForm.questions.map((q, qIdx) => (
                                <div key={qIdx} className="question-box p-4 border rounded-2xl mb-4 bg-slate-50">
                                    <FloatingLabelInput label={`Question ${qIdx + 1}`} value={q.text} onChange={e => {
                                        const newQs = [...assignmentForm.questions];
                                        newQs[qIdx].text = e.target.value;
                                        setAssignmentForm({ ...assignmentForm, questions: newQs });
                                    }} required />
                                </div>
                            ))}
                        </div>
                    )}
                </form>
            </Modal>

            {/* Resource Upload Modal */}
            <Modal
                isOpen={showResourceModal}
                onClose={() => setShowResourceModal(false)}
                title="Upload Course Resource"
                subtitle="Share PDFs and handouts with your enrolled students."
                footer={<>
                    <button type="button" className="btn btn-secondary" onClick={() => setShowResourceModal(false)}>Cancel</button>
                    <button type="submit" form="form-resource" className="btn btn-primary" disabled={uploading}>
                        {uploading ? <><div className="spinner-mini"></div> Processing...</> : 'Upload & Publish'}
                    </button>
                </>}
            >
                <form id="form-resource" onSubmit={handleCreateResource}>
                    <div className="form-group mb-5">
                        <label>Target Course</label>
                        <select className="admin-select" value={selectedCourseId} onChange={(e) => setSelectedCourseId(e.target.value)} required>
                            <option value="">Select a course</option>
                            {courses.map(c => <option key={c.ID} value={c.ID}>{c.Name}</option>)}
                        </select>
                    </div>
                    <div className="file-upload-wrapper">
                        <label>Upload PDF Document</label>
                        <div className={`file-drop-zone ${selectedFileName ? 'active' : ''}`}>
                            <input type="file" accept=".pdf" onChange={handleFileChange} required={!resourceForm.fileURL} />
                            <div className="upload-icon-box"><UploadCloud size={28} /></div>
                            <p className="font-bold">{selectedFileName || 'Click or drag to upload handout'}</p>
                            <p className="text-xs text-muted mt-1">Maximum file size: 10MB</p>
                        </div>
                        {selectedFileName && (
                            <div className="file-preview-strip animate-slide-up">
                                <FileText size={20} className="text-primary" />
                                <span className="text-sm font-medium flex-1 truncate">{selectedFileName}</span>
                                <CheckCircle size={16} className="text-success" />
                            </div>
                        )}
                    </div>
                    <FloatingLabelInput label="Resource Title" icon={Type} placeholder="e.g. Chapter 1: Introduction" value={resourceForm.title} onChange={(e) => setResourceForm({ ...resourceForm, title: e.target.value })} required />
                    <FloatingLabelInput label="Description (Optional)" icon={MessageSquare} type="textarea" value={resourceForm.description} onChange={(e) => setResourceForm({ ...resourceForm, description: e.target.value })} />
                </form>
            </Modal>

            {/* Announcement Modal */}
            <Modal
                isOpen={showAnnouncementModal}
                onClose={() => setShowAnnouncementModal(false)}
                title="Post New Announcement"
                subtitle="Broadcast important updates to your course students."
                footer={<>
                    <button type="button" className="btn btn-secondary" onClick={() => setShowAnnouncementModal(false)}>Cancel</button>
                    <button type="submit" form="form-announcement" className="btn btn-primary">Post Announcement</button>
                </>}
            >
                <form id="form-announcement" onSubmit={handleCreateAnnouncement}>
                    <div className="form-group mb-4">
                        <label>Target Course</label>
                        <div className="input-with-icon">
                            <BellRing size={18} />
                            <select className="admin-select" value={selectedCourseId} onChange={(e) => setSelectedCourseId(e.target.value)} required>
                                <option value="">Select a course</option>
                                {courses.map(c => <option key={c.ID} value={c.ID}>{c.Name}</option>)}
                            </select>
                        </div>
                    </div>
                    <FloatingLabelInput label="Announcement Title" icon={Type} placeholder="e.g. Class Rescheduled" value={announcementForm.title} onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })} required />
                    <FloatingLabelInput label="Message Content" icon={MessageSquare} type="textarea" value={announcementForm.content} onChange={(e) => setAnnouncementForm({ ...announcementForm, content: e.target.value })} required />
                </form>
            </Modal>

            {/* Grading Modal */}
            <Modal
                isOpen={showGradeModal && !!selectedSubmission}
                onClose={() => setShowGradeModal(false)}
                title="Grade Submission"
                subtitle={selectedSubmission ? `${selectedSubmission.StudentName} — ${selectedSubmission.AssignmentTitle}` : ''}
                maxWidth="640px"
                footer={<>
                    <button type="button" className="btn btn-secondary" onClick={() => setShowGradeModal(false)}>Cancel</button>
                    <button type="submit" form="form-grading" className="btn btn-primary">Submit Grade</button>
                </>}
            >
                {selectedSubmission && (
                    <form id="form-grading" onSubmit={handleGradeSubmission}>
                        <div className="review-box glass mb-5 p-4 rounded-2xl">
                            <h5 className="mb-2">Student Response:</h5>
                            <p style={{ whiteSpace: 'pre-wrap' }}>{selectedSubmission.TextResponse || 'No text response.'}</p>
                            {selectedSubmission.FileURL && (
                                <a href={selectedSubmission.FileURL} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm mt-4">
                                    <Download size={16} /> View Attachment
                                </a>
                            )}
                        </div>
                        <FloatingLabelInput label={`Marks / Score (Max ${selectedSubmission.MaxMarks || 100})`} icon={Award} type="number" value={gradingForm.marks} onChange={(e) => setGradingForm({ ...gradingForm, marks: e.target.value })} required />
                        <FloatingLabelInput label="Feedback for Student" icon={MessageSquare} type="textarea" placeholder="Provide constructive feedback..." value={gradingForm.feedback} onChange={(e) => setGradingForm({ ...gradingForm, feedback: e.target.value })} required />
                    </form>
                )}
            </Modal>

            {/* View Assignment Modal */}
            <Modal
                isOpen={showViewModal && !!selectedAssignment}
                onClose={() => setShowViewModal(false)}
                title="Task Preview"
                subtitle={selectedAssignment?.Title}
                footer={<button className="btn btn-secondary" onClick={() => setShowViewModal(false)}>Close Preview</button>}
            >
                {selectedAssignment && (
                    <div className="task-preview-content">
                        <div className="preview-meta-grid mb-6">
                            <div className="preview-meta-item">
                                <span className="label">Course</span>
                                <p>{selectedAssignment.CourseName}</p>
                            </div>
                            <div className="preview-meta-item">
                                <span className="label">Type</span>
                                <p className="capitalize">{selectedAssignment.Type}</p>
                            </div>
                            <div className="preview-meta-item">
                                <span className="label">Max Score</span>
                                <p>{selectedAssignment.MaxMarks || 100}</p>
                            </div>
                            <div className="preview-meta-item">
                                <span className="label">Due Date</span>
                                <p>{selectedAssignment.DueDate ? new Date(selectedAssignment.DueDate).toLocaleDateString() : 'No deadline'}</p>
                            </div>
                        </div>

                        <div className="preview-section mb-6">
                            <h5 className="font-bold mb-2">Description</h5>
                            <div className="glass p-4 rounded-xl text-sm leading-relaxed">
                                {selectedAssignment.Description || 'No description provided.'}
                            </div>
                        </div>

                        {selectedAssignment.Type === 'quiz' && selectedAssignment.Questions && (
                            <div className="preview-section">
                                <h5 className="font-bold mb-3">Quiz Questions</h5>
                                <div className="questions-list space-y-3">
                                    {(() => {
                                        try {
                                            const qs = typeof selectedAssignment.Questions === 'string' 
                                                ? JSON.parse(selectedAssignment.Questions) 
                                                : selectedAssignment.Questions;
                                            return Array.isArray(qs) ? qs.map((q, idx) => (
                                                <div key={idx} className="question-preview-item p-3 border rounded-xl bg-slate-50 text-sm">
                                                    <strong>Q{idx + 1}:</strong> {q.text}
                                                </div>
                                            )) : <p className="text-muted">No questions found.</p>;
                                        } catch (e) {
                                            return <p className="text-danger">Error loading questions.</p>;
                                        }
                                    })()}
                                </div>
                            </div>
                        )}
                        
                        {selectedAssignment.FileURL && (
                            <div className="preview-section mt-6">
                                <a href={selectedAssignment.FileURL} target="_blank" rel="noreferrer" className="btn btn-secondary w-full">
                                    <Download size={16} /> View Attached Document
                                </a>
                            </div>
                        )}
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default TeacherDashboard;
