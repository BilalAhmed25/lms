import React, { useState, useEffect } from 'react';
import { ChevronUp } from 'lucide-react';
import '../styles/ScrollToTopButton.css';

const ScrollToTopButton = () => {
    const [isVisible, setIsVisible] = useState(false);

    // Show button when page is scrolled up to a certain distance
    const toggleVisibility = () => {
        const scrolled = window.pageYOffset;
        const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = scrolled / totalHeight;
        
        // Update SVG progress path
        const path = document.querySelector('.scroll-progress-path');
        if (path) {
            const pathLength = 307.919;
            path.style.strokeDashoffset = pathLength - (progress * pathLength);
        }

        if (scrolled > 300) {
            setIsVisible(true);
        } else {
            setIsVisible(false);
        }
    };

    // Set the top coordinate to 0 and make scrolling smooth
    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };

    useEffect(() => {
        window.addEventListener("scroll", toggleVisibility);
        return () => window.removeEventListener("scroll", toggleVisibility);
    }, []);

    return (
        <div className={`scroll-to-top ${isVisible ? 'visible' : ''}`} onClick={scrollToTop}>
            <div className="scroll-progress-circle">
                <svg viewBox="0 0 100 100">
                    <path
                        className="scroll-progress-path"
                        d="M50,1 a49,49 0 0,1 0,98 a49,49 0 0,1 0,-98"
                        style={{
                            transition: 'stroke-dashoffset 10ms linear 0s'
                        }}
                    />
                </svg>
            </div>
            <ChevronUp size={24} className="scroll-icon" />
        </div>
    );
};

export default ScrollToTopButton;
