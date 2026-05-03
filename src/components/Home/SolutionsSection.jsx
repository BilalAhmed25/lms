import React from 'react';
import './SolutionsSection.css';
import { Book, UserCheck, Heart, Moon, Zap, Globe } from 'lucide-react';

const SolutionsSection = () => {
    const solutions = [
        {
            title: "O & A Levels",
            desc: "Expert-led preparation for Cambridge examinations with comprehensive study materials and mock tests.",
            icon: <Book size={32} />
        },
        {
            title: "Teacher Training",
            desc: "Advanced pedagogical courses designed to empower educators with modern teaching methodologies.",
            icon: <UserCheck size={32} />
        },
        {
            title: "Personality Development",
            desc: "Unlock your full potential with soft skills, leadership training, and confidence building programs.",
            icon: <Zap size={32} />
        },
        {
            title: "Islamic Studies",
            desc: "Deepen your understanding of Islam through structured courses on Quran, Hadith, and Islamic History.",
            icon: <Moon size={32} />
        },
        {
            title: "Skills Development",
            desc: "Practical courses in technology, communication, and creative arts to prepare you for the future.",
            icon: <Heart size={32} />
        },
        {
            title: "Global Community",
            desc: "Connect with peers and mentors from diverse backgrounds in a safe, moderated learning environment.",
            icon: <Globe size={32} />
        }
    ];

    return (
        <section className="solutions-section">
            <div className="container">
                <div className="solutions-header">
                    <div className="header-left">
                        <span className="section-subtitle-small">OUR SPECIALIZATIONS</span>
                        <h2 className="solutions-title">Comprehensive learning solutions for every stage.</h2>
                    </div>
                    {/* <div className="header-right">
                        <p className="solutions-desc">
                            From rigorous academic preparation to personal and spiritual growth,
                            we offer a curated selection of courses tailored for the modern learner.
                        </p>
                        <button className="btn solutions-btn">View Catalog</button>
                    </div> */}
                </div>

                <div className="solutions-grid">
                    {solutions.map((item, index) => (
                        <div key={index} className="solution-card">
                            <div className="solution-icon">{item.icon}</div>
                            <h4 className="solution-card-title">{item.title}</h4>
                            <p className="solution-card-desc">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default SolutionsSection;
