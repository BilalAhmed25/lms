import React, { useState, useEffect } from 'react';
import {
    Users, CheckCircle, XCircle, Eye, DollarSign, LayoutDashboard,
    BookOpen, PlusCircle, UserCheck, TrendingUp, Search, Bell, Book,
    Image, Target, Award, Zap, Hash, Clock, FileText, AlignLeft, Info, Plus,
    Menu, X
} from 'lucide-react';
import FloatingLabelInput from '../components/FloatingLabelInput';
import api from '../utils/api';
import SEO from '../components/SEO';

const Loader = () => (
    <div className="loader-container">
        <div className="spinner"></div>
    </div>
);

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [stats, setStats] = useState({ totalUsers: 0, totalStudents: 0, totalTeachers: 0, pendingEnrollments: 0 });
    const [enrollments, setEnrollments] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [students, setStudents] = useState([]);
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [selectedReceipt, setSelectedReceipt] = useState(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [editCourse, setEditCourse] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);

    // New Course Form
    const [courseForm, setCourseForm] = useState({ 
        name: '', 
        slug: '',
        fee: '', 
        originalFee: '',
        shortIntro: '',
        description: '', 
        teacherId: '',
        thumbnail: '',
        targetAudience: '',
        prerequisites: '',
        duration: '',
        totalLessons: '',
        whatWillILearn: ['', '', '', '']
    });

    useEffect(() => {
        fetchStats();
        fetchTabContent();
    }, [activeTab]);

    const fetchStats = async () => {
        try {
            const data = await api.get('/admin/stats');
            setStats(data);
        } catch (err) { console.error(err); }
    };

    const fetchTabContent = async () => {
        setLoading(true);

        try {
            if (activeTab === 'enrollments') {
                const data = await api.get('/enrollment/admin/pending');
                setEnrollments(data);
            } else if (activeTab === 'teachers' || activeTab === 'courses' || activeTab === 'add-course') {
                const data = await api.get('/admin/users?role=Teacher');
                setTeachers(data);
            } 
            
            if (activeTab === 'students') {
                const data = await api.get('/admin/users?role=Student');
                setStudents(data);
            } else if (activeTab === 'courses') {
                const data = await api.get('/admin/classes');
                setClasses(data);
            }
        } catch (err) { console.error(err); }
        setLoading(false);
    };

    const handleStatusUpdate = async (userId, status) => {
        setSubmitting(true);
        try {
            await api.put(`/admin/users/${userId}/status`, { status });
            await fetchTabContent();
        } catch (err) { console.error(err); }
        setSubmitting(false);
    };

    const handleWhatLearnChange = (index, value) => {
        const updated = [...courseForm.whatWillILearn];
        updated[index] = value;
        setCourseForm({ ...courseForm, whatWillILearn: updated });
    };

    const addWhatLearnField = () => {
        setCourseForm({ ...courseForm, whatWillILearn: [...courseForm.whatWillILearn, ''] });
    };

    const handleApproveEnrollment = async (id) => {
        setSubmitting(true);
        try {
            await api.put(`/enrollment/admin/approve/${id}`);
            await fetchTabContent();
        } catch (err) { console.error(err); }
        setSubmitting(false);
    };

    const handleCreateCourse = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const payload = {
                ...courseForm,
                whatWillILearn: courseForm.whatWillILearn.filter(item => item.trim() !== '')
            };
            await api.post('/admin/classes', payload);
            setCourseForm({ 
                name: '', slug: '', fee: '', originalFee: '', shortIntro: '', 
                description: '', teacherId: '', thumbnail: '', targetAudience: '', 
                prerequisites: '', duration: '', totalLessons: '', whatWillILearn: ['', '', '', ''] 
            });
            setActiveTab('courses');
            await fetchTabContent();
        } catch (err) { console.error(err); }
        setSubmitting(false);
    };

    const handleUpdateCourse = async (courseId, status, teacherId) => {
        setSubmitting(true);
        try {
            const course = classes.find(c => c.ID === courseId);
            await api.put(`/admin/courses/${courseId}/update`, { 
                ...course,
                name: course.Name,
                status 
            });
            fetchTabContent();
        } catch (err) { console.error(err); }
        setSubmitting(false);
    };

    const handleOpenEdit = (course) => {
        setEditCourse({
            ...course,
            name: course.Name,
            slug: course.Slug,
            fee: course.Fee,
            originalFee: course.OriginalFee,
            shortIntro: course.ShortIntro,
            description: course.Description,
            teacherId: course.TeacherID,
            thumbnail: course.Thumbnail,
            targetAudience: course.TargetAudience,
            prerequisites: course.Prerequisites,
            duration: course.Duration,
            totalLessons: course.TotalLessons,
            status: course.Status,
            whatWillILearn: typeof course.WhatWillILearn === 'string' ? JSON.parse(course.WhatWillILearn) : (course.WhatWillILearn || ['', '', '', ''])
        });
        setShowEditModal(true);
    };

    const handleSaveEdit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.put(`/admin/courses/${editCourse.ID}/update`, editCourse);
            setShowEditModal(false);
            fetchTabContent();
            alert('Course updated successfully!');
        } catch (err) {
            alert('Update failed');
        }
        setSubmitting(false);
    };

    const handleEditFormChange = (field, value) => {
        setEditCourse(prev => ({ ...prev, [field]: value }));
    };

    const handleEditLearningOutcomeChange = (index, value) => {
        const updatedOutcomes = [...editCourse.whatWillILearn];
        updatedOutcomes[index] = value;
        setEditCourse(prev => ({ ...prev, whatWillILearn: updatedOutcomes }));
    };

    const addEditLearningOutcome = () => {
        setEditCourse(prev => ({ ...prev, whatWillILearn: [...prev.whatWillILearn, ''] }));
    };

    return (
        <div className="admin-layout animate-fade-in">
            <SEO 
                title="Admin Dashboard" 
                description="Comprehensive administration panel for Deenova Learning Hub. Manage users, courses, enrollments, and platform statistics."
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

                <nav className="sidebar-nav">
                    <button className={activeTab === 'overview' ? 'active' : ''} onClick={() => { setActiveTab('overview'); setMobileMenuOpen(false); }}>
                        <TrendingUp size={20} /> Dashboard
                    </button>
                    <button className={activeTab === 'enrollments' ? 'active' : ''} onClick={() => { setActiveTab('enrollments'); setMobileMenuOpen(false); }}>
                        <DollarSign size={20} /> Enrollments
                        {stats.pendingEnrollments > 0 && <span>{stats.pendingEnrollments}</span>}
                    </button>
                    <button className={activeTab === 'teachers' ? 'active' : ''} onClick={() => { setActiveTab('teachers'); setMobileMenuOpen(false); }}>
                        <Users size={20} /> Teachers
                    </button>
                    <button className={activeTab === 'students' ? 'active' : ''} onClick={() => { setActiveTab('students'); setMobileMenuOpen(false); }}>
                        <UserCheck size={20} /> Students
                    </button>
                    <button className={activeTab === 'courses' ? 'active' : ''} onClick={() => { setActiveTab('courses'); setMobileMenuOpen(false); }}>
                        <BookOpen size={20} /> Courses
                    </button>
                </nav>

                <div className="sidebar-footer">
                    <button className="exit-btn" onClick={() => window.location.href = '/'}>
                        <XCircle size={20} /> Exit Admin
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="admin-main">
                <header className="admin-header">
                    <div className="header-title">
                        <h1>Welcome, Admin</h1>
                        <p>Here's what's happening with your platform today.</p>
                    </div>

                    <div className="admin-profile-nav">
                        <div className="search-bar">
                            <Search size={18} />
                            <input type="text" placeholder="Search data..." />
                        </div>
                        <button className="btn-icon relative">
                            <Bell size={20} />
                            <span className="notification-dot"></span>
                        </button>
                        <div className="admin-avatar">A</div>
                    </div>
                </header>

                <div className="admin-content">
                    {activeTab === 'overview' && (
                        <div className="animate-slide-up">
                            {loading ? (
                                <Loader />
                            ) : (
                                <>
                                    <div className="stats-grid mb-12">
                                        {[1, 2, 3, 4].map(i => (
                                            <div key={i} className="stat-card">
                                                <div className={`stat-icon ${i === 1 ? 'purple' : i === 2 ? 'blue' : i === 3 ? 'green' : 'orange'}`}>
                                                    {i === 1 ? <Users size={28} /> : i === 2 ? <UserCheck size={28} /> : i === 3 ? <TrendingUp size={28} /> : <DollarSign size={28} />}
                                                </div>
                                                <div className="stat-info">
                                                    <p>{i === 1 ? 'Total Users' : i === 2 ? 'Students' : i === 3 ? 'Teachers' : 'Pending Apps'}</p>
                                                    <h3>{i === 1 ? stats.totalUsers : i === 2 ? stats.totalStudents : i === 3 ? stats.totalTeachers : stats.pendingEnrollments}</h3>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="quick-actions-grid">
                                        <div className="action-group-card">
                                            <h3>Quick Actions</h3>
                                            <div className="inner-grid">
                                                <button className="action-tile" onClick={() => setActiveTab('add-course')}>
                                                    <div className="tile-icon">
                                                        <PlusCircle size={20} />
                                                    </div>
                                                    <strong>Add Course</strong>
                                                    <span>Announce new class</span>
                                                </button>
                                                <button className="action-tile secondary-tile" onClick={() => setActiveTab('enrollments')}>
                                                    <div className="tile-icon">
                                                        <DollarSign size={20} />
                                                    </div>
                                                    <strong>Review Fees</strong>
                                                    <span>Check pending receipts</span>
                                                </button>
                                            </div>
                                        </div>

                                        <div className="action-group-card">
                                            <h3>System Status</h3>
                                            <div className="status-list">
                                                <div className="status-item">
                                                    <span>Database Connection</span>
                                                    <span className="status-badge-active">ACTIVE</span>
                                                </div>
                                                <div className="status-item">
                                                    <span>Storage API</span>
                                                    <span className="status-badge-active">ACTIVE</span>
                                                </div>
                                                <div className="status-item">
                                                    <span>Email Server</span>
                                                    <span className="status-badge-active">ACTIVE</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {activeTab === 'enrollments' && (
                        <div className="animate-slide-up">
                            <div className="flex-between mb-8">
                                <h2 className="text-2xl font-bold tracking-tight">Fee Verification</h2>
                                <span className="badge-count">{enrollments.length} Pending Requests</span>
                            </div>

                            <div className="payments-table">
                                {loading ? (
                                    <Loader />
                                ) : enrollments.length === 0 ? (
                                    <div className="admin-empty-state">
                                        <div className="empty-state-icon">
                                            <DollarSign size={40} />
                                        </div>
                                        <p>No pending enrollment requests at the moment.</p>
                                    </div>
                                ) : (
                                    <table>
                                        <thead>
                                            <tr><th>Student</th><th>Class</th><th>Fee</th><th>Receipt</th><th>Action</th></tr>
                                        </thead>
                                        <tbody>
                                            {enrollments.map(req => (
                                                <tr key={req.ID}>
                                                    <td><div className="user-cell"><strong>{req.StudentName}</strong><span>{req.StudentEmail}</span></div></td>
                                                    <td><span className="font-medium text-slate-700">{req.ClassName}</span></td>
                                                    <td><span className="text-primary font-bold">${req.AmountPaid}</span></td>
                                                    <td><button className="btn-icon" onClick={() => setSelectedReceipt(req.ReceiptUrl)}><Eye size={18} /></button></td>
                                                    <td>
                                                        <div className="flex gap-2">
                                                            <button className="btn-approve" onClick={() => handleApproveEnrollment(req.ID)} disabled={submitting}>
                                                                {submitting ? 'Please wait...' : <><CheckCircle size={16} /> Approve</>}
                                                            </button>
                                                            <button className="btn-reject" disabled={submitting}><XCircle size={16} /></button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>
                    )}

                    {(activeTab === 'teachers' || activeTab === 'students') && (
                        <div className="animate-slide-up">
                            <h2 className="text-2xl font-bold tracking-tight mb-8">{activeTab === 'teachers' ? 'Teacher' : 'Student'} Directory</h2>
                            <div className="payments-table">
                                {loading ? (
                                    <Loader />
                                ) : (
                                    <table>
                                        <thead>
                                            <tr><th>User</th><th>Status</th><th>Joined Date</th><th>Action</th></tr>
                                        </thead>
                                        <tbody>
                                            {(activeTab === 'teachers' ? teachers : students).map(u => (
                                                <tr key={u.ID}>
                                                    <td><div className="user-cell"><strong>{u.Name}</strong><span>{u.Email}</span></div></td>
                                                    <td><span className={`badge ${u.Status === 'active' ? 'badge-success' : 'badge-primary'}`}>{u.Status}</span></td>
                                                    <td>{new Date(u.CreatedAt).toLocaleDateString()}</td>
                                                    <td>
                                                        {u.Status === 'pending' || u.Status === 'inactive' ? (
                                                            <button className="btn-approve" onClick={() => handleStatusUpdate(u.ID, 'active')} disabled={submitting}>
                                                                {submitting ? 'Please wait...' : 'Activate'}
                                                            </button>
                                                        ) : (
                                                            <button className="btn-reject" onClick={() => handleStatusUpdate(u.ID, 'inactive')} disabled={submitting}>
                                                                {submitting ? 'Please wait...' : 'Suspend'}
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'courses' && (
                        <div className="animate-slide-up">
                            <div className="flex-between mb-8">
                                <h2 className="text-2xl font-bold tracking-tight">Active Courses</h2>
                                <button className="btn btn-primary" onClick={() => setActiveTab('add-course')}><PlusCircle size={20} /> Add New Course</button>
                            </div>
                            <div className="admin-course-grid">
                                {loading ? (
                                    <Loader />
                                ) : classes.map(cls => (
                                    <div key={cls.ID} className={`course-admin-card ${cls.Status === 'inactive' ? 'status-inactive' : ''}`}>
                                        <div className="course-card-top">
                                            <div className="course-card-icon">
                                                <BookOpen size={20} />
                                            </div>
                                            <div className="course-status-badge" onClick={() => handleUpdateCourse(cls.ID, cls.Status === 'active' ? 'inactive' : 'active', cls.TeacherID)}>
                                                {cls.Status === 'active' ? <><CheckCircle size={14} /> Active</> : <><XCircle size={14} /> Inactive</>}
                                            </div>
                                        </div>
                                        
                                        <h3>{cls.Name}</h3>
                                        
                                        <div className="course-stats-grid">
                                            <div className="stat-item" title="Enrolled Students">
                                                <Users size={18} />
                                                <div className="stat-info">
                                                    <span>{cls.EnrollmentCount || 0}</span>
                                                    <span className="stat-label">Students</span>
                                                </div>
                                            </div>
                                            <div className="stat-item" title="Published Assignments">
                                                <PlusCircle size={18} />
                                                <div className="stat-info">
                                                    <span>{cls.AssignmentCount || 0}</span>
                                                    <span className="stat-label">Lessons</span>
                                                </div>
                                            </div>
                                            <div className="stat-item" title="Graded Items">
                                                <UserCheck size={18} />
                                                <div className="stat-info">
                                                    <span>{cls.GradedCount || 0}</span>
                                                    <span className="stat-label">Graded</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="course-teacher-assign">
                                            <span>Teacher: {cls.TeacherName || 'Unassigned'}</span>
                                            <div className="flex gap-2">
                                                <button className="btn-icon" onClick={() => handleOpenEdit(cls)} title="Edit Course Details">
                                                    <PlusCircle size={18} style={{transform: 'rotate(45deg)'}} />
                                                </button>
                                                <button className="btn-icon" title="View Detailed Stats"><TrendingUp size={18} /></button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'add-course' && (
                        <div className="animate-slide-up">
                            <div className="admin-form-container">
                                <div className="form-header">
                                    <h2>Announce New Course</h2>
                                    <p>Create a new class for students to enroll in.</p>
                                </div>

                                <form onSubmit={handleCreateCourse} className="rich-admin-form">
                                    <div className="form-grid">
                                        <div className="form-section-title full-width">Basic Information</div>
                                        <FloatingLabelInput
                                            label="Course Name"
                                            icon={Book}
                                            value={courseForm.name}
                                            onChange={e => setCourseForm({ ...courseForm, name: e.target.value })}
                                            required
                                        />
                                        <FloatingLabelInput
                                            label="Custom Slug (Optional)"
                                            icon={Hash}
                                            value={courseForm.slug}
                                            onChange={e => setCourseForm({ ...courseForm, slug: e.target.value })}
                                            placeholder="e.g. math-4024"
                                        />
                                        
                                        <div className="form-section-title full-width mt-6">Pricing & Instructor</div>
                                        <FloatingLabelInput
                                            label="Sale Price ($)"
                                            type="number"
                                            icon={Zap}
                                            value={courseForm.fee}
                                            onChange={e => setCourseForm({ ...courseForm, fee: e.target.value })}
                                            required
                                        />
                                        <FloatingLabelInput
                                            label="Original Price ($)"
                                            type="number"
                                            icon={DollarSign}
                                            value={courseForm.originalFee}
                                            onChange={e => setCourseForm({ ...courseForm, originalFee: e.target.value })}
                                        />
                                        
                                        <div className="full-width">
                                            <div className="custom-select-wrapper">
                                                <Users className="select-icon" size={18} />
                                                <select 
                                                    className="admin-select"
                                                    value={courseForm.teacherId}
                                                    onChange={e => setCourseForm({...courseForm, teacherId: e.target.value})}
                                                    required
                                                >
                                                    <option value="">Assign Teacher</option>
                                                    {teachers.map(t => (
                                                        <option key={t.ID} value={t.ID}>{t.Name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        <div className="form-section-title full-width mt-6">Media & Metadata</div>
                                        <div className="full-width">
                                            <FloatingLabelInput
                                                label="Thumbnail Image URL"
                                                icon={Image}
                                                value={courseForm.thumbnail}
                                                onChange={e => setCourseForm({ ...courseForm, thumbnail: e.target.value })}
                                            />
                                        </div>
                                        <FloatingLabelInput
                                            label="Course Duration"
                                            icon={Clock}
                                            value={courseForm.duration}
                                            onChange={e => setCourseForm({ ...courseForm, duration: e.target.value })}
                                            placeholder="e.g. 40 Hours"
                                        />
                                        <FloatingLabelInput
                                            label="Total Lessons"
                                            type="number"
                                            icon={FileText}
                                            value={courseForm.totalLessons}
                                            onChange={e => setCourseForm({ ...courseForm, totalLessons: e.target.value })}
                                        />

                                        <div className="form-section-title full-width mt-6">Course Description</div>
                                        <div className="full-width">
                                            <textarea
                                                className="admin-textarea mb-4"
                                                placeholder="Short Intro (One liner)"
                                                rows="2"
                                                value={courseForm.shortIntro}
                                                onChange={e => setCourseForm({ ...courseForm, shortIntro: e.target.value })}
                                            ></textarea>
                                            <textarea
                                                className="admin-textarea"
                                                placeholder="Extended Description & Curriculum"
                                                rows="5"
                                                value={courseForm.description}
                                                onChange={e => setCourseForm({ ...courseForm, description: e.target.value })}
                                            ></textarea>
                                        </div>

                                        <div className="form-section-title full-width mt-6">Rich Details</div>
                                        <FloatingLabelInput
                                            label="Target Audience"
                                            icon={Target}
                                            value={courseForm.targetAudience}
                                            onChange={e => setCourseForm({ ...courseForm, targetAudience: e.target.value })}
                                        />
                                        <FloatingLabelInput
                                            label="Prerequisites"
                                            icon={Info}
                                            value={courseForm.prerequisites}
                                            onChange={e => setCourseForm({ ...courseForm, prerequisites: e.target.value })}
                                        />

                                        <div className="full-width mt-4">
                                            <label className="admin-label-small">What Will I Learn?</label>
                                            <div className="what-learn-inputs">
                                                {courseForm.whatWillILearn.map((item, idx) => (
                                                    <div key={idx} className="input-with-icon-group">
                                                        <CheckCircle size={16} className="text-primary" />
                                                        <input 
                                                            type="text" 
                                                            placeholder={`Outcome ${idx + 1}`}
                                                            value={item}
                                                            onChange={(e) => handleWhatLearnChange(idx, e.target.value)}
                                                            className="admin-input-mini"
                                                        />
                                                    </div>
                                                ))}
                                                <button type="button" className="add-field-btn" onClick={addWhatLearnField}>
                                                    <Plus size={16} /> Add More Learning Outcome
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="form-actions">
                                        <button type="submit" className="btn-publish" disabled={submitting}>
                                            {submitting ? 'Please wait...' : 'Publish Course'}
                                        </button>
                                        <button type="button" className="btn-discard" onClick={() => setActiveTab('courses')} disabled={submitting}>Discard</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {selectedReceipt && (
                <div className="modal-overlay" onClick={() => setSelectedReceipt(null)}>
                    <div className="modal-content glass p-8 rounded-[40px] max-w-xl animate-scale-up" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-black">Fee Receipt</h3>
                            <button className="text-slate-400 hover:text-secondary transition-colors" onClick={() => setSelectedReceipt(null)}><XCircle size={24} /></button>
                        </div>
                        <div className="rounded-3xl overflow-hidden border-4 border-slate-50 shadow-inner">
                            <img src={selectedReceipt} alt="Payment Receipt" className="w-full h-auto" />
                        </div>
                        <div className="flex gap-4 mt-8">
                            <button className="btn btn-primary flex-1">Approve Now</button>
                            <button className="btn bg-slate-100 text-slate-600 flex-1" onClick={() => setSelectedReceipt(null)}>Close View</button>
                        </div>
                    </div>
                </div>
            )}
            {/* Edit Course Modal */}
            {showEditModal && editCourse && (
                <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
                    <div className="modal-content animate-scale-up edit-course-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Edit Course: {editCourse.name}</h2>
                            <button className="btn-close" onClick={() => setShowEditModal(false)}><X size={24} /></button>
                        </div>
                        
                        <form onSubmit={handleSaveEdit} className="admin-form-container" style={{maxWidth: '100%', margin: '0'}}>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Course Title</label>
                                    <input className="admin-input" value={editCourse.name} onChange={e => handleEditFormChange('name', e.target.value)} required />
                                </div>
                                <div className="form-group">
                                    <label>Custom Slug (url identifier)</label>
                                    <input className="admin-input" value={editCourse.slug} onChange={e => handleEditFormChange('slug', e.target.value)} required />
                                </div>
                                <div className="form-group">
                                    <label>Course Fee (PKR)</label>
                                    <input type="number" className="admin-input" value={editCourse.fee} onChange={e => handleEditFormChange('fee', e.target.value)} required />
                                </div>
                                <div className="form-group">
                                    <label>Original Price (Optional)</label>
                                    <input type="number" className="admin-input" value={editCourse.originalFee} onChange={e => handleEditFormChange('originalFee', e.target.value)} />
                                </div>
                                <div className="form-group">
                                    <label>Assigned Teacher</label>
                                    <select className="admin-select" value={editCourse.teacherId} onChange={e => handleEditFormChange('teacherId', e.target.value)}>
                                        <option value="">Select a Teacher</option>
                                        {teachers.map(t => <option key={t.ID} value={t.ID}>{t.Name}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Course Status</label>
                                    <select className="admin-select" value={editCourse.status} onChange={e => handleEditFormChange('status', e.target.value)}>
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </div>
                                <div className="form-group full-width">
                                    <label>Short Introduction</label>
                                    <input className="admin-input" value={editCourse.shortIntro} onChange={e => handleEditFormChange('shortIntro', e.target.value)} required />
                                </div>
                                <div className="form-group full-width">
                                    <label>Detailed Description</label>
                                    <textarea className="admin-textarea" value={editCourse.description} onChange={e => handleEditFormChange('description', e.target.value)} required></textarea>
                                </div>
                                
                                {/* Learning Outcomes */}
                                <div className="form-group full-width">
                                    <label>Learning Outcomes (What will I learn?)</label>
                                    <div className="learning-outcomes-builder">
                                        {editCourse.whatWillILearn.map((outcome, idx) => (
                                            <div key={idx} className="outcome-input-flex mb-2">
                                                <input 
                                                    className="admin-input" 
                                                    value={outcome} 
                                                    onChange={e => handleEditLearningOutcomeChange(idx, e.target.value)}
                                                    placeholder={`Outcome ${idx + 1}`}
                                                />
                                            </div>
                                        ))}
                                        <button type="button" className="btn btn-secondary btn-sm mt-2" onClick={addEditLearningOutcome}>+ Add More</button>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Thumbnail URL</label>
                                    <input className="admin-input" value={editCourse.thumbnail} onChange={e => handleEditFormChange('thumbnail', e.target.value)} />
                                </div>
                                <div className="form-group">
                                    <label>Duration (e.g. 8 Weeks)</label>
                                    <input className="admin-input" value={editCourse.duration} onChange={e => handleEditFormChange('duration', e.target.value)} />
                                </div>
                            </div>
                            
                            <div className="form-actions mt-8">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)}>Discard Changes</button>
                                <button type="submit" className="btn btn-primary" disabled={submitting}>
                                    {submitting ? 'Saving...' : 'Save All Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
