import React from 'react';
import './AboutHero.css';
import { Target, Eye, Users } from 'lucide-react';

const AboutHero = () => {
    return (
        <section className="about-hero">
            <div className="about-hero-bg">
                <div className="hero-shape shape-1"></div>
                <div className="hero-shape shape-2"></div>
                <div className="hero-dot-pattern"></div>
            </div>
            
            <div className="container about-hero-grid">
                <div className="hero-content">
                    <div className="breadcrumb">
                        <span>Home</span> / <span className="active">About Us</span>
                    </div>
                    <h1 className="hero-title">
                        Excellence in <span className="text-primary">Digital Education</span>
                    </h1>
                    <p className="hero-subtitle">
                        Deenova is more than just an LMS. We are a community of educators 
                        and learners dedicated to breaking barriers in O and A Level education 
                        through innovation and accessibility.
                    </p>
                    
                    <div className="about-stats-row">
                        <div className="about-stat-item">
                            <div className="stat-icon-box"><Target size={20} /></div>
                            <div className="stat-text">
                                <strong>Our Mission</strong>
                                <p>To democratize quality education for everyone.</p>
                            </div>
                        </div>
                        <div className="about-stat-item">
                            <div className="stat-icon-box"><Eye size={20} /></div>
                            <div className="stat-text">
                                <strong>Our Vision</strong>
                                <p>To be the world's most trusted learning partner.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="hero-image-area">
                    <div className="about-img-stack">
                        <div className="main-img-wrapper">
                            <img 
                                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=1000" 
                                alt="Deenova Team" 
                            />
                        </div>
                        <div className="experience-card">
                            <div className="exp-num">10+</div>
                            <div className="exp-text">Years of Educational <br /> Excellence</div>
                        </div>
                        <div className="student-badge">
                            <Users size={20} />
                            <span>15K+ Active Students</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default AboutHero;
