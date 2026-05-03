import React from 'react';
import CoursesHero from '../components/Home/CoursesHero';
import CoursesSection from '../components/Home/CoursesSection';
import ContactSection from '../components/Home/ContactSection';
import FAQSection from '../components/Home/FAQSection';

const Courses = () => {
    return (
        <div className="courses-page-wrapper animate-fade-in">
            <CoursesHero />
            <CoursesSection limit={0} showHeader={false} />
            <ContactSection />
            <FAQSection />
        </div>
    );
};

export default Courses;
