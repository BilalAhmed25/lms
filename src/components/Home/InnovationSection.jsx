import React from 'react';
import './InnovationSection.css';
import { ArrowRight, Trophy, Lightbulb } from 'lucide-react';

const InnovationSection = () => {
    return (
        <section className="innovation-section">
            <div className="container">
                <div className="innovation-grid">
                    <div className="innovation-content">
                        <h2 className="innovation-title">Collaborate to Build a <br />Success-Driven Journey</h2>
                        <p className="innovation-desc">
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
                    <div className="innovation-visuals">
                        <div className="visual-large">
                            <img src="https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&q=80&w=800" alt="Success team" />
                        </div>
                        <div className="visual-small-group">
                            <div className="small-card">
                                <h3>Community is Key to Success</h3>
                                <p>Learn together, grow together with global peers.</p>
                                <button className="btn-link">View More <ArrowRight size={14} /></button>
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

export default InnovationSection;
