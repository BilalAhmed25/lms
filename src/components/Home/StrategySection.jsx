import React from 'react';
import './StrategySection.css';
import { Play, Target, Zap } from 'lucide-react';

const StrategySection = () => {
    return (
        <section className="strategy-section">
            <div className="strategy-grid">
                <div className="strategy-visual">
                    <img
                        src="https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&q=80&w=1000"
                        alt="Global Islamic education"
                    />
                    <div className="play-btn-wrapper">
                        <div className="play-btn">
                            <Play fill="white" size={24} />
                        </div>
                    </div>
                </div>

                <div className="strategy-content">
                    <div className="content-inner">
                        <h2 className="strategy-title">
                            From foundation to mastery, we guide you every step.
                        </h2>
                        <p className="strategy-desc text-light">
                            Our structured approach ensures that every student receives the attention
                            and resources needed to transition from basic understanding to complete mastery.
                        </p>

                        <ul className="strategy-list">
                            <li>
                                <div className="list-icon">
                                    <Zap size={24} color="var(--accent)" />
                                </div>
                                <div className="list-text">
                                    <h4>Focused Academic Excellence</h4>
                                    <p className='text-light'>Tailored lesson plans and regular assessments to ensure top grades in O and A Level examinations.</p>
                                </div>
                            </li>
                            <li>
                                <div className="list-icon">
                                    <Target size={24} color="var(--accent)" />
                                </div>
                                <div className="list-text">
                                    <h4>Holistic Growth Target</h4>
                                    <p className='text-light'>Integrating character building and spiritual values into the learning journey for a balanced personality.</p>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default StrategySection;
