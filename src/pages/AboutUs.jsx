import React from 'react';
import SEO from '../components/SEO';
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
            <SEO 
                title="About Us" 
                description="Learn about Deenova Learning Hub's mission, vision, and the team behind our premium educational ecosystem."
            />
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
