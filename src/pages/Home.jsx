import React from 'react';
import { useAuth } from '../App';

// Import new sections
import AboutSection from '../components/Home/AboutSection';
import ImpactSection from '../components/Home/ImpactSection';
import SolutionsSection from '../components/Home/SolutionsSection';
import StrategySection from '../components/Home/StrategySection';
import WhyChooseUs from '../components/Home/WhyChooseUs';
import StatsSection from '../components/Home/StatsSection';
import ContactSection from '../components/Home/ContactSection';
import Testimonials from '../components/Home/Testimonials';
import CoursesSection from '../components/Home/CoursesSection';
import CollaborationSection from '../components/Home/CollaborationSection';
import InnovationSection from '../components/Home/InnovationSection';
import FAQSection from '../components/Home/FAQSection';

const Home = () => {
    const { user } = useAuth();

    return (
        <div className="home-page animate-fade-in">
            {/* 1. About Section (Intro) */}
            <AboutSection />

            {/* 3. Courses Section (Popular) */}
            <CoursesSection limit={8} />

            {/* 2. Impact Section (Banner) */}
            <ImpactSection />

            {/* 4. Collaboration Section (Community & Growth) */}
            <CollaborationSection />

            {/* 6. Solutions Section (What we offer) */}
            <SolutionsSection />

            {/* 7. Strategy Section (Split) */}
            <StrategySection />

            {/* 5. Innovation Section (Tech & Strategy) */}
            <InnovationSection />

            {/* 8. Why Choose Us Section (Cards) */}
            <WhyChooseUs />

            {/* 9. Stats Section (Results) */}
            <StatsSection />

            {/* 10. Contact Section (In touch) */}
            <ContactSection />

            {/* 11. Testimonials Section */}
            <Testimonials />

            {/* 12. FAQ Section */}
            <FAQSection />
        </div>
    );
};

export default Home;
