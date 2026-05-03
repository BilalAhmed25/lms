import React from 'react';
import AboutHero from '../components/Home/AboutHero';
import VisionMissionSection from '../components/About/VisionMissionSection';
import ValuesSection from '../components/About/ValuesSection';
import Testimonials from '../components/Home/Testimonials';
import FAQSection from '../components/Home/FAQSection';

const AboutUs = () => {
    return (
        <div className="about-page animate-fade-in">
            <AboutHero />
            <VisionMissionSection />
            <ValuesSection />
            <Testimonials />
            <FAQSection />
        </div>
    );
};

export default AboutUs;
