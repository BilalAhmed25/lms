import React from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import { Home, ArrowLeft, Search } from 'lucide-react';
import './NotFound.css';

const NotFound = () => {
    return (
        <div className="not-found-page">
            <SEO 
                title="Page Not Found" 
                description="The page you are looking for could not be found on Deenova Learning Hub."
            />
            <div className="container">
                <div className="not-found-content animate-fade-in">
                    <div className="error-code-wrapper">
                        <h1 className="error-code">404</h1>
                        <div className="error-decoration">
                            <div className="circle circle-1"></div>
                            <div className="circle circle-2"></div>
                            <div className="circle circle-3"></div>
                        </div>
                    </div>

                    <div className="text-content">
                        <h2 className="error-title">Oops! Page Not Found</h2>
                        <p className="error-description">
                            The page you're looking for doesn't exist or has been moved.
                            Let's get you back on track to your learning journey.
                        </p>

                        {/* <div className="search-bar-minimal">
                            <Search size={20} className="search-icon" />
                            <input type="text" placeholder="Search for courses..." />
                        </div> */}

                        <div className="action-buttons">
                            <Link to="/" className="btn btn-primary">
                                <Home size={18} />
                                <span>Back to Home</span>
                            </Link>
                            <Link to="/courses" className="btn btn-outline">
                                <ArrowLeft size={18} />
                                <span>Browse Courses</span>
                            </Link>
                        </div>
                    </div>

                    {/* <div className="suggested-links">
                        <p>Popular Links:</p>
                        <div className="links-row">
                            <Link to="/about-us">About Us</Link>
                            <Link to="/contact-us">Contact</Link>
                            <Link to="/student-dashboard">My Dashboard</Link>
                        </div>
                    </div> */}
                </div>
            </div>
        </div>
    );
};

export default NotFound;
