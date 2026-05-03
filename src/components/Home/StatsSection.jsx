import React from 'react';
import './StatsSection.css';

const StatsSection = () => {
    const progressStats = [
        { label: "O/A Level Distinctions", value: 88 },
        { label: "Teacher Skill Enhancement", value: 94 },
        { label: "Student Engagement Rate", value: 92 },
        { label: "Spiritual Growth Index", value: 85 }
    ];

    return (
        <section className="stats-section">
            <div className="container stats-grid">
                <div className="stats-content-card glass">
                    <span className="section-subtitle-small">OUR PERFORMANCE</span>
                    <h2 className="stats-title">Measuring success through student achievement.</h2>
                    <p className="stats-desc">
                        We take pride in the tangible progress our students make across academic, personal, and spiritual dimensions.
                    </p>

                    <div className="progress-list">
                        {progressStats.map((stat, index) => (
                            <div key={index} className="progress-item">
                                <div className="progress-header">
                                    <span className="progress-label">{stat.label}</span>
                                    <span className="progress-value">{stat.value}%</span>
                                </div>
                                <div className="progress-bar-bg">
                                    <div
                                        className="progress-bar-fill"
                                        style={{ width: `${stat.value}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="stats-visual-card">
                    <img
                        src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=1000"
                        alt="Academic Achievement"
                    />
                </div>
            </div>
        </section>
    );
};

export default StatsSection;
