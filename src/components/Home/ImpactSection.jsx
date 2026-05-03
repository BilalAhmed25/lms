import React from 'react';
import './ImpactSection.css';

const ImpactSection = () => {
    return (
        <section className="impact-section">
            <div className="impact-main">
                <div className="container impact-grid">
                    <div className="impact-image">
                        <img
                            src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=800"
                            alt="Islamic learning"
                        />
                    </div>
                    <div className="impact-content">
                        <h2 className="impact-title">
                            Connecting brilliant minds for a brighter, more enlightened future
                        </h2>
                        <p className="impact-desc text-light">
                            Our platform breaks geographical barriers, allowing students from every corner of the world
                            to access expert guidance and comprehensive learning materials.
                        </p>
                        <button className="btn impact-btn">Explore Courses</button>
                    </div>
                </div>
            </div>

            <div className="container">
                <div className="impact-stats-bar glass">
                    <div className="stats-info">
                        <h3>Seamless Learning Through Our Custom LMS</h3>
                        <p>Our integrated learning management system provides a distraction-free, feature-rich environment designed specifically for student-teacher collaboration.</p>
                    </div>
                    <div className="stats-number-box">
                        <span className="stats-percent">+95%</span>
                        <span className="stats-label">Exam Success Rate</span>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ImpactSection;
