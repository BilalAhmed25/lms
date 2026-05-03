import React from 'react';
import './ExpertiseSection.css';
import { CheckCircle2 } from 'lucide-react';

const ExpertiseSection = () => {
    const features = [
        "Measurable proven results",
        "Innovative real solutions",
        "Customized business strategies",
        "Reliable expert guidance",
        "Multi-industry expertise",
        "Support for long-term"
    ];

    return (
        <section className="expertise-section section">
            <div className="container expertise-container">
                <div className="expertise-image">
                    <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=800" alt="Expert Educator" />
                </div>
                
                <div className="expertise-content">
                    <div className="expertise-tag">ABOUT US</div>
                    <h2 className="expertise-title">
                        Unlock our expertise to drive success across industries.
                    </h2>
                    <p className="expertise-desc">
                        Leverage our deep industry knowledge and innovative strategies to accelerate your growth. 
                        Our tailored solutions ensure success across diverse sectors by addressing your 
                        unique challenges and opportunities.
                    </p>
                    
                    <div className="expertise-features">
                        {features.map((feature, index) => (
                            <div className="feature-item" key={index}>
                                <CheckCircle2 className="feature-icon" size={20} />
                                <span>{feature}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ExpertiseSection;
