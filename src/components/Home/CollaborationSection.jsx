import React from 'react';
import './CollaborationSection.css';
import { ArrowRight, Users } from 'lucide-react';

const CollaborationSection = () => {
    return (
        <section className="collaboration-section">
            <div className="container">
                <div className="top-header">
                    <div className="header-text">
                        <h2 className="collaboration-title">Building the Future of <br />Global Education</h2>
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

                <div className="collaboration-grid">
                    <div className="grid-main-img">
                        <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=800" alt="Learning environment" />
                    </div>
                    <div className="grid-cards">
                        <div className="card-blue">
                            <Users className="card-icon" size={20} />
                            <h3>Expert Learning Ecosystem</h3>
                            <p className='text-light'>Structured paths meticulously designed for O/A levels and professional certifications.</p>
                            <div className="card-arrow"><ArrowRight size={14} /></div>
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
        </section>
    );
};

export default CollaborationSection;
