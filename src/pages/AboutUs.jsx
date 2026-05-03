import React from 'react';
import AboutHero from '../components/Home/AboutHero';
import ExpertiseSection from '../components/About/ExpertiseSection';
import VisionMissionSection from '../components/About/VisionMissionSection';
import ValuesSection from '../components/About/ValuesSection';
import ImpactSection from '../components/Home/ImpactSection';
import Testimonials from '../components/Home/Testimonials';
import FAQSection from '../components/Home/FAQSection';

const AboutUs = () => {
    return (
        <div className="about-page animate-fade-in">
            <AboutHero />
            <ExpertiseSection />
            <VisionMissionSection />
            <ValuesSection />
            <ImpactSection />
            <Testimonials />
            <FAQSection />
        </div>
    );
};

export default AboutUs;
