import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="container">
                {/* Newsletter Section */}
                <div className="footer-newsletter glass">
                    <div className="newsletter-content">
                        <h3>Join our newsletter to keep up to date with us!</h3>
                    </div>
                    <div className="newsletter-form">
                        <div className="newsletter-input-wrapper">
                            <Mail size={18} className="input-icon" />
                            <input type="email" placeholder="Enter your email" />
                        </div>
                        <button className="btn btn-primary">Subscribe</button>
                    </div>
                </div>

                {/* Main Footer Links */}
                <div className="footer-grid mt-12">
                    <div className="footer-brand">
                        <Link to="/" className="logo mb-4">
                            <img src="/logo.png" alt="Deenova Logo" className="logo-img" />
                        </Link>
                        <p className="text-muted mt-4">
                            We are growing your knowledge with our premium learning management system.
                        </p>
                    </div>

                    <div className="footer-links-column">
                        <h4>Platform</h4>
                        <ul>
                            <li><Link to="/">Plans & Pricing</Link></li>
                            <li><Link to="/">Personal AI Manager</Link></li>
                            <li><Link to="/">AI Business Writer</Link></li>
                        </ul>
                    </div>

                    <div className="footer-links-column">
                        <h4>Company</h4>
                        <ul>
                            <li><Link to="/">Blog</Link></li>
                            <li><Link to="/">Careers</Link></li>
                            <li><Link to="/">News</Link></li>
                        </ul>
                    </div>

                    <div className="footer-links-column">
                        <h4>Resources</h4>
                        <ul>
                            <li><Link to="/">Documentation</Link></li>
                            <li><Link to="/">Papers</Link></li>
                            <li><Link to="/">Press Conferences</Link></li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="footer-bottom mt-12 pt-8">
                    <p className="text-muted">© 2026 Deenova Inc.</p>
                    <div className="footer-legal">
                        <Link to="/">Terms of Service</Link>
                        <Link to="/">Privacy Policy</Link>
                        <Link to="/">Cookies</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
