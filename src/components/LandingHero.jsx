import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star } from 'lucide-react';

const LandingHero = ({ title, description, image, showRating = true, children }) => {
    return (
        <section className="landing-hero animate-fade-in" style={{ backgroundImage: `linear-gradient(rgba(255,255,255,0.9), rgba(255,255,255,0.9)), url(${image})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
            <div className="hero-left">
                {showRating && (
                    <div className="rating-badge">
                        <Star size={16} fill="#f8b81f" stroke="#f8b81f" />
                        <span>4.9 Rating <span className="sub">by Global Students</span></span>
                    </div>
                )}
                
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
                
                <div className="trusted-by">
                    <p>Trusted by industry leaders</p>
                    <div className="logos-grid">
                        <div className="logo-item">Google</div>
                        <div className="logo-item">Microsoft</div>
                        <div className="logo-item">Amazon</div>
                        <div className="logo-item">Meta</div>
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
        </section>
    );
};

export default LandingHero;
