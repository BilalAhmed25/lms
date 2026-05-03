import React from 'react';
import './AboutSection.css';
import { Star } from 'lucide-react';

const AboutSection = () => {
    return (
        <section className="about-section">
            <div className="about-bg-elements">
                <div className="bg-shape shape-1"></div>
                <div className="bg-shape shape-2"></div>
                <div className="bg-shape shape-3"></div>
                <div className="bg-dot-grid"></div>
            </div>
            <div className="container about-grid">
                <div className="about-content">
                    <span className="section-subtitle-small">WHO WE ARE</span>
                    <h2 className="about-title">
                        Empowering global learners to excel in O & A Levels and beyond.
                    </h2>
                    <p className="about-desc">
                        Deenova is a premier global learning platform that brings together dedicated teachers and ambitious students.
                        We specialize in Cambridge O/A Levels, Teacher Training, Personality Development, and Islamic Studies,
                        all delivered through our state-of-the-art integrated LMS.
                    </p>

                    <div className="about-stats-modern">
                        <div className="user-avatars-group">
                            <div className="user-avatars">
                                {[1, 2, 3, 4].map(i => (
                                    <img key={i} src={`https://i.pravatar.cc/100?u=${i}`} alt="User" />
                                ))}
                                <div className="avatar-more">+12k</div>
                            </div>
                            <p className="avatars-label">Global Learning Community</p>
                        </div>

                        <div className="divider-line"></div>

                        <div className="reviews-horizontal">
                            <div className="rating-box">
                                <span className="stat-number">4.9+</span>
                                <div className="stars">
                                    {[1, 2, 3, 4, 5].map((s) => (
                                        <Star key={s} size={14} fill="var(--accent)" color="var(--accent)" />
                                    ))}
                                </div>
                            </div>
                            <div className="stat-info">
                                <p className="stat-name">Learner Satisfaction</p>
                                <p className="stat-sub">Trusted by thousands of students across 50+ countries.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="about-image-wrapper">
                    <div className="image-container">
                        <img
                            src="https://images.unsplash.com/photo-1584697964400-2af6a2f6204c?auto=format&fit=crop&q=80&w=800"
                            alt="Students learning"
                            className="main-img"
                        />
                        <div className="experience-badge">
                            <span className="exp-num text-light">15+</span>
                            <span className="exp-text text-light">Years Experience</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default AboutSection;
