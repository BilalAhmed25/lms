import React from 'react';
import './ContactHero.css';
import { Mail, Phone, MapPin } from 'lucide-react';

const ContactHero = () => {
    return (
        <section className="contact-hero">
            <div className="contact-hero-bg">
                <div className="hero-shape shape-1"></div>
                <div className="hero-shape shape-2"></div>
                <div className="hero-dot-pattern"></div>
            </div>
            
            <div className="container contact-hero-grid">
                <div className="hero-content">
                    <div className="breadcrumb">
                        <span>Home</span> / <span className="active">Contact Us</span>
                    </div>
                    <h1 className="hero-title">
                        Let's Start a <span className="text-primary">Conversation</span>
                    </h1>
                    <p className="hero-subtitle">
                        Have a question or just want to say hi? We'd love to hear from you. 
                        Our team is here to help you navigate your learning journey.
                    </p>
                    
                    <div className="quick-contact">
                        <div className="quick-item">
                            <div className="icon-box"><Phone size={20} /></div>
                            <div className="info">
                                <span>Call us directly</span>
                                <p>+1 (234) 567-890</p>
                            </div>
                        </div>
                        <div className="quick-item">
                            <div className="icon-box"><Mail size={20} /></div>
                            <div className="info">
                                <span>Email support</span>
                                <p>hello@deenova.com</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="hero-image-area">
                    <div className="hero-img-wrapper">
                        <img 
                            src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=1000" 
                            alt="Contact Deenova" 
                        />
                        <div className="floating-badge support-badge">
                            <div className="badge-icon">🎧</div>
                            <div className="badge-text">
                                <strong>24/7 Support</strong>
                                <span>Always here for you</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ContactHero;
