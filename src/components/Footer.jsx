import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, ChevronRight } from 'lucide-react';
import '../styles/Footer.css';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="container">
                {/* Main Footer Links */}
                <div className="footer-grid">
                    <div className="footer-brand">
                        <Link to="/" className="logo mb-4">
                            <img src="/logo.png" alt="Deenova Logo" className="logo-img" style={{ filter: 'brightness(0) invert(1)' }} />
                        </Link>
                        <p>
                            Empowering learners worldwide through a state-of-the-art Islamic LMS. We blend academic excellence with spiritual growth, providing a comprehensive platform for O & A Level students and lifelong learners.
                        </p>
                    </div>

                    <div className="footer-links-column">
                        <h4>Pricing</h4>
                        <ul>
                            <li>
                                <ChevronRight size={14} className="link-chevron" />
                                <Link to="/courses">O Level Pricing</Link>
                            </li>
                            <li>
                                <ChevronRight size={14} className="link-chevron" />
                                <Link to="/courses">A Level Pricing</Link>
                            </li>
                            <li>
                                <ChevronRight size={14} className="link-chevron" />
                                <Link to="/courses">Islamic Courses</Link>
                            </li>
                        </ul>
                    </div>

                    <div className="footer-links-column">
                        <h4>Quick Links</h4>
                        <ul>
                            <li>
                                <ChevronRight size={14} className="link-chevron" />
                                <Link to="/">Home</Link>
                            </li>
                            <li>
                                <ChevronRight size={14} className="link-chevron" />
                                <Link to="/about-us">About Us</Link>
                            </li>
                            <li>
                                <ChevronRight size={14} className="link-chevron" />
                                <Link to="/courses">Our Courses</Link>
                            </li>
                            <li>
                                <ChevronRight size={14} className="link-chevron" />
                                <Link to="/contact-us">Contact Us</Link>
                            </li>
                        </ul>
                    </div>

                    <div className="footer-links-column">
                        <h4>Contact Details</h4>
                        <ul>
                            <li>
                                <Mail size={16} className="contact-icon" />
                                <span>info@deenova.com</span>
                            </li>
                            <li>
                                <Phone size={16} className="contact-icon" />
                                <span>+92 300 1234567</span>
                            </li>
                            <li>
                                <MapPin size={16} className="contact-icon" />
                                <span>Islamabad, Pakistan</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="footer-bottom mt-12 pt-8">
                    <p style={{ color: 'rgba(255,255,255,0.5)' }}>© 2026 Deenova Inc.</p>
                    <div className="footer-legal">
                        <Link to="/terms-and-condition">Terms and Conditions</Link>
                        <Link to="/privacy-policy">Privacy Policy</Link>
                        <Link to="/privacy-policy#cookies">Cookies</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
