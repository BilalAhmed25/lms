import React, { useState, useEffect } from 'react';
import './CoursesSection.css';
import { Star, Clock, User } from 'lucide-react';
import { Link } from 'react-router-dom';

const CourseSkeleton = () => (
    <div className="course-card skeleton-card">
        <div className="course-image skeleton-pulse"></div>
        <div className="course-body">
            <div className="skeleton-price skeleton-pulse"></div>
            <div className="skeleton-title skeleton-pulse"></div>
            <div className="skeleton-desc skeleton-pulse"></div>
            <div className="skeleton-footer skeleton-pulse"></div>
        </div>
    </div>
);

const CoursesSection = ({ limit = 6, showHeader = true }) => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const response = await fetch('http://localhost:3000/enrollment/classes');
                if (!response.ok) throw new Error('Failed to fetch');
                const data = await response.json();
                setCourses(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchCourses();
    }, []);

    const displayedCourses = limit ? courses.slice(0, limit) : courses;

    return (
        <section className="courses-section">
            <div className="container">
                {showHeader && (
                    <div className="section-header courses-header">
                        <div className="header-left">
                            <h2 className="courses-title">Explore Popular Courses</h2>
                            <div className="title-line"></div>
                        </div>
                    </div>
                )}

                <div className="courses-grid">
                    {loading ? (
                        Array(limit > 0 ? limit : 8).fill(0).map((_, i) => <CourseSkeleton key={i} />)
                    ) : (
                        displayedCourses.map((course, index) => (
                            <Link to={`/course/${course.ID}`} key={course.ID} className="course-card-link">
                                <div className="course-card">
                                    <div className="course-image">
                                        <img
                                            src={course.Thumbnail || `https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=800`}
                                            alt={course.Name}
                                        />
                                    </div>
                                    <div className="course-body">
                                        <span className="course-price">
                                            {Number(course.Fee) === 0 ? 'Free' : `$${Number(course.Fee).toFixed(2)}`}
                                        </span>
                                        <h3 className="course-card-title">{course.Name}</h3>
                                        
                                        <p className="course-short-intro">{course.ShortIntro}</p>

                                        <div className="course-rating">
                                            <div className="stars">
                                                {[1, 2, 3, 4, 5].map(s => (
                                                    <Star 
                                                        key={s} 
                                                        size={14} 
                                                        fill={s <= Math.round(course.AverageRating || 5) ? "#FFB800" : "none"} 
                                                        color="#FFB800" 
                                                    />
                                                ))}
                                            </div>
                                            <span className="review-count">({course.ReviewsCount || 0} Reviews)</span>
                                        </div>

                                        <div className="course-meta-footer">
                                            <div className="meta-item">
                                                <div className="meta-icon-box">
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
                                                </div>
                                                <span>{course.ModulesCount || 0} Modules</span>
                                            </div>
                                            <div className="meta-item">
                                                <User size={14} />
                                                <span>{course.TeacherName || 'Expert Tutor'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))
                    )}
                </div>
            </div>
        </section>
    );
};

export default CoursesSection;
