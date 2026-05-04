import React from 'react';

const Skeleton = ({ width, height, borderRadius, className = "" }) => {
    const style = {
        width: width || '100%',
        height: height || '20px',
        borderRadius: borderRadius || 'var(--br-sm)',
    };

    return (
        <div 
            className={`skeleton-loader ${className}`} 
            style={style}
        />
    );
};

export default Skeleton;
