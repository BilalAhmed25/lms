import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    Play, FileText, Clock, CheckCircle, ChevronRight, 
    MessageSquare, Award, Download, ExternalLink, AlertCircle,
    Check, X, ArrowLeft, Bell, BookOpen
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';
import SEO from '../components/SEO';
import Skeleton from '../components/Skeleton';

const Loader = () => (
    <div className="loader-container">
        <div className="spinner"></div>
    </div>
);

const CourseClassroom = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [sessions, setSessions] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [resources, setResources] = useState([]);
    const [announcements, setAnnouncements] = useState([]);
    const [submissions, setSubmissions] = useState([]);
    const [activeTab, setActiveTab] = useState('overview');
    const [loading, setLoading] = useState(true);
    const [submitModal, setSubmitModal] = useState(null); // stores the assignment object
    const [submitting, setSubmitting] = useState(false);
    
    // Form states for submission
    const [textResponse, setTextResponse] = useState('');
    const [fileBase64, setFileBase64] = useState('');
    const [quizAnswers, setQuizAnswers] = useState({});
    const [timeLeft, setTimeLeft] = useState(null);
    const [timerActive, setTimerActive] = useState(false);

    useEffect(() => {
        fetchClassroomData();
    }, [slug]);

    const fetchClassroomData = async () => {
        setLoading(true);
        try {
            const courseData = await api.get(`/enrollment/classes/${slug}`);
            setCourse(courseData);
            
            const [sessionsData, assignmentsData, resourcesData, announcementsData, mySubmissions] = await Promise.all([
                api.get(`/lms/sessions/${courseData.ID}`),
                api.get(`/lms/assignments/${courseData.ID}`),
                api.get(`/lms/resources/${courseData.ID}`),
                api.get(`/lms/announcements/${courseData.ID}`),
                api.get(`/lms/my-submissions/${courseData.ID}`)
            ]);
            
            setSessions(sessionsData);
            setAssignments(assignmentsData.map(a => ({
                ...a,
                Questions: typeof a.Questions === 'string' ? JSON.parse(a.Questions) : a.Questions
            })));
            setResources(resourcesData);
            setAnnouncements(announcementsData);
            setSubmissions(mySubmissions);
        } catch (err) {
            console.error(err);
            navigate('/student-dashboard');
        }
        setLoading(false);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setFileBase64(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleSubmitWork = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const payload = {
                assignmentId: submitModal.ID,
                textResponse,
                fileURL: fileBase64,
                answers: quizAnswers
            };
            await api.post('/lms/submissions', payload);
            setSubmitModal(null);
            setTextResponse('');
            setFileBase64('');
            setQuizAnswers({});
            // Refresh logic here if needed
            fetchClassroomData();
            toast.success('Your work has been submitted successfully!');
        } catch (err) {
            toast.error('Submission failed. Please try again.');
        }
        setSubmitting(false);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-GB', {
            weekday: 'short', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
        });
    };

    useEffect(() => {
        let interval;
        if (timerActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
        } else if (timeLeft === 0 && timerActive) {
            setTimerActive(false);
            handleSubmitWork(new Event('submit'));
            toast.error('Time is up! Your quiz has been submitted automatically.');
        }
        return () => clearInterval(interval);
    }, [timerActive, timeLeft]);

    const startQuiz = (assignment) => {
        setSubmitModal(assignment);
        if (assignment.TimeLimitMinutes > 0) {
            setTimeLeft(assignment.TimeLimitMinutes * 60);
            setTimerActive(true);
        }
    };

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    if (loading) return <Loader />;

    return (
        <div className="classroom-layout animate-fade-in">
            <SEO title={`${course?.Name} | Classroom`} />
            
            {/* Classroom Sidebar */}
            <aside className="classroom-sidebar">
                <button className="back-btn" onClick={() => navigate('/student-dashboard')}>
                    <ArrowLeft size={18} /> Back to Dashboard
                </button>
                
                <div className="course-mini-info">
                    <img src={course?.Thumbnail} alt={course?.Name} />
                    <h3>{course?.Name}</h3>
                    <p>{course?.TeacherName}</p>
                </div>

                <nav className="classroom-nav">
                    <button className={activeTab === 'overview' ? 'active' : ''} onClick={() => setActiveTab('overview')}>
                        <FileText size={18} /> Overview
                    </button>
                    <button className={activeTab === 'announcements' ? 'active' : ''} onClick={() => setActiveTab('announcements')}>
                        <Bell size={18} /> Announcements
                        {announcements.length > 0 && <span className="nav-badge">{announcements.length}</span>}
                    </button>
                    <button className={activeTab === 'sessions' ? 'active' : ''} onClick={() => setActiveTab('sessions')}>
                        <Play size={18} /> Class Sessions
                    </button>
                    <button className={activeTab === 'resources' ? 'active' : ''} onClick={() => setActiveTab('resources')}>
                        <BookOpen size={18} /> Resources
                    </button>
                    <button className={activeTab === 'assignments' ? 'active' : ''} onClick={() => setActiveTab('assignments')}>
                        <Award size={18} /> Assignments & Quizzes
                    </button>
                </nav>
            </aside>

            {/* Main Content Area */}
            <main className="classroom-main">
                <header className="classroom-header">
                    <div className="welcome-box">
                        <h1>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h1>
                        <p>Welcome back to your learning space.</p>
                    </div>
                </header>

                <div className="classroom-content">
                    {activeTab === 'overview' && (
                        <div className="animate-slide-up">
                            <div className="overview-grid">
                                <div className="overview-main">
                                    <section className="classroom-section">
                                        <h3>About this Course</h3>
                                        <p>{course?.Description}</p>
                                    </section>
                                    
                                    <section className="classroom-section mt-8">
                                        <h3>Next Live Session</h3>
                                        {sessions.find(s => s.Status === 'upcoming') ? (
                                            <div className="next-session-card glass">
                                                <div className="session-time-badge">
                                                    <Clock size={16} /> {formatDate(sessions.find(s => s.Status === 'upcoming').SessionDate)}
                                                </div>
                                                <h4>{sessions.find(s => s.Status === 'upcoming').Title}</h4>
                                                <p>{sessions.find(s => s.Status === 'upcoming').Description}</p>
                                                <a href={sessions.find(s => s.Status === 'upcoming').ZoomLink} target="_blank" rel="noreferrer" className="btn btn-primary mt-4">
                                                    <ExternalLink size={18} /> Join Zoom Meeting
                                                </a>
                                            </div>
                                        ) : (
                                            <div className="empty-mini-state">
                                                <AlertCircle size={24} />
                                                <p>No upcoming sessions scheduled yet.</p>
                                            </div>
                                        )}
                                    </section>
                                </div>
                                
                                <div className="overview-side">
                                    <div className="classroom-stats-card glass">
                                        <div className="c-stat">
                                            <div className="stat-icon-circle purple">
                                                <Play size={20} />
                                            </div>
                                            <div className="c-stat-info">
                                                <strong>{sessions.length}</strong>
                                                <span>Sessions</span>
                                            </div>
                                        </div>
                                        <div className="c-stat">
                                            <div className="stat-icon-circle blue">
                                                <Award size={20} />
                                            </div>
                                            <div className="c-stat-info">
                                                <strong>{assignments.length}</strong>
                                                <span>Assignments</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'sessions' && (
                        <div className="animate-slide-up">
                            <div className="sessions-timeline">
                                {sessions.length > 0 ? sessions.map((session, idx) => (
                                    <div key={session.ID} className={`session-timeline-item ${session.Status}`}>
                                        <div className="session-number">Session {idx + 1}</div>
                                        <div className="session-content glass">
                                            <div className="session-header-flex">
                                                <h4>{session.Title}</h4>
                                                <span className={`status-tag ${session.Status}`}>{session.Status}</span>
                                            </div>
                                            <p className="session-date">{formatDate(session.SessionDate)} • {session.DurationMinutes} mins</p>
                                            <p className="session-desc">{session.Description}</p>
                                            
                                            {session.Status === 'upcoming' || session.Status === 'live' ? (
                                                <a href={session.ZoomLink} target="_blank" rel="noreferrer" className="session-action-btn">
                                                    Join Class <ChevronRight size={16} />
                                                </a>
                                            ) : session.RecordingUrl ? (
                                                <a href={session.RecordingUrl} target="_blank" rel="noreferrer" className="session-action-btn secondary">
                                                    Watch Recording <Play size={16} />
                                                </a>
                                            ) : null}
                                        </div>
                                    </div>
                                )) : (
                                    <div className="admin-empty-state">
                                        <div className="empty-state-icon"><Play size={40} /></div>
                                        <p>No class sessions have been scheduled yet.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'announcements' && (
                        <div className="animate-slide-up">
                            <div className="announcements-stack">
                                {announcements.length > 0 ? announcements.map(ann => (
                                    <div key={ann.ID} className="announcement-card glass">
                                        <div className="ann-header">
                                            <div className="ann-author">
                                                <div className="author-avatar">{ann.AuthorName?.charAt(0)}</div>
                                                <div>
                                                    <strong>{ann.AuthorName}</strong>
                                                    <span>{new Date(ann.CreatedAt).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <h4>{ann.Title}</h4>
                                        <p>{ann.Content}</p>
                                    </div>
                                )) : (
                                    <div className="admin-empty-state">
                                        <div className="empty-state-icon"><Bell size={40} /></div>
                                        <p>No announcements yet.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'resources' && (
                        <div className="animate-slide-up">
                            <div className="resources-grid">
                                {resources.length > 0 ? resources.map(res => (
                                    <div key={res.ID} className="resource-item-card glass">
                                        <div className="resource-icon-box">
                                            <FileText size={24} />
                                        </div>
                                        <div className="resource-details">
                                            <h4>{res.Title}</h4>
                                            <p>{res.Description}</p>
                                            <div className="resource-meta">
                                                <span>{res.FileType || 'PDF'}</span>
                                                <span>{new Date(res.CreatedAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                        <a href={res.FileURL} target="_blank" rel="noreferrer" className="btn-icon-only">
                                            <Download size={20} />
                                        </a>
                                    </div>
                                )) : (
                                    <div className="admin-empty-state">
                                        <div className="empty-state-icon"><BookOpen size={40} /></div>
                                        <p>No resources uploaded for this course.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'assignments' && (
                        <div className="animate-slide-up">
                            <div className="assignments-grid">
                                {assignments.length > 0 ? assignments.map(assignment => (
                                    <div key={assignment.ID} className="assignment-card glass">
                                        <div className="card-top">
                                            <div className={`type-icon ${assignment.Type}`}>
                                                {assignment.Type === 'quiz' ? <MessageSquare size={20} /> : <FileText size={20} />}
                                            </div>
                                            <div className="due-info">
                                                <span>Due Date</span>
                                                <strong>{new Date(assignment.DueDate).toLocaleDateString()}</strong>
                                            </div>
                                        </div>
                                        
                                        <h4>{assignment.Title}</h4>
                                        <p>{assignment.Description}</p>
                                        
                                        <div className="assignment-meta">
                                            <span>Max Marks: {assignment.MaxMarks}</span>
                                            {assignment.TimeLimitMinutes > 0 && <span>Time: {assignment.TimeLimitMinutes}m</span>}
                                        </div>

                                        <div className="card-actions mt-auto">
                                            {assignment.FileURL && (
                                                <a href={assignment.FileURL} target="_blank" rel="noreferrer" className="btn-download">
                                                    <Download size={16} /> Download File
                                                </a>
                                            )}
                                            
                                            {(() => {
                                                const sub = submissions.find(s => s.AssignmentID === assignment.ID);
                                                if (sub) {
                                                    return (
                                                        <div className="submission-status-chip">
                                                            {sub.Status === 'graded' ? (
                                                                <span className="badge badge-success flex items-center gap-1">
                                                                    <Award size={14} /> Graded: {sub.Marks}/{assignment.MaxMarks}
                                                                </span>
                                                            ) : (
                                                                <span className="badge badge-info flex items-center gap-1">
                                                                    <CheckCircle size={14} /> Submitted
                                                                </span>
                                                            )}
                                                        </div>
                                                    );
                                                }
                                                return (
                                                    <button className="btn btn-primary" onClick={() => startQuiz(assignment)}>
                                                        {assignment.Type === 'quiz' ? 'Start Quiz' : 'Submit Work'}
                                                    </button>
                                                );
                                            })()}
                                        </div>
                                    </div>
                                )) : (
                                    <div className="admin-empty-state">
                                        <div className="empty-state-icon"><Award size={40} /></div>
                                        <p>No assignments or quizzes available for this course.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* Submission / Quiz Modal */}
            {submitModal && (
                <div className="modal-overlay" onClick={() => setSubmitModal(null)}>
                    <div className="modal-content classroom-modal animate-scale-up" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <div>
                                <span className="type-badge">{submitModal.Type}</span>
                                <h2>{submitModal.Title}</h2>
                                {timerActive && (
                                    <div className="quiz-timer-bubble">
                                        <Clock size={16} /> {formatTime(timeLeft)}
                                    </div>
                                )}
                            </div>
                            {!timerActive && <button className="btn-close" onClick={() => setSubmitModal(null)}><X size={24} /></button>}
                        </div>

                        {submitModal.Type === 'quiz' && (
                            <div className="quiz-progress-bar">
                                <div 
                                    className="fill" 
                                    style={{ width: `${(Object.keys(quizAnswers).length / submitModal.Questions.length) * 100}%` }}
                                ></div>
                            </div>
                        )}

                        <form onSubmit={handleSubmitWork} className="submission-form">
                            {submitModal.Type === 'quiz' ? (
                                <div className="quiz-interface">
                                    {(submitModal.Questions || []).map((q, qIdx) => (
                                        <div key={qIdx} className="quiz-question-box">
                                            <p className="q-text"><strong>Q{qIdx + 1}:</strong> {q.text}</p>
                                            
                                            {q.type === 'mcq' ? (
                                                <div className="options-grid">
                                                    {q.options.map((opt, oIdx) => (
                                                        <label key={oIdx} className={`option-label ${quizAnswers[qIdx] === opt ? 'selected' : ''}`}>
                                                            <input 
                                                                type="radio" 
                                                                name={`q-${qIdx}`} 
                                                                value={opt}
                                                                onChange={() => setQuizAnswers({...quizAnswers, [qIdx]: opt})}
                                                            />
                                                            <span className="radio-custom"></span>
                                                            {opt}
                                                        </label>
                                                    ))}
                                                </div>
                                            ) : (
                                                <textarea 
                                                    className="admin-textarea"
                                                    placeholder="Type your answer here..."
                                                    rows="3"
                                                    value={quizAnswers[qIdx] || ''}
                                                    onChange={(e) => setQuizAnswers({...quizAnswers, [qIdx]: e.target.value})}
                                                ></textarea>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="assignment-submission-fields">
                                    <div className="form-group">
                                        <label>Response / Comments</label>
                                        <textarea 
                                            className="admin-textarea"
                                            rows="6"
                                            placeholder="Type your response or comments for the teacher..."
                                            value={textResponse}
                                            onChange={e => setTextResponse(e.target.value)}
                                        ></textarea>
                                    </div>
                                    
                                    <div className="form-group mt-6">
                                        <label>Attachment (if required)</label>
                                        <div className="file-upload-box">
                                            <input type="file" id="file-sub" onChange={handleFileChange} />
                                            <label htmlFor="file-sub">
                                                <Download size={24} />
                                                <span>{fileBase64 ? "File Selected" : "Click to upload your work (PDF, Image, etc.)"}</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="modal-footer mt-8">
                                <button type="button" className="btn btn-secondary" onClick={() => setSubmitModal(null)}>Cancel</button>
                                <button type="submit" className="btn btn-primary" disabled={submitting}>
                                    {submitting ? 'Submitting...' : 'Confirm Submission'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CourseClassroom;
