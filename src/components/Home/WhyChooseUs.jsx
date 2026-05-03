import { Link } from 'react-router-dom';
import { Globe, GraduationCap, Laptop, ArrowRight } from 'lucide-react';
import './WhyChooseUs.css';

const WhyChooseUs = () => {
    const cards = [
        {
            title: "Global Teacher Network",
            desc: "Learn from highly qualified educators specialized in international curricula and Islamic studies.",
            icon: <Globe />
        },
        {
            title: "Verified Student Success",
            desc: "Our alumni consistently secure admissions in top universities and excel in professional life.",
            icon: <GraduationCap />
        },
        {
            title: "Integrated LMS Experience",
            desc: "Manage your courses, assignments, and live sessions all in one secure, easy-to-use platform.",
            icon: <Laptop />
        }
    ];

    return (
        <section className="why-us-section">
            <div className="container">
                <div className="section-header">
                    <span className="section-subtitle-small">WHY DEENOVA</span>
                    <h2 className="why-us-title">A platform built by educators, for learners.</h2>
                </div>

                <div className="why-us-grid">
                    {cards.map((card, index) => (
                        <div key={index} className="why-us-card">
                            <div className="card-header">
                                <div className="card-icon-small">{card.icon}</div>
                                <h4>{card.title}</h4>
                            </div>
                            <div className="card-image">
                                <img
                                    src={[
                                        'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=600',
                                        'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=600',
                                        'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=600'
                                    ][index]}
                                    alt={card.title}
                                />
                            </div>
                            <div className="card-body">
                                <p>{card.desc}</p>
                                <Link to="/courses" className="enroll-link">
                                    <span>Enroll Now</span>
                                    <ArrowRight size={18} />
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default WhyChooseUs;
