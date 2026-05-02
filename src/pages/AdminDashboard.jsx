import React, { useState, useEffect } from 'react';
import {
    Users, CheckCircle, XCircle, Eye, DollarSign, LayoutDashboard,
    BookOpen, PlusCircle, UserCheck, TrendingUp, Search, Bell, Book
} from 'lucide-react';
import FloatingLabelInput from '../components/FloatingLabelInput';

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

    // New Course Form
    const [courseForm, setCourseForm] = useState({ name: '', fee: '', description: '', teacherId: '' });

    useEffect(() => {
        fetchStats();
        fetchTabContent();
    }, [activeTab]);

    const fetchStats = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:3000/admin/stats', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            setStats(data);
        } catch (err) { console.error(err); }
    };

    const fetchTabContent = async () => {
        setLoading(true);
        const token = localStorage.getItem('token');
        const headers = { 'Authorization': `Bearer ${token}` };

        // Artificial delay to show skeletons (optional but good for demo)
        // await new Promise(r => setTimeout(r, 800));

        try {
            if (activeTab === 'enrollments') {
                const res = await fetch('http://localhost:3000/enrollment/admin/pending', { headers });
                setEnrollments(await res.json());
            } else if (activeTab === 'teachers' || activeTab === 'courses' || activeTab === 'add-course') {
                const res = await fetch('http://localhost:3000/admin/users?role=Teacher', { headers });
                setTeachers(await res.json());
            } 
            
            if (activeTab === 'students') {
                const res = await fetch('http://localhost:3000/admin/users?role=Student', { headers });
                setStudents(await res.json());
            } else if (activeTab === 'courses') {
                const res = await fetch('http://localhost:3000/admin/classes', { headers });
                setClasses(await res.json());
            }
        } catch (err) { console.error(err); }
        setLoading(false);
    };

    const handleStatusUpdate = async (userId, status) => {
        setSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`http://localhost:3000/admin/users/${userId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status })
            });
            if (res.ok) {
                await fetchTabContent();
            }
        } catch (err) { console.error(err); }
        setSubmitting(false);
    };

    const handleApproveEnrollment = async (id) => {
        setSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`http://localhost:3000/enrollment/admin/approve/${id}`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                await fetchTabContent();
            }
        } catch (err) { console.error(err); }
        setSubmitting(false);
    };

    const handleCreateCourse = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:3000/admin/classes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(courseForm)
            });
            if (res.ok) {
                setCourseForm({ name: '', fee: '', description: '', teacherId: '' });
                setActiveTab('courses');
                await fetchTabContent();
            }
        } catch (err) { console.error(err); }
        setSubmitting(false);
    };

    const handleUpdateCourse = async (courseId, status, teacherId) => {
        setSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`http://localhost:3000/admin/courses/${courseId}/update`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status, teacherId })
            });
            if (res.ok) {
                fetchTabContent();
            }
        } catch (err) { console.error(err); }
        setSubmitting(false);
    };

    return (
        <div className="admin-layout animate-fade-in">
            {/* Sidebar */}
            <aside className="admin-sidebar">
                <div className="sidebar-header">
                    <div className="logo-icon" style={{ fontSize: '1.5rem' }}>🎓</div>
                    <h3>LMS<span className="text-primary">Admin</span></h3>
                </div>

                <nav className="sidebar-nav">
                    <button className={activeTab === 'overview' ? 'active' : ''} onClick={() => setActiveTab('overview')}>
                        <TrendingUp size={20} /> Dashboard
                    </button>
                    <button className={activeTab === 'enrollments' ? 'active' : ''} onClick={() => setActiveTab('enrollments')}>
                        <DollarSign size={20} /> Enrollments
                        {stats.pendingEnrollments > 0 && <span>{stats.pendingEnrollments}</span>}
                    </button>
                    <button className={activeTab === 'teachers' ? 'active' : ''} onClick={() => setActiveTab('teachers')}>
                        <Users size={20} /> Teachers
                    </button>
                    <button className={activeTab === 'students' ? 'active' : ''} onClick={() => setActiveTab('students')}>
                        <UserCheck size={20} /> Students
                    </button>
                    <button className={activeTab === 'courses' ? 'active' : ''} onClick={() => setActiveTab('courses')}>
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
                            <div className="stats-grid mb-12">
                                {[1, 2, 3, 4].map(i => (
                                    loading ? (
                                        <div key={i} className="stat-card skeleton skeleton-card"></div>
                                    ) : (
                                        <div key={i} className="stat-card">
                                            <div className={`stat-icon ${i === 1 ? 'purple' : i === 2 ? 'blue' : i === 3 ? 'green' : 'orange'}`}>
                                                {i === 1 ? <Users size={28} /> : i === 2 ? <UserCheck size={28} /> : i === 3 ? <TrendingUp size={28} /> : <DollarSign size={28} />}
                                            </div>
                                            <div className="stat-info">
                                                <p>{i === 1 ? 'Total Users' : i === 2 ? 'Students' : i === 3 ? 'Teachers' : 'Pending Apps'}</p>
                                                <h3>{i === 1 ? stats.totalUsers : i === 2 ? stats.totalStudents : i === 3 ? stats.totalTeachers : stats.pendingEnrollments}</h3>
                                            </div>
                                        </div>
                                    )
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
                                    <div className="p-8 space-y-4">
                                        {[1, 2, 3, 4, 5].map(i => <div key={i} className="skeleton skeleton-table-row"></div>)}
                                    </div>
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
                                    <div className="p-8 space-y-4">
                                        {[1, 2, 3, 4, 5].map(i => <div key={i} className="skeleton skeleton-table-row"></div>)}
                                    </div>
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
                                    [1, 2, 3].map(i => <div key={i} className="course-admin-card skeleton" style={{ height: '240px' }}></div>)
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
                                            <select 
                                                value={cls.TeacherID || ''} 
                                                onChange={(e) => handleUpdateCourse(cls.ID, cls.Status, e.target.value)}
                                                className="teacher-select-mini"
                                            >
                                                <option value="">No Teacher Assigned</option>
                                                {teachers.map(t => (
                                                    <option key={t.ID} value={t.ID}>{t.Name}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="course-card-footer">
                                            <span className="price">${cls.Fee}</span>
                                            <span className="teacher-badge">{cls.TeacherName || 'No Teacher'}</span>
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

                                <form onSubmit={handleCreateCourse}>
                                    <div className="form-grid">
                                        <FloatingLabelInput
                                            label="Course Name"
                                            icon={Book}
                                            value={courseForm.name}
                                            onChange={e => setCourseForm({ ...courseForm, name: e.target.value })}
                                            required
                                        />
                                        <FloatingLabelInput
                                            label="Fee Amount ($)"
                                            type="number"
                                            icon={DollarSign}
                                            value={courseForm.fee}
                                            onChange={e => setCourseForm({ ...courseForm, fee: e.target.value })}
                                            required
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
                                        <div className="full-width">
                                            <textarea
                                                className="admin-textarea"
                                                placeholder="Extended Description & Curriculum"
                                                rows="5"
                                                value={courseForm.description}
                                                onChange={e => setCourseForm({ ...courseForm, description: e.target.value })}
                                            ></textarea>
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
        </div>
    );
};

export default AdminDashboard;
