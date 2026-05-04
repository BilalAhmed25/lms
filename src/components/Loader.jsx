import React from 'react';

const Loader = ({ fullPage = true }) => {
    return (
        <div className={`premium-loader-container ${fullPage ? "full-page" : "container-fill"}`}>
            <div className="pulse-logo-wrapper">
                <img src="/logo.png" alt="Loading..." className="pulse-logo" />
                <div className="pulse-ring"></div>
            </div>
        </div>
    );
};

export default Loader;


