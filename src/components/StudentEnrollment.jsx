import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
    CreditCard, Upload, CheckCircle, Search, DollarSign,
    ChevronLeft, Banknote, ShieldCheck, ArrowRight,
    PlayCircle, Award, FileCheck, FileText, Star, Users
} from 'lucide-react';
import api from '../utils/api';
import './StudentEnrollment.css';

const StudentEnrollment = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const courseSlug = searchParams.get('course');
    const [classes, setClasses] = useState([]);
    const [selectedClass, setSelectedClass] = useState(null);
    const [receipt, setReceipt] = useState(null);
    const [receiptType, setReceiptType] = useState(null);
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [enrollmentDate, setEnrollmentDate] = useState(null);

    useEffect(() => {
        fetchClasses();
    }, []);

    const formatRelativeTime = (dateString) => {
        if (!dateString) return 'Just now';
        const now = new Date();
        const past = new Date(dateString);
        const diffInMs = now - past;
        const diffInMins = Math.floor(diffInMs / (1000 * 60));
        const diffInHours = Math.floor(diffInMins / 60);
        const diffInDays = Math.floor(diffInHours / 24);

        if (diffInMins < 1) return 'Just now';
        if (diffInMins < 60) return `${diffInMins} minute${diffInMins > 1 ? 's' : ''} ago`;
        if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
        return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    };

    const fetchClasses = async () => {
        try {
            const data = await api.get('/enrollment/classes');
            setClasses(data);

            if (courseSlug) {
                const found = data.find(c => c.Slug === courseSlug);
                if (found) {
                    setSelectedClass(found);
                    // Check if already enrolled or pending
                    try {
                        const statusData = await api.get(`/enrollment/status/${found.ID}`);
                        if (statusData?.Status === 'pending') {
                            setEnrollmentDate(statusData.CreatedAt);
                            setStep(3);
                        } else if (statusData?.Status === 'approved') {
                            navigate('/student-dashboard');
                        } else {
                            setStep(2);
                        }
                    } catch (e) {
                        setStep(2);
                    }
                }
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setReceiptType(file.type);
            const reader = new FileReader();
            reader.onloadend = () => {
                setReceipt(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const checkStatusAndProceed = async () => {
        if (!selectedClass) return;
        setLoading(true);
        try {
            const statusData = await api.get(`/enrollment/status/${selectedClass.ID}`);
            if (statusData?.Status === 'pending') {
                setEnrollmentDate(statusData.CreatedAt);
                setStep(3);
            } else if (statusData?.Status === 'approved') {
                alert('You are already enrolled in this course.');
                navigate('/student-dashboard');
            } else {
                setStep(2);
            }
        } catch (err) {
            console.error('Check failed', err);
            setStep(2);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            await api.post('/enrollment/request', {
                classId: selectedClass.ID,
                amountPaid: selectedClass.Fee,
                receiptBase64: receipt
            });
            setEnrollmentDate(new Date().toISOString());
            setStep(3);
        } catch (err) {
            console.error(err);
            alert(err.message || 'Submission failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="enrollment-page animate-fade-in">
            <div className="container">
                <div className="enrollment-container glass">
                    {/* Progress Steps */}
                    <div className="enrollment-steps-v2">
                        <div className={`step-v2 ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
                            <div className="step-icon-circle">
                                {step > 1 ? <CheckCircle size={24} /> : <FileCheck size={24} />}
                            </div>
                            <span className="step-label">Select Course</span>
                        </div>
                        <div className={`step-line ${step > 1 ? 'completed' : ''}`}></div>
                        <div className={`step-v2 ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
                            <div className="step-icon-circle">
                                {step > 2 ? <CheckCircle size={24} /> : <Banknote size={24} />}
                            </div>
                            <span className="step-label">Payment</span>
                        </div>
                        <div className={`step-line ${step > 2 ? 'completed' : ''}`}></div>
                        <div className={`step-v2 ${step >= 3 ? 'active' : ''}`}>
                            <div className="step-icon-circle">
                                <ShieldCheck size={24} />
                            </div>
                            <span className="step-label">Verification</span>
                        </div>
                    </div>

                    {step === 1 && (
                        <div className="step-content-v2 animate-slide-up">
                            <h2>Choose Your Course</h2>
                            <p className="subtitle">Select the program that aligns with your goals and start your transformation today.</p>

                            <div className="classes-grid-v2">
                                {classes.map(cls => (
                                    <div
                                        key={cls.ID}
                                        className={`class-card-v2 ${selectedClass?.ID === cls.ID ? 'selected' : ''}`}
                                        onClick={() => setSelectedClass(cls)}
                                    >
                                        <div className="course-badge">{cls.ModulesCount} Modules</div>
                                        <h3>{cls.Name}</h3>
                                        <p className="course-short-intro-v2">{cls.ShortIntro}</p>

                                        <div className="card-footer-v2">
                                            <div className="teacher-info-v2">
                                                <div className="teacher-name-v2">
                                                    <Users size={14} />
                                                    <span>{cls.TeacherName}</span>
                                                </div>
                                                <div className="rating-info-v2">
                                                    <Star size={14} fill="var(--primary)" color="var(--primary)" />
                                                    <span>{cls.AverageRating} ({cls.ReviewsCount})</span>
                                                </div>
                                            </div>
                                            <div className="price-tag">${cls.Fee}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex-center mt-10">
                                <button
                                    className="btn btn-primary"
                                    disabled={!selectedClass || loading}
                                    onClick={checkStatusAndProceed}
                                    style={{ padding: '15px 40px', fontSize: '0.9rem', textTransform: 'none' }}
                                >
                                    {loading ? 'Checking Status...' : (
                                        <>Continue to Payment <ArrowRight size={20} style={{ marginLeft: '10px' }} /></>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="step-content-v2 animate-slide-up">
                            <div className="flex-between mb-8">
                                <button className="back-link-v2" onClick={() => setStep(1)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <ChevronLeft size={20} /> Back to Selection
                                </button>
                                <div className="selected-course-badge glass" style={{ padding: '8px 16px', borderRadius: '30px', fontSize: '0.9rem' }}>
                                    Enrolling in: <strong>{selectedClass?.Name}</strong>
                                </div>
                            </div>

                            <div className="payment-layout">
                                <div className="instruction-panel">
                                    <h3>Payment Instructions</h3>
                                    <p className="text-muted mt-2">Transfer the exact amount to the account below and upload your bank receipt.</p>

                                    <div className="bank-details-card">
                                        <div className="detail-row">
                                            <label>Account Holder</label>
                                            <span>Deenova Learning Hub</span>
                                        </div>
                                        <div className="detail-row">
                                            <label>Account Number</label>
                                            <span>1234-5678-9012</span>
                                        </div>
                                        <div className="detail-row">
                                            <label>Bank Name</label>
                                            <span>Standard Global Bank</span>
                                        </div>
                                        <div className="detail-row" style={{ border: 'none', marginTop: '10px' }}>
                                            <label>Payable Amount</label>
                                            <span style={{ fontSize: '1.5rem', color: 'var(--primary)' }}>${selectedClass?.Fee}</span>
                                        </div>
                                    </div>

                                    <div className="security-notice glass" style={{ display: 'flex', gap: '15px' }}>
                                        <ShieldCheck className="text-primary" />
                                        <p style={{ fontSize: '0.85rem' }}>Your transaction is secure and encrypted. Verification is manual for maximum security.</p>
                                    </div>
                                </div>

                                <div className="upload-panel">
                                    <input type="file" id="receipt-upload" hidden onChange={handleFileUpload} accept="image/*,application/pdf" />
                                    <label htmlFor="receipt-upload" className="modern-upload">
                                        {receipt ? (
                                            <div className="receipt-preview-v2">
                                                {receiptType?.includes('pdf') ? (
                                                    <div className="pdf-preview-box">
                                                        <FileText size={48} color="var(--primary)" />
                                                        <span className="mt-4 font-semibold">PDF Receipt Uploaded</span>
                                                    </div>
                                                ) : (
                                                    <img src={receipt} alt="Receipt" />
                                                )}
                                                <div className="preview-overlay">
                                                    <span>Change File</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="upload-placeholder">
                                                <Upload size={48} />
                                                <h4>Upload Receipt</h4>
                                                <p>Drag and drop or click to browse</p>
                                            </div>
                                        )}
                                    </label>

                                    <button
                                        className="btn btn-primary w-full mt-8"
                                        disabled={!receipt || loading}
                                        onClick={handleSubmit}
                                        style={{ fontWeight: 'normal', textTransform: 'none' }}
                                    >
                                        {loading ? 'Processing...' : 'Complete Enrollment'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="step-content-v2 success-card-v2 animate-slide-up">
                            <div className="success-blob">
                                <Award size={64} />
                            </div>
                            <h2>Application Received!</h2>
                            <p className="subtitle" style={{ marginBottom: '20px' }}>
                                Your enrollment request for <strong>{selectedClass?.Name}</strong> has been successfully submitted.
                            </p>

                            <div className="status-horizontal-v2 glass">
                                <div className="timeline-item" style={{ display: 'flex', gap: '15px', flexDirection: 'row', alignItems: 'center' }}>
                                    <CheckCircle size={24} className="text-success" />
                                    <div className="node-info">
                                        <h4>Request Submitted</h4>
                                        <span>{formatRelativeTime(enrollmentDate)}</span>
                                    </div>
                                </div>
                                <div className="status-arrow">
                                    <ArrowRight size={24} className="text-muted" />
                                </div>
                                <div className="status-node pending">
                                    <div className="node-icon-circle"></div>
                                    <div className="node-info">
                                        <h4>Admin Verification</h4>
                                        <span>Usually within 24 hours</span>
                                    </div>
                                </div>
                            </div>

                            <button className="btn btn-primary" onClick={() => navigate('/student-dashboard')} style={{ padding: '15px 40px' }}>
                                Go to My Dashboard
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StudentEnrollment;
