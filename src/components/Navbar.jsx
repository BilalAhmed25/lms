import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { LogOut, User, BookOpen, LayoutDashboard, UserPlus, LogIn } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="container nav-content">
        <Link to="/" className="logo">
          <span className="logo-icon">🎓</span>
          <span className="logo-text">LMS<span className="text-primary">Pro</span></span>
        </Link>

        <div className="nav-links">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/about" className="nav-link">About Us</Link>
          <Link to="/courses" className="nav-link">Courses</Link>
          <Link to="/contact" className="nav-link">Contact Us</Link>
        </div>

        <div className="nav-actions">
          {user ? (
            <div className="user-nav-group">
              <Link to={
                user.RoleName === 'Admin' || user.RoleName === 'SuperAdmin' ? '/admin-dashboard' :
                user.RoleName === 'Teacher' ? '/teacher-dashboard' : '/student-dashboard'
              } className="btn btn-secondary btn-sm">
                Dashboard
              </Link>
              <button onClick={handleLogout} className="logout-btn" title="Logout">
                <LogOut size={20} />
              </button>
            </div>
          ) : (
            <div className="auth-btns">
              <Link to="/login" className="nav-link auth-link">
                <LogIn size={18} />
                Login
              </Link>
              <span className="nav-separator"></span>
              <Link to="/register" className="nav-link auth-link">
                <UserPlus size={18} />
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
