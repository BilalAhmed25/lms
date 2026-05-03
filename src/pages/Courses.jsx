import React from 'react';
import SEO from '../components/SEO';
import CoursesHero from '../components/Home/CoursesHero';
import CoursesSection from '../components/Home/CoursesSection';
import ContactSection from '../components/Home/ContactSection';
import FAQSection from '../components/Home/FAQSection';

const Courses = () => {
    return (
        <div className="courses-page-wrapper animate-fade-in">
            <SEO 
                title="All Courses" 
                description="Explore our full catalog of professional courses. From web development to digital marketing, find the perfect course to advance your career."
            />
            <CoursesHero />
            <CoursesSection limit={0} showHeader={false} />
            <ContactSection />
            <FAQSection />
        </div>
    );
};

export default Courses;
