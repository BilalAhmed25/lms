import React, { useState, useEffect } from 'react';
import {
    Users, CheckCircle, XCircle, Pencil, Trash2, ChevronRight, AlertCircle, Star, Eye, DollarSign, LayoutDashboard,
    BookOpen, PlusCircle, UserCheck, TrendingUp, Search, Bell, Book,
    Image, Target, Award, Zap, Hash, Clock, FileText, AlignLeft, Info, Plus,
    Menu, X
} from 'lucide-react';
import toast from 'react-hot-toast';
import FloatingLabelInput from '../components/FloatingLabelInput';
import api from '../utils/api';
import SEO from '../components/SEO';
import Loader from '../components/Loader';
import Sidebar from '../components/Sidebar';
import DashboardHeader from '../components/DashboardHeader';
import Dropdown from '../components/Dropdown';
import Skeleton from '../components/Skeleton';
import '../styles/dashboard.css';
import '../styles/teacher-dashboard.css';
import '../styles/admin-dashboard.css';

// Loader is now imported from components

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
    const [editThumbnailPreview, setEditThumbnailPreview] = useState(null);

    const handleEditImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setEditCourse(prev => ({ ...prev, thumbnail: reader.result }));
                setEditThumbnailPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };
    const [editCourse, setEditCourse] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectingEnrollmentId, setRejectingEnrollmentId] = useState(null);
    const [rejectionForm, setRejectionForm] = useState({ reason: '', remarks: '' });

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

    const isModalOpen = !!selectedReceipt || showEditModal || showRejectModal;

    useEffect(() => {
        if (isModalOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isModalOpen]);

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
            toast.success('Enrollment approved successfully');
            await fetchTabContent();
        } catch (err) {
            toast.error('Approval failed');
        }
        setSubmitting(false);
    };

    const handleRejectEnrollment = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.put(`/enrollment/admin/reject/${rejectingEnrollmentId}`, rejectionForm);
            toast.success('Enrollment rejected');
            setShowRejectModal(false);
            setRejectionForm({ reason: '', remarks: '' });
            await fetchTabContent();
        } catch (err) {
            toast.error('Rejection failed');
        }
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
        setEditThumbnailPreview(course.Thumbnail);
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

        const handleDeleteCourse = async (courseId, studentCount) => {
        if (studentCount > 0) {
            toast.error("Cannot delete course with active enrollments.");
            return;
        }

        if (!window.confirm("Are you sure you want to delete this course? This action cannot be undone.")) return;

        try {
            await api.delete(`/admin/courses/${courseId}`);
            toast.success("Course deleted successfully!");
            fetchTabContent();
        } catch (err) {
            toast.error("Failed to delete course.");
        }
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

    const removeEditLearningOutcome = (index) => {
        const updatedOutcomes = editCourse.whatWillILearn.filter((_, i) => i !== index);
        setEditCourse(prev => ({ ...prev, whatWillILearn: updatedOutcomes }));
    };

    const getHeaderConfig = () => {
        switch (activeTab) {
            case 'overview':
                return {
                    tag: "Platform Overview",
                    title: "Welcome, Admin",
                    subtitle: "Here's what's happening with your platform today.",
                };
            case 'enrollments':
                return {
                    tag: "Financial Management",
                    title: "Pending Enrollments",
                    subtitle: "Review and approve student course applications.",
                };
            case 'teachers':
                return {
                    tag: "User Management",
                    title: "Faculty Directory",
                    subtitle: "Manage teacher accounts and access permissions.",
                };
            case 'students':
                return {
                    tag: "User Management",
                    title: "Student Directory",
                    subtitle: "Manage student accounts and enrollment status.",
                };
            case 'courses':
                return {
                    tag: "Academic Catalog",
                    title: "Course Management",
                    subtitle: "Create and update educational content on the platform.",
                    right: (
                        <button className="btn btn-primary" onClick={() => setActiveTab('add-course')}>
                            <Plus size={18} /> Create New Course
                        </button>
                    )
                };
            case 'add-course':
                return {
                    tag: "Content Creator",
                    title: "Add New Course",
                    subtitle: "Draft a new course for the Deenova catalog.",
                    right: (
                        <button className="btn btn-secondary" onClick={() => setActiveTab('courses')}>
                            Back to List
                        </button>
                    )
                };
            default:
                return { title: "Admin Portal", subtitle: "Management Console" };
        }
    };

    const headerConfig = getHeaderConfig();

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
            <Sidebar
                user={{ Name: 'Admin', Email: 'admin@deenova.edu' }}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                logout={() => window.location.href = '/'}
                menuItems={[
                    { id: 'overview', label: 'Dashboard', icon: TrendingUp },
                    { id: 'enrollments', label: 'Enrollments', icon: DollarSign, badge: stats.pendingEnrollments },
                    { id: 'teachers', label: 'Teachers', icon: Users },
                    { id: 'students', label: 'Students', icon: UserCheck },
                    { id: 'courses', label: 'Courses', icon: BookOpen },
                ]}
                mobileMenuOpen={mobileMenuOpen}
                setMobileMenuOpen={setMobileMenuOpen}
            />

            {/* Main Content */}
            <main className="admin-main">
                <DashboardHeader
                    left={
                        <div className="header-left-content">
                            <span className="header-badge-tag">{headerConfig.tag}</span>
                            <div className="header-titles">
                                <h1>{headerConfig.title}</h1>
                                <p>{headerConfig.subtitle}</p>
                            </div>
                        </div>
                    }
                    right={headerConfig.right}
                    user={{ Name: 'Admin' }}
                    searchPlaceholder="Search everything..."
                />

                <div className="admin-content">
                    {activeTab === 'overview' && (
                        <div className="animate-slide-up">
                            {loading ? (
                                <Loader fullPage={false} />
                            ) : (
                                <>
                                    <div className="stats-grid-v2 admin-stats mb-12">
                                        <div className="stat-card-v2 purple">
                                            <div className="stat-icon-wrapper">
                                                <Users size={28} />
                                            </div>
                                            <div className="stat-content">
                                                <span className="stat-label">Total Users</span>
                                                <h3 className="stat-value">{stats.totalUsers}</h3>
                                                <span className="stat-trend positive">
                                                    <TrendingUp size={14} /> Overall Growth
                                                </span>
                                            </div>
                                        </div>

                                        <div className="stat-card-v2 blue">
                                            <div className="stat-icon-wrapper">
                                                <UserCheck size={28} />
                                            </div>
                                            <div className="stat-content">
                                                <span className="stat-label">Total Students</span>
                                                <h3 className="stat-value">{stats.totalStudents}</h3>
                                                <span className="stat-trend positive">
                                                    <CheckCircle size={14} /> Active Learners
                                                </span>
                                            </div>
                                        </div>

                                        <div className="stat-card-v2 green">
                                            <div className="stat-icon-wrapper">
                                                <Users size={28} />
                                            </div>
                                            <div className="stat-content">
                                                <span className="stat-label">Total Teachers</span>
                                                <h3 className="stat-value">{stats.totalTeachers}</h3>
                                                <span className="stat-trend positive">
                                                    <Star size={14} /> Expert Educators
                                                </span>
                                            </div>
                                        </div>

                                        <div className="stat-card-v2 orange">
                                            <div className="stat-icon-wrapper">
                                                <Clock size={28} />
                                            </div>
                                            <div className="stat-content">
                                                <span className="stat-label">Pending Apps</span>
                                                <h3 className="stat-value">{stats.pendingEnrollments}</h3>
                                                <span className="stat-trend warning">
                                                    <AlertCircle size={14} /> Review Required
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="premium-action-grid mb-12">
                                        <button className="premium-action-tile purple" onClick={() => setActiveTab('add-course')}>
                                            <div className="action-icon-box">
                                                <PlusCircle size={28} />
                                            </div>
                                            <div className="action-info">
                                                <strong>Create New Course</strong>
                                                <span>Set up a new curriculum and assign teachers</span>
                                            </div>
                                            <ChevronRight size={20} className="action-arrow" />
                                        </button>

                                        <button className="premium-action-tile blue" onClick={() => setActiveTab('enrollments')}>
                                            <div className="action-icon-box">
                                                <DollarSign size={28} />
                                            </div>
                                            <div className="action-info">
                                                <strong>Review Fee Receipts</strong>
                                                <span>Verify pending student payments and approve enrollments</span>
                                            </div>
                                            <ChevronRight size={20} className="action-arrow" />
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {activeTab === 'enrollments' && (
                        <div className="animate-slide-up">
                            <div className="payments-table">
                                {loading ? (
                                    <Loader fullPage={false} />
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
                                                            <button className="btn-reject" onClick={() => { setRejectingEnrollmentId(req.ID); setShowRejectModal(true); }} disabled={submitting}><XCircle size={16} /></button>
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
                            <div className="payments-table">
                                {loading ? (
                                    <Loader fullPage={false} />
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
                                                    <td>{new Date(u.CreatedAt).toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}</td>
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
                            <div className="admin-course-grid">
                                {loading ? (
                                    <Loader fullPage={false} />
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
                                            <div className="stat-item students" title="Enrolled Students">
                                                <Users size={18} />
                                                <div className="stat-info">
                                                    <strong>{cls.StudentCount || 0}</strong>
                                                    <span className="stat-label">Students</span>
                                                </div>
                                            </div>
                                            <div className="stat-item lessons" title="Total Lessons">
                                                <PlusCircle size={18} />
                                                <div className="stat-info">
                                                    <strong>{cls.LessonCount || 0}</strong>
                                                    <span className="stat-label">Lessons</span>
                                                </div>
                                            </div>
                                            <div className="stat-item graded" title="Graded Items">
                                                <TrendingUp size={18} />
                                                <div className="stat-info">
                                                    <strong>{cls.GradedCount || 0}</strong>
                                                    <span className="stat-label">Graded</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="course-card-footer">
                                            <div className="teacher-info">
                                                <span>Instructor</span>
                                                <strong>{cls.TeacherName || 'Unassigned'}</strong>
                                            </div>
                                            <div className="card-actions">
                                                <button className="btn-icon" onClick={() => handleOpenEdit(cls)} title="Edit Course Details">
                                                    <Pencil size={18} />
                                                </button>
                                                <button className="btn-icon" title="View Detailed Stats"><TrendingUp size={18} /></button>
                                                <button className="btn-icon text-red-500 hover:bg-red-50" onClick={() => handleDeleteCourse(cls.ID, cls.StudentCount)} title="Delete Course">
                                                    <Trash2 size={18} />
                                                </button>
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
                                                    onChange={e => setCourseForm({ ...courseForm, teacherId: e.target.value })}
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
            {showEditModal && editCourse && (
                <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
                    <div className="modal-content animate-scale-up edit-course-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <div>
                                <span className="header-badge-tag">Editor Mode</span>
                                <h2 className="text-xl font-bold">Edit: {editCourse.name}</h2>
                            </div>
                            <button className="btn-close" onClick={() => setShowEditModal(false)}><X size={24} /></button>
                        </div>

                                                <form onSubmit={handleSaveEdit} className="modal-body">
                            <div className="form-grid">
                                <FloatingLabelInput
                                    label="Course Title"
                                    icon={Book}
                                    value={editCourse.name}
                                    onChange={e => handleEditFormChange('name', e.target.value)}
                                    required
                                />
                                <FloatingLabelInput
                                    label="Custom Slug"
                                    icon={Hash}
                                    value={editCourse.slug}
                                    onChange={e => handleEditFormChange('slug', e.target.value)}
                                    required
                                />
                                <FloatingLabelInput
                                    label="Sale Price (PKR)"
                                    type="number"
                                    icon={DollarSign}
                                    value={editCourse.fee}
                                    onChange={e => handleEditFormChange('fee', e.target.value)}
                                    required
                                />
                                <FloatingLabelInput
                                    label="Original Price"
                                    type="number"
                                    icon={Zap}
                                    value={editCourse.originalFee}
                                    onChange={e => handleEditFormChange('originalFee', e.target.value)}
                                />
                                <Dropdown
                                    label="Assigned Teacher"
                                    icon={UserCheck}
                                    options={teachers.map(t => ({ label: t.Name, value: t.ID }))}
                                    value={editCourse.teacherId}
                                    onChange={val => handleEditFormChange('teacherId', val)}
                                    searchable
                                />
                                <Dropdown
                                    label="Course Status"
                                    icon={Award}
                                    options={[
                                        { label: 'Active', value: 'active' },
                                        { label: 'Inactive', value: 'inactive' }
                                    ]}
                                    value={editCourse.status}
                                    onChange={val => handleEditFormChange('status', val)}
                                />
                                
                                <FloatingLabelInput
                                    label="Short Introduction"
                                    icon={AlignLeft}
                                    className="full-width"
                                    value={editCourse.shortIntro}
                                    onChange={e => handleEditFormChange('shortIntro', e.target.value)}
                                    required
                                />

                                <div className="full-width">
                                    <FloatingLabelInput
                                        label="Detailed Description"
                                        type="textarea"
                                        rows="5"
                                        value={editCourse.description}
                                        onChange={e => handleEditFormChange('description', e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="full-width">
                                    <label className="admin-label-small mb-3 block">Learning Outcomes</label>
                                    <div className="learning-outcomes-builder">
                                        {editCourse.whatWillILearn.map((outcome, idx) => (
                                            <div key={idx} className="outcome-input-flex">
                                                <input
                                                    className="admin-input"
                                                    value={outcome}
                                                    onChange={e => handleEditLearningOutcomeChange(idx, e.target.value)}
                                                    placeholder={`Outcome ${idx + 1}`}
                                                />
                                                <button type="button" className="btn-remove-outcome" onClick={() => removeEditLearningOutcome(idx)}>
                                                    <X size={18} />
                                                </button>
                                            </div>
                                        ))}
                                        <button type="button" className="btn btn-secondary btn-sm" style={{ width: 'fit-content' }} onClick={addEditLearningOutcome}>
                                            <Plus size={16} /> Add Another Outcome
                                        </button>
                                    </div>
                                </div>

                                <div className="admin-input-group full-width">
                                    <label>Course Thumbnail</label>
                                    <label className="image-uploader-wrapper">
                                        <input type="file" hidden accept="image/*" onChange={handleEditImageChange} />
                                        {editThumbnailPreview ? (
                                            <img src={editThumbnailPreview} alt="Preview" />
                                        ) : (
                                            <div className="upload-placeholder">
                                                <Image size={32} />
                                                <span>Click to upload image</span>
                                            </div>
                                        )}
                                    </label>
                                </div>
                                
                                <FloatingLabelInput
                                    label="Duration"
                                    icon={Clock}
                                    value={editCourse.duration}
                                    onChange={e => handleEditFormChange('duration', e.target.value)}
                                />
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
            {showRejectModal && (
                <div className="modal-overlay" onClick={() => setShowRejectModal(false)}>
                    <div className="modal-content animate-scale-up" style={{ maxWidth: '500px' }} onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Decline Enrollment</h2>
                            <button className="btn-close" onClick={() => setShowRejectModal(false)}><X size={24} /></button>
                        </div>
                        <form onSubmit={handleRejectEnrollment}>
                            <div className="form-group mb-4">
                                <label>Rejection Reason</label>
                                <select
                                    className="admin-select"
                                    value={rejectionForm.reason}
                                    onChange={e => setRejectionForm({ ...rejectionForm, reason: e.target.value })}
                                    required
                                >
                                    <option value="">Select a reason</option>
                                    <option value="Invalid Payment Proof">Invalid Payment Proof</option>
                                    <option value="Incomplete Information">Incomplete Information</option>
                                    <option value="Payment Not Received">Payment Not Received</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div className="form-group mb-6">
                                <label>Administrative Remarks (Optional)</label>
                                <textarea
                                    className="admin-textarea"
                                    rows="4"
                                    placeholder="This will be visible to the student..."
                                    value={rejectionForm.remarks}
                                    onChange={e => setRejectionForm({ ...rejectionForm, remarks: e.target.value })}
                                ></textarea>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowRejectModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-reject" disabled={submitting}>
                                    {submitting ? 'Processing...' : 'Confirm Decline'}
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
























