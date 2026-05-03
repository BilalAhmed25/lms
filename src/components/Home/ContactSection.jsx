import React from 'react';
import './ContactSection.css';
import { Mail, Phone, MessageSquare, User, BookOpen } from 'lucide-react';
import FloatingLabelInput from '../FloatingLabelInput';

const ContactSection = () => {
    return (
        <section className="contact-section">
            <div className="container contact-grid">
                <div className="contact-info-card">
                    <span className="section-subtitle-small light">GET IN TOUCH</span>
                    <h2 className="contact-title">Start your journey with Deenova today</h2>
                    <p className="contact-desc">
                        Have questions about our courses or the LMS? Our support team is here to help you get started.
                    </p>

                    <div className="contact-methods">
                        <div className="method-item">
                            <Mail size={20} />
                            <span>info@deenova.edu</span>
                        </div>
                        <div className="method-item">
                            <Phone size={20} />
                            <span>+44 20 7123 4567</span>
                        </div>
                    </div>

                    <button className="btn chat-btn">
                        <MessageSquare size={18} />
                        Chat with an Advisor
                    </button>
                </div>

                <div className="contact-form-card glass">
                    <h2 className="form-title">Request a Consultation</h2>
                    <p className="form-desc">
                        Let us know which courses you're interested in, and our academic team will reach out to you within 24 hours.
                    </p>

                    <form className="quote-form">
                        <div className="form-row">
                            <FloatingLabelInput
                                label="Full Name"
                                icon={User}
                                type="text"
                                name="name"
                                required
                            />
                            <FloatingLabelInput
                                label="Email Address"
                                icon={Mail}
                                type="email"
                                name="email"
                                required
                            />
                        </div>
                        <div className="form-row">
                            <FloatingLabelInput
                                label="Phone Number"
                                icon={Phone}
                                type="tel"
                                name="phone"
                                required
                            />
                            <FloatingLabelInput
                                label="Subject of Interest"
                                icon={BookOpen}
                                type="text"
                                name="subject"
                                required
                            />
                        </div>
                        <FloatingLabelInput
                            label="Tell us about your learning goals..."
                            icon={MessageSquare}
                            type="textarea"
                            name="message"
                            required
                        />
                        <button type="submit" className="btn submit-btn">Send Inquiry</button>
                    </form>
                </div>
            </div>
        </section>
    );
};

export default ContactSection;
