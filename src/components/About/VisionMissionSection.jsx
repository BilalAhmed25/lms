import React from 'react';
import './VisionMissionSection.css';
import { Users, Mail, Phone, Heart, Zap, Info, Globe, Shield, Star } from 'lucide-react';

const VisionMissionSection = () => {
    return (
        <section className="vision-mission-section section">
            <div className="container">
                <div className="vision-header centered">
                    <h2 className="vision-title">Empowering Growth Through Innovation</h2>
                    <p className="vision-desc">
                        Deenova is dedicated to revolutionizing the educational landscape by providing
                        accessible, high-quality learning experiences for students across the globe.
                    </p>
                </div>

                <div className="bento-grid">
                    {/* Main Visual Card */}
                    <div className="bento-item item-main-image">
                        <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=1200" alt="Students learning" />
                        <div className="image-overlay-text">
                            <h3>Future-Ready Learning</h3>
                        </div>
                    </div>

                    {/* Stats & Icons Group */}
                    <div className="bento-item item-stat-card primary-bg">
                        <div className="icon-wrapper">
                            <Users size={24} />
                        </div>
                        <div className="stat-content">
                            <span className="stat-value" style={{ color: 'white' }}>15k+</span>
                            <span className="stat-label" style={{ color: 'white' }}>Active Learners</span>
                        </div>
                    </div>

                    <div className="bento-item item-stat-card secondary-bg">
                        <div className="icon-wrapper">
                            <Star size={24} />
                        </div>
                        <div className="stat-content">
                            <span className="stat-value">4.9/5</span>
                            <span className="stat-label">Course Rating</span>
                        </div>
                    </div>

                    {/* Mission Card (Tall) */}
                    <div className="bento-item item-mission-tall">
                        <div className="mission-tag">Our Mission</div>
                        <h3 className="mission-heading">Bridge the gap between potential and opportunity.</h3>
                        <p>We provide the tools and mentorship needed for every student to excel in their academic journey.</p>
                        <div className="mission-icons">
                            <div className="mini-icon"><Zap size={18} /></div>
                            <div className="mini-icon"><Globe size={18} /></div>
                            <div className="mini-icon"><Shield size={18} /></div>
                        </div>
                    </div>

                    {/* Detail Cards */}
                    <div className="bento-item item-detail-card">
                        <span className="detail-num">01</span>
                        <h4>Expert Tutors</h4>
                        <p>Learn from a globally recognized faculty of industry leaders, certified educators, and subject matter experts who are dedicated to your academic and professional success.</p>
                    </div>

                    <div className="bento-item item-detail-card">
                        <span className="detail-num">02</span>
                        <h4>Global Community</h4>
                        <p>Join a diverse network of learners from over 50 countries. Engage in collaborative projects and expand your perspective through our multicultural learning environment.</p>
                    </div>

                    <div className="bento-item item-detail-card dark-bg">
                        <span className="detail-num">03</span>
                        <h4>Modern LMS</h4>
                        <p>Experience a seamless learning journey with our state-of-the-art platform, featuring interactive video lessons, real-time tracking, and adaptive learning paths.</p>
                    </div>

                    <div className="bento-item item-detail-card">
                        <span className="detail-num">04</span>
                        <h4>Career Success</h4>
                        <p>Gain the skills that employers value most. From O/A Level mastery to professional certifications, we prepare you for the competitive global job market.</p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default VisionMissionSection;
