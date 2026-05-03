import React from 'react';
import './CoursesHero.css';
import { BookOpen, GraduationCap, Award } from 'lucide-react';

const CoursesHero = () => {
    return (
        <section className="courses-hero">
            <div className="courses-hero-bg">
                <div className="hero-shape shape-1"></div>
                <div className="hero-shape shape-2"></div>
                <div className="hero-dot-pattern"></div>
            </div>

            <div className="container courses-hero-grid">
                <div className="hero-content">
                    <div className="breadcrumb">
                        <span>Home</span> / <span className="active">Courses</span>
                    </div>
                    <h1 className="hero-title">
                        Master Your Future with <br />
                        <span className="text-primary">Premium Learning</span>
                    </h1>
                    <p className="hero-subtitle">
                        Explore our comprehensive range of O and A Level courses designed
                        by industry experts to help you achieve academic excellence.
                    </p>

                    <div className="quick-stats">
                        <div className="stat-pill">
                            <div className="stat-icon"><BookOpen size={18} /></div>
                            <div className="stat-info">
                                <strong>50+</strong>
                                <span>Subject Modules</span>
                            </div>
                        </div>
                        <div className="stat-pill">
                            <div className="stat-icon"><GraduationCap size={18} /></div>
                            <div className="stat-info">
                                <strong>Certified</strong>
                                <span>Qualified & Expert Tutors</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="hero-image-area">
                    <div className="hero-img-wrapper">
                        <img
                            src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=1000"
                            alt="Deenova Courses"
                        />
                        <div className="floating-badge course-badge">
                            <div className="badge-icon"><Award size={24} color="var(--primary)" /></div>
                            <div className="badge-text">
                                <strong>Top Rated</strong>
                                <span>Cambridge Curriculum</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default CoursesHero;
