import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { LogOut, User, BookOpen, LayoutDashboard, UserPlus, LogIn, Menu, X, Home, Info, Mail, Phone, Users, Heart, ChevronRight } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [scrolled, setScrolled] = React.useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

    React.useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = () => {
        logout();
        setMobileMenuOpen(false);
        navigate('/');
    };

    return (
        <nav className={`navbar ${scrolled ? 'scrolled' : ''} ${mobileMenuOpen ? 'mobile-open' : ''}`}>
            <div className="container nav-content">
                <Link to="/" className="logo" onClick={() => setMobileMenuOpen(false)}>
                    <span className="logo-text">Deenova</span>
                </Link>

                {/* Mobile Toggle Button */}
                <button className="mobile-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                    {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
                </button>

                <div className={`nav-elements ${mobileMenuOpen ? 'active' : ''}`}>
                    <div className="mobile-menu-header">
                        <span className="logo-text">Deenova</span>
                        <button className="mobile-close" onClick={() => setMobileMenuOpen(false)}>
                            <X size={24} />
                        </button>
                    </div>

                    <div className="nav-links">
                        <Link to="/" className="nav-link" onClick={() => setMobileMenuOpen(false)}>
                            <div className="nav-link-left">
                                <Home size={18} className="nav-icon" />
                                <span>Home</span>
                            </div>
                            <ChevronRight size={16} className="nav-chevron" />
                        </Link>
                        <Link to="/about-us" className="nav-link" onClick={() => setMobileMenuOpen(false)}>
                            <div className="nav-link-left">
                                <Info size={18} className="nav-icon" />
                                <span>About Us</span>
                            </div>
                            <ChevronRight size={16} className="nav-chevron" />
                        </Link>
                        <Link to="/courses" className="nav-link" onClick={() => setMobileMenuOpen(false)}>
                            <div className="nav-link-left">
                                <BookOpen size={18} className="nav-icon" />
                                <span>Courses</span>
                            </div>
                            <ChevronRight size={16} className="nav-chevron" />
                        </Link>
                        <Link to="/contact-us" className="nav-link" onClick={() => setMobileMenuOpen(false)}>
                            <div className="nav-link-left">
                                <Mail size={18} className="nav-icon" />
                                <span>Contact Us</span>
                            </div>
                            <ChevronRight size={16} className="nav-chevron" />
                        </Link>
                    </div>

                    <div className="nav-actions">
                        {user ? (
                            <div className="user-nav-group">
                                <Link to={
                                    user.Role === 'Admin' ? '/admin-dashboard' :
                                        user.Role === 'Teacher' ? '/teacher-dashboard' : '/student-dashboard'
                                } className="btn btn-secondary" onClick={() => setMobileMenuOpen(false)}>
                                    Dashboard
                                </Link>
                                <button onClick={handleLogout} className="logout-btn">
                                    <LogOut size={20} />
                                    <span>Logout</span>
                                </button>
                            </div>
                        ) : (
                            <div className="auth-btns">
                                <Link to="/login" className="nav-link auth-link" onClick={() => setMobileMenuOpen(false)}>
                                    <LogIn size={18} className="nav-icon" />
                                    <span>Login</span>
                                </Link>
                                <span className="nav-separator"></span>
                                <Link to="/register" className="nav-link auth-link" onClick={() => setMobileMenuOpen(false)}>
                                    <UserPlus size={18} className="nav-icon" />
                                    <span>Sign Up</span>
                                </Link>
                            </div>
                        )}
                    </div>

                    <div className="mobile-footer">
                        <div className="mobile-contact-info">
                            <a href="mailto:info@deenova.edu" className="mobile-contact-item">
                                <Mail size={16} />
                                <span>info@deenova.edu</span>
                            </a>
                            <a href="tel:+442071234567" className="mobile-contact-item">
                                <Phone size={16} />
                                <span>+44 20 7123 4567</span>
                            </a>
                        </div>
                        <div className="mobile-socials">
                            <div className="social-mini-box"><Users size={16} /></div>
                            <div className="social-mini-box"><Heart size={16} /></div>
                            <div className="social-mini-box"><Info size={16} /></div>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
