import React from 'react';
import './EcosystemSection.css';
import { ArrowRight, Users, Trophy, Lightbulb } from 'lucide-react';

const EcosystemSection = () => {
    return (
        <section className="ecosystem-section">
            <div className="container">
                {/* Top Grid Area */}
                <div className="ecosystem-top">
                    <div className="top-header">
                        <div className="header-text">
                            <h2 className="ecosystem-title">Building the Future of <br />Global Education</h2>
                        </div>
                        <div className="header-meta">
                            <div className="avatar-group">
                                <img src="https://ui-avatars.com/api/?name=User+1&background=1ab69d&color=fff" alt="User" />
                                <img src="https://ui-avatars.com/api/?name=User+2&background=f8b81f&color=fff" alt="User" />
                                <img src="https://ui-avatars.com/api/?name=User+3&background=ee4a62&color=fff" alt="User" />
                                <div className="avatar-plus">50+</div>
                            </div>
                            <p className="meta-desc">Join our growing community of educators and ambitious learners from around the world.</p>
                        </div>
                    </div>

                    <div className="top-grid">
                        <div className="grid-main-img">
                            <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=800" alt="Learning environment" />
                        </div>
                        <div className="grid-cards">
                            <div className="card-blue">
                                <Users className="card-icon" size={24} />
                                <h3>Expert Learning Ecosystem</h3>
                                <p>
                                    Our curriculum provides structured learning paths meticulously designed for O/A levels and professional certifications.
                                    Benefit from comprehensive study guides, interactive resources, and real-time support from global subject matter experts.
                                </p>
                                <div className="card-arrow"><ArrowRight size={16} /></div>
                            </div>
                            <div className="card-white">
                                <span className="stat-num">250+</span>
                                <span className="stat-label">Certified Tutors</span>
                                <p>Hand-picked experts dedicated to student success.</p>
                            </div>
                        </div>
                        <div className="grid-side-img">
                            <img src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=800" alt="Teacher" />
                            <div className="img-overlay">
                                <button className="btn-overlay">Learn More <ArrowRight size={16} /></button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Grid Area */}
                <div className="ecosystem-bottom">
                    <div className="bottom-content">
                        <h2 className="ecosystem-title">Collaborate to Build a <br />Success-Driven Journey</h2>
                        <p className="bottom-desc">
                            Our platform integrates the latest pedagogical techniques with a robust LMS infrastructure,
                            ensuring every student can reach their maximum potential.
                        </p>
                        <div className="feature-btns">
                            <div className="feature-item">
                                <div className="feature-icon"><Lightbulb size={20} /></div>
                                <div className="feature-text">
                                    <h4>Modern Teaching Strategies</h4>
                                    <p>Adaptive learning tailored to your pace.</p>
                                </div>
                            </div>
                            <div className="feature-item">
                                <div className="feature-icon"><Trophy size={20} /></div>
                                <div className="feature-text">
                                    <h4>Track Your Milestones</h4>
                                    <p>Real-time progress and achievement badges.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="bottom-visuals">
                        <div className="visual-large">
                            <img src="https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&q=80&w=800" alt="Success team" />
                        </div>
                        <div className="visual-small-group">
                            <div className="small-card">
                                <h3>Community is Key to Success</h3>
                                <p>Learn together, grow together with global peers.</p>
                                <button className="btn-link">View More <ArrowRight size={16} /></button>
                            </div>
                            <div className="small-img">
                                <img src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=400" alt="Student" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default EcosystemSection;
