import React, { useState, useEffect } from 'react';
import './CourseDetails.css';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
    Play, FileText, CheckCircle, Clock, ChevronRight,
    Star, Users, Shield, Award, Calendar, Share2, Heart,
    BookOpen, Target, Info
} from 'lucide-react';
import FAQSection from '../components/Home/FAQSection';
import ContactSection from '../components/Home/ContactSection';

const Loader = () => (
    <div className="loader-container">
        <div className="spinner"></div>
    </div>
);

const CourseDetails = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeModule, setActiveModule] = useState(null);

    useEffect(() => {
        const fetchCourseDetails = async () => {
            try {
                const response = await fetch(`http://localhost:3000/enrollment/classes/${slug}`);
                const data = await response.json();

                // Parse WhatWillILearn if it's a stringified JSON
                if (data.WhatWillILearn && typeof data.WhatWillILearn === 'string') {
                    try {
                        data.WhatWillILearn = JSON.parse(data.WhatWillILearn);
                    } catch (e) {
                        data.WhatWillILearn = data.WhatWillILearn.split('\n');
                    }
                }

                setCourse(data);
                if (data.Modules && data.Modules.length > 0) {
                    setActiveModule(data.Modules[0].ID);
                }
            } catch (err) {
                console.error('Failed to fetch course:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchCourseDetails();
        window.scrollTo(0, 0);
    }, [slug]);

    if (loading) return <Loader />;
    if (!course) return <div className="container py-20 text-center"><h2>Course not found</h2><Link to="/courses" className="btn btn-primary mt-4">Back to Courses</Link></div>;

    return (
        <div className="course-details-page">
            {/* Header / Hero Section */}
            <div className="course-hero">
                <div className="container">
                    <div className="breadcrumb-white">
                        <Link to="/">Home</Link> <ChevronRight size={14} />
                        <Link to="/courses">Courses</Link> <ChevronRight size={14} />
                        <span>{course.Name}</span>
                    </div>

                    <div className="hero-grid">
                        <div className="hero-content-main">
                            <div className="category-tag">Featured Course</div>
                            <h1 className="course-title-main">{course.Name}</h1>
                            <p className="course-short-intro">{course.ShortIntro}</p>

                            <div className="course-meta-strip">
                                <div className="meta-item">
                                    <div className="rating-stars">
                                        {[1, 2, 3, 4, 5].map(i => (
                                            <Star key={i} size={16} fill={i <= Math.floor(course.AverageRating) ? "#ffb100" : "none"} color={i <= Math.floor(course.AverageRating) ? "#ffb100" : "#fff"} />
                                        ))}
                                        <span className="rating-text">({course.AverageRating})</span>
                                    </div>
                                </div>
                                <div className="meta-item">
                                    <Users size={18} />
                                    <span>{course.EnrolledCount + (course.ReviewsCount * 3)}+ Students Enrolled</span>
                                </div>
                                <div className="meta-item">
                                    <Clock size={18} />
                                    <span>Last updated {new Date(course.CreatedAt).toLocaleDateString('en-GB', { weekday: 'long', day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                </div>
                            </div>

                            <div className="instructor-minimal">
                                <div className="instructor-avatar">
                                    {course.TeacherImage ? <img src={course.TeacherImage} alt={course.TeacherName} /> : course.TeacherName.charAt(0)}
                                </div>
                                <div className="instructor-info">
                                    <span>Instructor</span>
                                    <strong>{course.TeacherName}</strong>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container">
                <div className="course-main-layout-v2">
                    {/* Main Content Area */}
                    <div className="content-area">
                        {/* What you'll learn */}
                        <div className="learning-outcomes-box glass">
                            <h3>What you'll learn</h3>
                            <div className="outcomes-grid">
                                {Array.isArray(course.WhatWillILearn) && course.WhatWillILearn.map((item, idx) => (
                                    <div key={idx} className="outcome-item">
                                        <CheckCircle size={18} className="text-primary" />
                                        <span>{item}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Curriculum Section */}
                        <div className="course-section-box">
                            <div className="flex-between mb-6">
                                <h3>Course Content</h3>
                                <span className="text-muted">{course.Modules?.length || 0} Modules • {course.TotalLessons || 0} Lessons</span>
                            </div>
                            <div className="curriculum-accordion">
                                {course.Modules?.map((module, index) => (
                                    <div key={module.ID} className={`module-item ${activeModule === module.ID ? 'active' : ''}`}>
                                        <div className="module-header" onClick={() => setActiveModule(activeModule === module.ID ? null : module.ID)}>
                                            <div className="module-title-box">
                                                <span className="module-index">Module {index + 1}</span>
                                                <h4>{module.Title}</h4>
                                            </div>
                                            <ChevronRight size={20} className="accordion-chevron" />
                                        </div>
                                        {activeModule === module.ID && (
                                            <div className="module-body animate-slide-down">
                                                <p>{module.Description}</p>
                                                <div className="lesson-mini">
                                                    <Play size={14} /> <span>Lesson 1: Introduction to {module.Title}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Description */}
                        <div className="course-section-box">
                            <h3>Description</h3>
                            <div className="rich-description">
                                {course.Description}
                            </div>
                        </div>

                        {/* Prerequisites & Audience */}
                        <div className="grid-2-col mt-12">
                            <div className="info-card">
                                <div className="card-icon-box"><Shield size={20} /></div>
                                <h4>Requirements</h4>
                                <p>{course.Prerequisites}</p>
                            </div>
                            <div className="info-card">
                                <div className="card-icon-box"><Target size={20} /></div>
                                <h4>Target Audience</h4>
                                <p>{course.TargetAudience}</p>
                            </div>
                        </div>
                    </div>

                    {/* Sticky Sidebar */}
                    <aside className="course-sidebar-v2">
                        <div className="sidebar-sticky-inner">
                            <div className="course-preview-card glass">
                                <div className="preview-image-box">
                                    <img src={course.Thumbnail || "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=800"} alt={course.Name} />
                                    {/* <div className="play-overlay">
                                        <div className="play-btn-circle"><Play fill="white" /></div>
                                        <span>Preview Course</span>
                                    </div> */}
                                </div>

                                <div className="sidebar-pricing-box">
                                    <div className="price-row">
                                        <span className="price-main">${course.Fee}</span>
                                        {course.OriginalFee > 0 && <span className="price-old">${Number(course.OriginalFee).toFixed(2)}</span>}
                                    </div>
                                    {course.OfferExpiryDate && new Date(course.OfferExpiryDate) > new Date() && (
                                        <p className="price-notice">
                                            Limited time offer • {
                                                Math.ceil((new Date(course.OfferExpiryDate) - new Date()) / (1000 * 60 * 60 * 24)) === 1
                                                    ? 'Last day left!'
                                                    : `${Math.ceil((new Date(course.OfferExpiryDate) - new Date()) / (1000 * 60 * 60 * 24))} days left!`
                                            }
                                        </p>
                                    )}

                                    <div className="action-buttons">
                                        <button className="btn btn-primary btn-full-width" onClick={() => navigate('/courses')} style={{ fontWeight: 400, textTransform: 'none', marginTop: '15px' }}>
                                            Enroll Now
                                        </button>
                                        <button className="btn btn-outline btn-full-width" style={{ fontWeight: 400, textTransform: 'none', marginTop: '15px' }}>
                                            <Heart size={18} /> Add to Wishlist
                                        </button>
                                    </div>

                                    <div className="sidebar-features-list">
                                        <div className="feature-item">
                                            <Calendar size={18} />
                                            <span>Full Lifetime Access</span>
                                        </div>
                                        <div className="feature-item">
                                            <BookOpen size={18} />
                                            <span>{course.TotalLessons} Lessons</span>
                                        </div>
                                        <div className="feature-item">
                                            <Award size={18} />
                                            <span>Certificate of Completion</span>
                                        </div>
                                        <div className="feature-item">
                                            <Share2 size={18} />
                                            <span>Share with Friends</span>
                                        </div>
                                    </div>

                                    <div className="guarantee-text">
                                        <Info size={14} /> 30-Day Money-Back Guarantee
                                    </div>
                                </div>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>

            <div className="mt-20">
                <ContactSection />
                <FAQSection />
            </div>
        </div>
    );
};

export default CourseDetails;

