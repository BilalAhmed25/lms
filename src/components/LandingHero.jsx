import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star } from 'lucide-react';

const LandingHero = ({ title, description, image, showRating = true, children }) => {
    return (
        <section className="landing-hero animate-fade-in" style={{ backgroundImage: `linear-gradient(rgba(255,255,255,0.9), rgba(255,255,255,0.9)), url(${image})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
            <div className="hero-bg-blobs">
                <div className="blob blob-1"></div>
                <div className="blob blob-2"></div>
            </div>
            <div className="container hero-container">
                <div className="hero-left">
                    
                    <h1>{title}</h1>
                    <p className="description">{description}</p>
                    
                    {!children && (
                        <div className="hero-btns">
                            <Link to="/login" className="btn-hero-login">Log in</Link>
                            <Link to="/register" className="btn-hero-started">
                                Get Started <ArrowRight size={18} />
                            </Link>
                        </div>
                    )}
                    
                    <div className="community-section animate-slide-up">
                        <div className="community-avatars-group">
                            <div className="avatar-stack">
                                <img src="/avatar_1_1777900066709.png" alt="Student" />
                                <img src="/avatar_2_1777900089528.png" alt="Student" />
                                <img src="/avatar_3_1777900106859.png" alt="Student" />
                                <img src="/avatar_4_1777900122932.png" alt="Student" />
                                <div className="avatar-count">+12k</div>
                            </div>
                            <span className="community-label">Global Learning Community</span>
                        </div>
                        
                        <div className="community-separator"></div>

                        <div className="community-stats">
                            <div className="stats-top">
                                <span className="rating-number">4.9+</span>
                                <div className="stars-group">
                                    <Star size={16} fill="currentColor" />
                                    <Star size={16} fill="currentColor" />
                                    <Star size={16} fill="currentColor" />
                                    <Star size={16} fill="currentColor" />
                                    <Star size={16} fill="currentColor" />
                                </div>
                            </div>
                            <div className="stats-bottom">
                                <strong>Learner Satisfaction</strong>
                                <span>Trusted by thousands of students across 50+ countries.</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="hero-right">
                    {children ? children : (
                        <div className="hero-image-wrapper">
                            <img src={image} alt="Hero" />
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default LandingHero;
