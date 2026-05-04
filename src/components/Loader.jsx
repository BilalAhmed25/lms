import React from 'react';

const Loader = () => {
    return (
        <div className="premium-loader-container">
            <div className="pulse-logo-wrapper">
                <img src="/logo.png" alt="Loading..." className="pulse-logo" />
                <div className="pulse-ring"></div>
            </div>
        </div>
    );
};

export default Loader;
