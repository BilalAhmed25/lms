import React from 'react';
import './ValuesSection.css';

const ValuesSection = () => {
    return (
        <section className="values-detail-section section">
            <div className="container">
                <div className="values-row">
                    <div className="values-left">
                        <span className="section-subtitle-small">OUR VALUES</span>
                        <h2 className="values-title">Curiosity & <br />Creativity</h2>
                    </div>
                    <div className="values-right">
                        <p>
                            We believe that by nurturing these qualities, we unlock the potential for 
                            groundbreaking innovations in digital learning. Our relentless curiosity 
                            propels us to explore new technologies, while our boundless creativity 
                            allows us to envision and actualize unique educational solutions.
                        </p>
                        <p>
                            Our dedication to curiosity and creativity enables us to stay at the 
                            forefront of the education industry, delivering cutting-edge features 
                            and empowering our students to bring their boldest ideas to life.
                        </p>
                    </div>
                </div>

                <div className="values-row mt-12">
                    <div className="values-left">
                        <span className="section-subtitle-small">OUR MISSION</span>
                        <h2 className="values-title">Leading the Way <br />in Digital Education</h2>
                    </div>
                    <div className="values-right">
                        <p>
                            At Deenova, we are driven by a set of core values that guide our every 
                            endeavor. Innovation is at the heart of everything we do, as we 
                            constantly seek new and better ways to empower our students and 
                            tutors worldwide.
                        </p>
                        <p>
                            We foster a culture of collaboration, encouraging diverse perspectives 
                            and ideas to flourish. Transparency and integrity are paramount, 
                            ensuring trust and reliability in all our interactions. Lastly, we 
                            embrace sustainability, striving to minimize our environmental impact.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ValuesSection;
