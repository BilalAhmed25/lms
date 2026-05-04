import React from 'react';
import { Search, Bell } from 'lucide-react';
import '../styles/DashboardHeader.css';

const DashboardHeader = ({
    left,
    right,
    user,
    showSearch = true,
    searchPlaceholder = "Search..."
}) => {
    return (
        <header className="dashboard-header-modern">
            <div className="header-left-slot">
                {left}
            </div>

            <div className="header-right-slot">
                <div className="header-actions-group">
                    {showSearch && (
                        <div className="header-search-container">
                            <Search size={18} />
                            <input type="text" placeholder={searchPlaceholder} />
                        </div>
                    )}
                    <div className="header-standard-meta">
                        <button className="meta-btn-icon relative">
                            <Bell size={20} />
                            <span className="meta-notification-dot"></span>
                        </button>
                    </div>
                    {right && (
                        <div className="header-custom-right">
                            {right}
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default DashboardHeader;
