import React from 'react';
import { X, XCircle } from 'lucide-react';
import '../styles/Sidebar.css';

const Sidebar = ({ 
    user, 
    activeTab, 
    setActiveTab, 
    logout, 
    menuItems, 
    mobileMenuOpen, 
    setMobileMenuOpen 
}) => {
    return (
        <aside className={`dashboard-sidebar ${mobileMenuOpen ? 'mobile-open' : ''}`}>
            <div className="sidebar-header">
                <img src="/logo.png" alt="Deenova Logo" className="sidebar-logo-img" />
                <button className="mobile-close-btn" onClick={() => setMobileMenuOpen(false)}>
                    <X size={24} />
                </button>
            </div>

            <div className="sidebar-user-profile">
                <div className="user-avatar-container">
                    {user?.Name?.charAt(0) || 'U'}
                </div>
                <div className="user-details">
                    <h4>{user?.Name || 'User'}</h4>
                    <span>{user?.Email || 'user@deenova.edu'}</span>
                </div>
            </div>

            <nav className="sidebar-navigation">
                {menuItems.map((item) => (
                    <button 
                        key={item.id}
                        className={activeTab === item.id ? 'active' : ''} 
                        onClick={() => { 
                            setActiveTab(item.id); 
                            setMobileMenuOpen(false); 
                        }}
                    >
                        <item.icon size={20} /> 
                        <span className="menu-label">{item.label}</span>
                        {item.badge > 0 && <span className={`sidebar-badge ${activeTab === item.id ? 'badge-active' : ''}`}>{item.badge}</span>}
                    </button>
                ))}
            </nav>

            <div className="sidebar-footer">
                <button className="sidebar-logout-btn" onClick={() => { logout(); window.location.href = '/'; }}>
                    <XCircle size={20} /> <span>Sign Out</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
